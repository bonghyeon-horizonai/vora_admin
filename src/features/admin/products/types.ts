import { products, productsI18N } from '@/lib/db/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Base types from schema
export type Product = InferSelectModel<typeof products>;
export type ProductInsert = InferInsertModel<typeof products>;
export type ProductI18n = InferSelectModel<typeof productsI18N>;
export type ProductI18nInsert = InferInsertModel<typeof productsI18N>;

// Language codes
export type LanguageCode = 'KR' | 'EN' | 'JP';

// Product Tool Bundle item
export interface ProductToolItem {
    id: string; // product_tools.id
    toolId: string;
    toolCode: string | null;
    name: string | null;
    quotaAllocation: number | null;
    sortOrder: number;
}

// Full product detail with i18n and tools
export interface ProductWithDetails extends Product {
    i18n: ProductI18n[];
    tools: ProductToolItem[];
}

// Product list item for table display
export interface ProductListItem {
    id: string;
    name: string | null;
    usdPrice: string | null;
    krwPrice: string | null;
    jpyPrice: string | null;
    isActive: boolean | null;
    createdAt: string | null;
    billingCycle: string | null;
}

// Query params for list
export interface ProductListParams {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    locale?: string;
}
