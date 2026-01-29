import type {
  ToolListItem,
  ToolListParams,
  ToolWithI18n,
  WorkflowOption,
} from "./types";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { toolI18N, tools, workflows } from "@/lib/db/schema";

/**
 * Get paginated list of tools with search and filter
 */
export async function getToolList(params: ToolListParams = {}): Promise<{
  data: ToolListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const {
    search = "",
    status = "all",
    page = 1,
    pageSize = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    locale = "ko",
  } = params;
  const offset = (page - 1) * pageSize;

  // Map UI locale to DB language code
  const dbLanguageCode = locale === "en" ? "EN" : "KR";

  // Build where conditions
  const conditions = [];

  // Status filter
  if (status === "active") {
    conditions.push(eq(tools.isActive, true));
  } else if (status === "inactive") {
    conditions.push(eq(tools.isActive, false));
  }

  // Add search condition if provided
  if (search) {
    const searchPattern = `%${search}%`;
    // Need to search in i18n names too
    const searchResults = await db
      .select({ toolId: toolI18N.toolId })
      .from(toolI18N)
      .where(
        or(
          ilike(toolI18N.name, searchPattern),
          ilike(toolI18N.description, searchPattern),
        ),
      );

    const toolIds = searchResults.map((r) => r.toolId);

    if (toolIds.length > 0) {
      conditions.push(
        or(ilike(tools.toolCode, searchPattern), inArray(tools.id, toolIds))!,
      );
    } else {
      conditions.push(ilike(tools.toolCode, searchPattern));
    }
  }

  // Dynamic sort column
  const sortExpression = (() => {
    switch (sortBy) {
      case "name":
        // Use COLLATE "C" for predictable Unicode (alphabetical) order for Hangul/English
        return sql`${toolI18N.name} COLLATE "C"`;
      case "toolCode":
        return tools.toolCode;
      case "category":
        // Cast enum to text for alphabetical sorting
        return sql`lower(${tools.category}::text)`;
      case "isActive":
        return tools.isActive;
      case "tier":
        return tools.tier;
      case "createdAt":
        return tools.createdAt;
      default:
        return tools.createdAt;
    }
  })();

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tools)
    .leftJoin(
      toolI18N,
      and(
        eq(tools.id, toolI18N.toolId),
        eq(toolI18N.languageCode, dbLanguageCode),
      ),
    )
    .where(and(...conditions));
  const total = Number(countResult[0]?.count ?? 0);

  // Get paginated data
  const data = await db
    .select({
      id: tools.id,
      toolCode: tools.toolCode,
      category: tools.category,
      isActive: tools.isActive,
      isFree: tools.isFree,
      tier: tools.tier,
      createdAt: tools.createdAt,
      updatedAt: tools.updatedAt,
      name: toolI18N.name,
    })
    .from(tools)
    .leftJoin(
      toolI18N,
      and(
        eq(tools.id, toolI18N.toolId),
        eq(toolI18N.languageCode, dbLanguageCode),
      ),
    )
    .where(and(...conditions))
    .orderBy(sortOrder === "desc" ? desc(sortExpression) : asc(sortExpression))
    .limit(pageSize)
    .offset(offset);

  return {
    data,
    total,
    page,
    pageSize,
  };
}

/**
 * Get single tool by ID with all i18n data
 */
export async function getToolById(id: string): Promise<ToolWithI18n | null> {
  const toolData = await db
    .select()
    .from(tools)
    .where(eq(tools.id, id))
    .limit(1);

  if (toolData.length === 0) {
    return null;
  }

  const tool = toolData[0];

  const i18nData = await db
    .select()
    .from(toolI18N)
    .where(eq(toolI18N.toolId, id))
    .orderBy(asc(toolI18N.languageCode));

  return {
    ...tool,
    i18n: i18nData,
  };
}

/**
 * Get workflow options for dropdown
 */
export async function getWorkflowOptions(): Promise<WorkflowOption[]> {
  const data = await db
    .select({
      id: workflows.id,
      workflowId: workflows.workflowId,
      name: workflows.name,
    })
    .from(workflows)
    .where(eq(workflows.isActive, true))
    .orderBy(asc(workflows.name));

  return data;
}
