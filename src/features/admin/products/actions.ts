'use server';

import { db } from '@/lib/db';
import { products, productsI18N, productTools } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createProductSchema, updateProductSchema, type CreateProductSchema, type UpdateProductSchema } from './schema';

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
        await db.transaction(async (tx) => {
            // 1. Create product base
            const [newProduct] = await tx.insert(products).values({
                type: validated.data.type,
                category: validated.data.category,
                billingCycle: validated.data.billingCycle,
                productCode: validated.data.productCode,
                paddleProductId: validated.data.paddleProductId,
                paddlePriceId: validated.data.paddlePriceId,
                iconImageUrl: validated.data.iconImageUrl,
                isActive: validated.data.isActive,
            }).returning();

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
                paddleProductId: validated.data.paddleProductId,
                paddlePriceId: validated.data.paddlePriceId,
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
export async function searchToolsAction(query: string = '') {
    const { db } = await import('@/lib/db');
    const { tools, toolI18N } = await import('@/lib/db/schema');
    const { or, ilike, sql } = await import('drizzle-orm');

    const searchPattern = `%${query}%`;
    const results = await db
        .select({
            id: tools.id,
            toolCode: tools.toolCode,
            name: sql<string>`COALESCE(
                (SELECT ${toolI18N.name} FROM ${toolI18N} 
                 WHERE ${toolI18N.toolId} = ${tools.id} 
                 ORDER BY (CASE WHEN ${toolI18N.languageCode} = 'KR' THEN 1 WHEN ${toolI18N.languageCode} = 'EN' THEN 2 ELSE 3 END) 
                 LIMIT 1),
                ${tools.toolCode}
            )`,
        })
        .from(tools)
        .where(
            query ? or(
                ilike(tools.toolCode, searchPattern),
                sql`EXISTS (SELECT 1 FROM tool_i18n WHERE tool_id = ${tools.id} AND name ILIKE ${searchPattern})`
            ) : undefined
        )
        .limit(20);

    return results;
}
