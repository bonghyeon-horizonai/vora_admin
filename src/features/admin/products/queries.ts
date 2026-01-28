import { db } from '@/lib/db';
import { products, productsI18N, productTools, tools, toolI18N } from '@/lib/db/schema';
import { eq, and, or, ilike, desc, asc, sql, inArray } from 'drizzle-orm';
import type { ProductListParams, ProductListItem, ProductWithDetails } from './types';

/**
 * Get paginated list of products with search and filter
 */
export async function getProductList(params: ProductListParams = {}): Promise<{
    data: ProductListItem[];
    total: number;
    page: number;
    pageSize: number;
}> {
    const {
        search = '',
        status = 'all',
        page = 1,
        pageSize = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        locale = 'ko'
    } = params;
    const offset = (page - 1) * pageSize;

    // Map UI locale to DB language code
    const dbLanguageCode = locale === 'en' ? 'EN' : locale === 'jp' ? 'JP' : 'KR';

    // Build where conditions
    const conditions = [];

    // Status filter
    if (status === 'active') {
        conditions.push(eq(products.isActive, true));
    } else if (status === 'inactive') {
        conditions.push(eq(products.isActive, false));
    }

    // Add search condition if provided
    if (search) {
        const searchPattern = `%${search}%`;
        // Need to search in i18n names and descriptions
        const searchResults = await db
            .select({ productId: productsI18N.productId })
            .from(productsI18N)
            .where(
                or(
                    ilike(productsI18N.name, searchPattern),
                    ilike(productsI18N.description, searchPattern)
                )
            );

        const productIds = searchResults.map(r => r.productId);

        if (productIds.length > 0) {
            conditions.push(inArray(products.id, productIds));
        } else {
            // If search query exists but no matches found, return empty results
            return {
                data: [],
                total: 0,
                page,
                pageSize,
            };
        }
    }

    // Dynamic sort column
    const sortExpression = (() => {
        switch (sortBy) {
            case 'name':
                return sql`${productsI18N.name} COLLATE "C"`;
            case 'isActive':
                return products.isActive;
            case 'createdAt':
                return products.createdAt;
            default:
                return products.createdAt;
        }
    })();

    // Get total count
    const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...conditions));
    const total = Number(countResult[0]?.count ?? 0);

    // Get paginated data
    const rawData = await db
        .select({
            id: products.id,
            isActive: products.isActive,
            createdAt: products.createdAt,
            billingCycle: products.billingCycle,
            name: productsI18N.name,
            price: productsI18N.price,
            currencyCode: productsI18N.currencyCode,
        })
        .from(products)
        .leftJoin(
            productsI18N,
            and(
                eq(products.id, productsI18N.productId),
                eq(productsI18N.languageCode, dbLanguageCode),
                eq(productsI18N.currencyCode, 'USD') // Display USD price by default as per req
            )
        )
        .where(and(...conditions))
        .orderBy(sortOrder === 'desc' ? desc(sortExpression) : asc(sortExpression))
        .limit(pageSize)
        .offset(offset);

    // Map to ProductListItem
    const data: ProductListItem[] = rawData.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        currencyCode: item.currencyCode,
        isActive: item.isActive,
        createdAt: item.createdAt,
        billingCycle: item.billingCycle,
    }));

    return {
        data,
        total,
        page,
        pageSize,
    };
}

/**
 * Get a single product by ID with full details
 */
export async function getProductById(id: string): Promise<ProductWithDetails | null> {
    const productBase = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

    if (!productBase[0]) return null;

    const i18n = await db
        .select()
        .from(productsI18N)
        .where(eq(productsI18N.productId, id));

    const bundledTools = await db
        .select({
            id: productTools.id,
            toolId: productTools.toolId,
            toolCode: tools.toolCode,
            name: sql<string>`COALESCE(
                (SELECT ${toolI18N.name} FROM ${toolI18N} 
                 WHERE ${toolI18N.toolId} = ${tools.id} 
                 ORDER BY (CASE WHEN ${toolI18N.languageCode} = 'KR' THEN 1 WHEN ${toolI18N.languageCode} = 'EN' THEN 2 ELSE 3 END) 
                 LIMIT 1),
                ${tools.toolCode}
            )`,
            quotaAllocation: productTools.quotaAllocation,
            sortOrder: productTools.sortOrder,
        })
        .from(productTools)
        .innerJoin(tools, eq(productTools.toolId, tools.id))
        .where(eq(productTools.productId, id))
        .orderBy(asc(productTools.sortOrder));

    return {
        ...productBase[0],
        i18n,
        tools: bundledTools.map(t => ({
            ...t,
            sortOrder: t.sortOrder ?? 0,
        })),
    };
}
