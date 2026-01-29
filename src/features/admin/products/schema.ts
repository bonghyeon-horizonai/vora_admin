import { z } from "zod";

export const productI18nSchema = z.object({
  languageCode: z.enum(["KR", "EN", "JP"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  currencyCode: z.enum(["KRW", "USD", "JPY"]),
  price: z.string().min(1, "Price is required"),
  currentPrice: z.string().optional(),
});

export const productToolSchema = z.object({
  toolId: z.string().uuid(),
  quotaAllocation: z.number().nullable(),
  sortOrder: z.number(),
});

export const createProductSchema = z.object({
  type: z.enum(["SUBSCRIPTION", "PURCHASE"]),
  category: z.string().nullable(),
  billingCycle: z.enum(["MONTHLY", "YEARLY", "ONCE"]),
  productCode: z.string().min(1, "Product code is required"),
  paddleProductId: z.string().optional().nullable(),
  paddlePriceId: z.string().optional().nullable(),
  iconImageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  i18n: z
    .array(productI18nSchema)
    .min(1, "At least one translation is required"),
  tools: z.array(productToolSchema).default([]),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.extend({
  id: z.string().uuid(),
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
