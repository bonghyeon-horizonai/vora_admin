'use server';

import { db } from '@/lib/db';
import { products, productsI18N, productTools } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createProductSchema, updateProductSchema, type CreateProductSchema, type UpdateProductSchema } from './schema';
import { paddle } from '@/lib/paddle';

export type ActionResponse = {
    success: boolean;
    error?: string;
};

export async function createProductAction(data: CreateProductSchema): Promise<ActionResponse> {
    const validated = createProductSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: 'Invalid input data' };
    }
    try {
        let createdProductId: string;
        await db.transaction(async (tx) => {
            // 1. Create product base
            const [newProduct] = await tx.insert(products).values({
                type: validated.data.type,
                category: validated.data.category,
                billingCycle: validated.data.billingCycle,
                productCode: validated.data.productCode,
                paddleMetadata: {
                    productId: validated.data.paddleProductId || undefined,
                    priceId: validated.data.paddlePriceId || undefined,
                },
                iconImageUrl: validated.data.iconImageUrl,
                isActive: validated.data.isActive,
            }).returning();
            createdProductId = newProduct.id;

            // 2. Create i18n entries
            if (validated.data.i18n.length > 0) {
                await tx.insert(productsI18N).values(
                    validated.data.i18n.map(item => ({
                        productId: newProduct.id,
                        languageCode: item.languageCode,
                        name: item.name,
                        description: item.description,
                        currencyCode: item.currencyCode,
                        price: item.price,
                        currentPrice: item.currentPrice,
                    }))
                );
            }

            // 3. Create tool bundle entries
            if (validated.data.tools.length > 0) {
                await tx.insert(productTools).values(
                    validated.data.tools.map(tool => ({
                        productId: newProduct.id,
                        toolId: tool.toolId,
                        quotaAllocation: tool.quotaAllocation,
                        sortOrder: tool.sortOrder,
                    }))
                );
            }
        });

        // Automatically sync with Paddle
        if (createdProductId!) {
            await syncPaddleProductAction(createdProductId);
        }

        revalidatePath('/products/list');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed to create product' };
    }
}

