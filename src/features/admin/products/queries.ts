import { db } from '@/lib/db';
import { products, productsI18N, productTools, tools, toolI18N } from '@/lib/db/schema';
import { eq, and, or, ilike, desc, asc, sql, inArray, aliasedTable } from 'drizzle-orm';
import type { ProductListParams, ProductListItem, ProductWithDetails, PaddleMetadata } from './types';

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

    const nameI18n = aliasedTable(productsI18N, 'name_i18n');
    const enNameI18n = aliasedTable(productsI18N, 'en_name_i18n');
    const usdPriceI18n = aliasedTable(productsI18N, 'usd_price_i18n');
    const krwPriceI18n = aliasedTable(productsI18N, 'krw_price_i18n');
    const jpyPriceI18n = aliasedTable(productsI18N, 'jpy_price_i18n');

    // Dynamic sort column
    const sortExpression = (() => {
        switch (sortBy) {
            case 'name':
                return sql`COALESCE(${nameI18n.name}, ${enNameI18n.name}) COLLATE "C"`;
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
            name: sql<string>`COALESCE(${nameI18n.name}, ${enNameI18n.name})`,
            usdPrice: usdPriceI18n.price,
            krwPrice: krwPriceI18n.price,
            jpyPrice: jpyPriceI18n.price,
        })
        .from(products)
        .leftJoin(
            nameI18n,
            and(
                eq(products.id, nameI18n.productId),
                eq(nameI18n.languageCode, dbLanguageCode)
            )
        )
        .leftJoin(
            enNameI18n,
            and(
                eq(products.id, enNameI18n.productId),
                eq(enNameI18n.languageCode, 'EN')
            )
        )
        .leftJoin(
            usdPriceI18n,
            and(
                eq(products.id, usdPriceI18n.productId),
                eq(usdPriceI18n.currencyCode, 'USD')
            )
        )
        .leftJoin(
            krwPriceI18n,
            and(
                eq(products.id, krwPriceI18n.productId),
                eq(krwPriceI18n.currencyCode, 'KRW')
            )
        )
        .leftJoin(
            jpyPriceI18n,
            and(
                eq(products.id, jpyPriceI18n.productId),
                eq(jpyPriceI18n.currencyCode, 'JPY')
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
        usdPrice: item.usdPrice,
        krwPrice: item.krwPrice,
        jpyPrice: item.jpyPrice,
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
export async function getProductById(id: string, locale: string = 'ko'): Promise<ProductWithDetails | null> {
    const dbLocale = locale === 'en' ? 'EN' : locale === 'jp' ? 'JP' : 'KR';
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

    const targetName = aliasedTable(toolI18N, 'target_name');
    const krName = aliasedTable(toolI18N, 'kr_name');
    const enName = aliasedTable(toolI18N, 'en_name');

    const bundledTools = await db
        .select({
            id: productTools.id,
            toolId: productTools.toolId,
            toolCode: tools.toolCode,
            name: sql<string>`COALESCE(${targetName.name}, ${krName.name}, ${enName.name}, ${tools.toolCode})`,
            quotaAllocation: productTools.quotaAllocation,
            sortOrder: productTools.sortOrder,
        })
        .from(productTools)
        .innerJoin(tools, eq(productTools.toolId, tools.id))
        .leftJoin(targetName, and(eq(tools.id, targetName.toolId), eq(targetName.languageCode, dbLocale as any)))
        .leftJoin(krName, and(eq(tools.id, krName.toolId), eq(krName.languageCode, 'KR')))
        .leftJoin(enName, and(eq(tools.id, enName.toolId), eq(enName.languageCode, 'EN')))
        .where(eq(productTools.productId, id))
        .orderBy(asc(productTools.sortOrder));

    return {
        ...productBase[0],
        paddleMetadata: productBase[0].paddleMetadata as unknown as PaddleMetadata | null,
        i18n,
        tools: bundledTools.map(t => ({
            ...t,
            sortOrder: t.sortOrder ?? 0,
        })),
    };
}
