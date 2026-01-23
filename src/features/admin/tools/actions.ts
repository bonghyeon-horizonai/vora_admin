'use server';

import { db } from '@/lib/db';
import { tools, toolI18N } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createToolSchema, updateToolSchema, type CreateToolSchema, type UpdateToolSchema } from './schema';

export type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string };

/**
 * Create a new tool with i18n data
 */
export async function createToolAction(
    input: CreateToolSchema
): Promise<ActionResult<{ id: string }>> {
    try {
        // Validate input
        const parsed = createToolSchema.safeParse(input);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0]?.message ?? '유효성 검사 실패' };
        }

        const { i18n, ...toolData } = parsed.data;

        // Insert tool and i18n data in transaction
        const result = await db.transaction(async (tx) => {
            // Insert tool
            const [newTool] = await tx
                .insert(tools)
                .values({
                    category: toolData.category,
                    toolCode: toolData.toolCode,
                    internalUsageLimit: toolData.internalUsageLimit,
                    isFree: toolData.isFree,
                    tier: toolData.tier,
                    iconImageUrl: toolData.iconImageUrl || null,
                    isActive: toolData.isActive,
                })
                .returning({ id: tools.id });

            if (!newTool) {
                throw new Error('도구 생성 실패');
            }

            // Insert i18n data
            if (i18n.length > 0) {
                await tx.insert(toolI18N).values(
                    i18n.map((item) => ({
                        toolId: newTool.id,
                        languageCode: item.languageCode,
                        name: item.name,
                        description: item.description,
                    }))
                );
            }

            return newTool;
        });

        revalidatePath('/products/tools');
        return { success: true, data: { id: result.id } };
    } catch (error) {
        console.error('createToolAction error:', error);
        return { success: false, error: '도구 생성 중 오류가 발생했습니다.' };
    }
}

/**
 * Update an existing tool
 */
export async function updateToolAction(
    id: string,
    input: UpdateToolSchema
): Promise<ActionResult> {
    try {
        // Validate input
        const parsed = updateToolSchema.safeParse({ ...input, id });
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0]?.message ?? '유효성 검사 실패' };
        }

        const { i18n, id: _id, ...toolData } = parsed.data;

        await db.transaction(async (tx) => {
            // Update tool
            const updateData: Record<string, unknown> = {
                updatedAt: sql`CURRENT_TIMESTAMP`,
            };

            if (toolData.category !== undefined) updateData.category = toolData.category;
            if (toolData.toolCode !== undefined) updateData.toolCode = toolData.toolCode;
            if (toolData.internalUsageLimit !== undefined) updateData.internalUsageLimit = toolData.internalUsageLimit;
            if (toolData.isFree !== undefined) updateData.isFree = toolData.isFree;
            if (toolData.tier !== undefined) updateData.tier = toolData.tier;
            if (toolData.iconImageUrl !== undefined) updateData.iconImageUrl = toolData.iconImageUrl || null;
            if (toolData.isActive !== undefined) updateData.isActive = toolData.isActive;

            await tx.update(tools).set(updateData).where(eq(tools.id, id));

            // Update i18n data if provided
            if (i18n && i18n.length > 0) {
                // Delete existing i18n and insert new ones
                await tx.delete(toolI18N).where(eq(toolI18N.toolId, id));
                await tx.insert(toolI18N).values(
                    i18n.map((item) => ({
                        toolId: id,
                        languageCode: item.languageCode,
                        name: item.name,
                        description: item.description,
                    }))
                );
            }
        });

        revalidatePath('/products/tools');
        revalidatePath(`/products/tools/${id}`);
        return { success: true };
    } catch (error) {
        console.error('updateToolAction error:', error);
        return { success: false, error: '도구 수정 중 오류가 발생했습니다.' };
    }
}

/**
 * Delete a tool
 */
export async function deleteToolAction(id: string): Promise<ActionResult> {
    try {
        await db
            .delete(tools)
            .where(eq(tools.id, id));

        revalidatePath('/products/tools');
        return { success: true };
    } catch (error) {
        console.error('deleteToolAction error:', error);
        return { success: false, error: '도구 삭제 중 오류가 발생했습니다.' };
    }
}

/**
 * Toggle tool active status
 */
export async function toggleToolStatusAction(
    id: string,
    isActive: boolean
): Promise<ActionResult> {
    try {
        await db
            .update(tools)
            .set({
                isActive,
                updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(tools.id, id));

        revalidatePath('/products/tools');
        return { success: true };
    } catch (error) {
        console.error('toggleToolStatusAction error:', error);
        return { success: false, error: '상태 변경 중 오류가 발생했습니다.' };
    }
}