export async function updateProductAction(id: string, data: UpdateProductSchema): Promise<ActionResponse> {
    const validated = updateProductSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: 'Invalid input data' };
    }

    try {
        await db.transaction(async (tx) => {
            // 1. Update product base
            await tx.update(products).set({
                type: validated.data.type,
                category: validated.data.category,
                billingCycle: validated.data.billingCycle,
                productCode: validated.data.productCode,
                paddleMetadata: {
                    productId: validated.data.paddleProductId || undefined,
                    priceId: validated.data.paddlePriceId || undefined,
                },
                iconImageUrl: validated.data.iconImageUrl,
                isActive: validated.data.isActive,
                updatedAt: new Date().toISOString(),
            }).where(eq(products.id, id));

            // 2. Update i18n (delete and recreate for simplicity in this case, or match and update)
            await tx.delete(productsI18N).where(eq(productsI18N.productId, id));
            await tx.insert(productsI18N).values(
                validated.data.i18n.map(item => ({
                    productId: id,
                    languageCode: item.languageCode,
                    name: item.name,
                    description: item.description,
                    currencyCode: item.currencyCode,
                    price: item.price,
                    currentPrice: item.currentPrice,
                }))
            );

            // 3. Update tool bundles (delete and recreate)
            await tx.delete(productTools).where(eq(productTools.productId, id));
            if (validated.data.tools.length > 0) {
                await tx.insert(productTools).values(
                    validated.data.tools.map(tool => ({
                        productId: id,
                        toolId: tool.toolId,
                        quotaAllocation: tool.quotaAllocation,
                        sortOrder: tool.sortOrder,
                    }))
                );
            }
        });

        // Automatically sync with Paddle
        await syncPaddleProductAction(id);

        revalidatePath('/products/list');
        revalidatePath(`/products/list/${id}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed to update product' };
    }
}

export async function deleteProductAction(id: string): Promise<ActionResponse> {
    try {
        await db.update(products).set({
            deletedAt: new Date().toISOString(),
            isActive: false,
        }).where(eq(products.id, id));

        revalidatePath('/products/list');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed to delete product' };
    }
}

/**
 * Search tools for bundling
 */
export async function searchToolsAction(query: string = '', locale: string = 'ko') {
    const { db } = await import('@/lib/db');
    const { tools, toolI18N } = await import('@/lib/db/schema');
    const { or, ilike, sql, aliasedTable, and, eq } = await import('drizzle-orm');

    const searchPattern = `%${query}%`;
    const targetName = aliasedTable(toolI18N, 'target_name');
    const krName = aliasedTable(toolI18N, 'kr_name');
    const enName = aliasedTable(toolI18N, 'en_name');
    const dbLocale = locale === 'en' ? 'EN' : locale === 'jp' ? 'JP' : 'KR';
    const results = await db
        .select({
            id: tools.id,
            toolCode: tools.toolCode,
            name: sql<string>`COALESCE(${targetName.name}, ${krName.name}, ${enName.name}, ${tools.toolCode})`,
        })
        .from(tools)
        .leftJoin(targetName, and(eq(tools.id, targetName.toolId), eq(targetName.languageCode, dbLocale as any)))
        .leftJoin(krName, and(eq(tools.id, krName.toolId), eq(krName.languageCode, 'KR')))
        .leftJoin(enName, and(eq(tools.id, enName.toolId), eq(enName.languageCode, 'EN')))
        .where(
            query ? or(
                ilike(tools.toolCode, searchPattern),
                ilike(targetName.name, searchPattern),
                ilike(krName.name, searchPattern),
                ilike(enName.name, searchPattern)
            ) : undefined
        )
        .limit(20);

    return results;
}

/**
 * Sync product and price with Paddle
 */
export async function syncPaddleProductAction(productId: string): Promise<{ success: boolean; error?: string; paddleProductId?: string; paddlePriceId?: string }> {
    try {
        const { getProductById } = await import('./queries');
        const product = await getProductById(productId, 'EN'); // Get English version for Paddle
        if (!product) {
            return { success: false, error: 'Product not found' };
        }

        const enI18n = product.i18n.find(i => i.languageCode === 'EN');
        const krI18n = product.i18n.find(i => i.languageCode === 'KR');
        const jpI18n = product.i18n.find(i => i.languageCode === 'JP');

        const usdPrice = enI18n?.price || '0';
        const krwPrice = krI18n?.price || '0';
        const jpyPrice = jpI18n?.price || '0';

        const productName = enI18n?.name || product.productCode || 'Unnamed Product';

        // 1. Handle Product in Paddle
        const currentMetadata: any = product.paddleMetadata || {};
        let paddleProductId = currentMetadata.productId;
        if (paddleProductId) {
            // Update existing
            await paddle.products.update(paddleProductId, {
                name: productName,
                description: enI18n?.description || undefined,
            });
        } else {
            // Create new
            const newPaddleProduct = await paddle.products.create({
                name: productName,
                taxCategory: 'standard',
                description: enI18n?.description || undefined,
            });
            paddleProductId = newPaddleProduct.id;
        }

        // 2. Handle Price in Paddle
        let paddlePriceId = currentMetadata.priceId;

        // Prepare price data
        const priceData: any = {
            description: `${productName} Price`,
            productId: paddleProductId,
            unitPrice: {
                amount: Math.round(parseFloat(usdPrice) * 100).toString(), // USD cents
                currencyCode: 'USD',
            },
            unitPriceOverrides: [
                {
                    countryCodes: ['KR'],
                    unitPrice: {
                        amount: Math.round(parseFloat(krwPrice)).toString(), // KRW 0 decimals
                        currencyCode: 'KRW',
                    },
                },
                {
                    countryCodes: ['JP'],
                    unitPrice: {
                        amount: Math.round(parseFloat(jpyPrice)).toString(), // JPY 0 decimals
                        currencyCode: 'JPY',
                    },
                },
            ],
        };

        // Add billing cycle for subscriptions
        if (product.type === 'SUBSCRIPTION') {
            if (product.billingCycle === 'MONTHLY') {
                priceData.billingCycle = { interval: 'month', frequency: 1 };
            } else if (product.billingCycle === 'YEARLY') {
                priceData.billingCycle = { interval: 'year', frequency: 1 };
            }
        }

        if (paddlePriceId) {
            // Update existing with full data (unitPrice, overrides, etc.)
            await paddle.prices.update(paddlePriceId, priceData);
        } else {
            // Create new
            const newPaddlePrice = await paddle.prices.create(priceData);
            paddlePriceId = newPaddlePrice.id;
        }

        // 3. Update DB
        await db.update(products).set({
            paddleMetadata: {
                ...currentMetadata,
                productId: paddleProductId,
                priceId: paddlePriceId,
                syncedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
        }).where(eq(products.id, productId));

        revalidatePath(`/products/list/${productId}`);
        return { success: true, paddleProductId, paddlePriceId };
    } catch (e: any) {
        console.error('Paddle Sync Error:', e);
        return { success: false, error: e.message || 'Failed to sync with Paddle' };
    }
}
