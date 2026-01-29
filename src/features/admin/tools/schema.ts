import { z } from "zod";

// Language codes enum
export const languageCodeEnum = z.enum(["KR", "EN", "JP"]);

// Tool category enum (matching DB enum)
export const toolCategoryEnum = z.enum([
  "SEARCH",
  "GENERATION",
  "OPERATION",
  "DOCUMENTS",
  "UTILITY",
  "KNOWLEDGE_BASE",
  "AMUSEMENT",
]);

// I18n schema for each language
export const toolI18nSchema = z.object({
  languageCode: languageCodeEnum,
  name: z.string().min(1, "도구명을 입력해주세요"),
  description: z.string().default(""),
});

// Create tool schema
export const createToolSchema = z.object({
  category: toolCategoryEnum.nullable(),
  toolCode: z.string().min(1, "도구 코드를 입력해주세요"),
  internalUsageLimit: z.number().int().positive().optional().nullable(),
  isFree: z.boolean().default(false),
  tier: z.number().int().min(0).max(5).optional().nullable(),
  iconImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
  i18n: z.array(toolI18nSchema).min(1, "최소 하나의 언어 정보가 필요합니다"),
});

// Update tool schema (all fields optional except id)
export const updateToolSchema = createToolSchema.partial().extend({
  id: z.string().uuid(),
});

// Type exports for use in components
export type CreateToolSchema = z.infer<typeof createToolSchema>;
export type UpdateToolSchema = z.infer<typeof updateToolSchema>;
export type ToolI18nSchema = z.infer<typeof toolI18nSchema>;
