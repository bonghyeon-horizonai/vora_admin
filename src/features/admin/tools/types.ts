import { tools, toolI18N, workflows } from '@/lib/db/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Base types from schema
export type Tool = InferSelectModel<typeof tools>;
export type ToolInsert = InferInsertModel<typeof tools>;
export type ToolI18n = InferSelectModel<typeof toolI18N>;
export type ToolI18nInsert = InferInsertModel<typeof toolI18N>;
export type Workflow = InferSelectModel<typeof workflows>;

// Language codes
export type LanguageCode = 'KR' | 'EN' | 'JP';

// I18n input for form
export interface ToolI18nInput {
    languageCode: LanguageCode;
    name: string;
    description: string;
}

// Tool with i18n data for detail view
export interface ToolWithI18n extends Tool {
    i18n: ToolI18n[];
}

// Tool list item for table display
export interface ToolListItem {
    id: string;
    toolCode: string | null;
    category: Tool['category'];
    isActive: boolean | null;
    isFree: boolean | null;
    tier: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    // i18n name (primary language)
    name: string | null;
}

// Input types for actions
export interface CreateToolInput {
    category: Tool['category'];
    toolCode: string;
    internalUsageLimit?: number | null;
    isFree: boolean;
    tier?: number | null;
    iconImageUrl?: string | null;
    isActive: boolean;
    i18n: ToolI18nInput[];
}

export interface UpdateToolInput {
    category?: Tool['category'];
    toolCode?: string;
    internalUsageLimit?: number | null;
    isFree?: boolean;
    tier?: number | null;
    iconImageUrl?: string | null;
    isActive?: boolean;
    i18n?: ToolI18nInput[];
}

// Query params for list
export interface ToolListParams {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    locale?: string;
}

// Workflow option for select dropdown
export interface WorkflowOption {
    id: string;
    workflowId: string | null;
    name: string | null;
}
