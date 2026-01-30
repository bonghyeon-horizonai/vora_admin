import {
  Admin,
  AdminListResponse,
  AdminLogItem,
  AdminLogListResponse,
  GetAdminListParams,
  GetAdminLogsParams,
} from "./types";
import { and, count, desc, eq, ilike, or, SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminLogs, admins } from "@/lib/db/schema";

export async function getAllAdminLogs({
  page = 1,
  pageSize = 10,
  adminId,
}: GetAdminLogsParams): Promise<AdminLogListResponse> {
  const offset = (page - 1) * pageSize;

  const filters: SQL[] = [];
  if (adminId) {
    filters.push(eq(adminLogs.adminId, adminId));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [logsData, countMetadata] = await Promise.all([
    db
      .select({
        id: adminLogs.id,
        adminId: adminLogs.adminId,
        action: adminLogs.action,
        target: adminLogs.target,
        ipAddress: adminLogs.ipAddress,
        createdAt: adminLogs.createdAt,
        adminName: admins.name,
        adminEmail: admins.email,
        adminImage: admins.profileImageUrl,
      })
      .from(adminLogs)
      .leftJoin(admins, eq(adminLogs.adminId, admins.id))
      .where(whereClause)
      .orderBy(desc(adminLogs.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(adminLogs).where(whereClause),
  ]);

  const total = countMetadata[0].count;

  const mappedLogs: AdminLogItem[] = logsData.map((log) => ({
    id: log.id,
    action: log.action,
    target: log.target,
    ipAddress: log.ipAddress || "",
    createdAt: log.createdAt || new Date().toISOString(),
    adminId: log.adminId,
    adminName: log.adminName || "Unknown",
    adminEmail: log.adminEmail || "",
    adminImage: log.adminImage || undefined,
  }));

  return {
    data: mappedLogs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAdminList({
  page = 1,
  pageSize = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  search,
  status,
}: GetAdminListParams): Promise<AdminListResponse> {
  const offset = (page - 1) * pageSize;

  const filters: SQL[] = [];

  if (search) {
    const searchLower = `%${search.toLowerCase()}%`;
    filters.push(
      or(ilike(admins.name, searchLower), ilike(admins.email, searchLower))!,
    );
  }

  if (status) {
    filters.push(eq(admins.status, status as "ACTIVE" | "INACTIVE" | "BANNED"));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [adminsData, countMetadata] = await Promise.all([
    db
      .select()
      .from(admins)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset)
      .orderBy(
        sortOrder === "desc"
          ? desc(admins[sortBy as keyof typeof admins] as any)
          : (admins[sortBy as keyof typeof admins] as any),
      ),
    db.select({ count: count() }).from(admins).where(whereClause),
  ]);

  const total = countMetadata[0].count;

  return {
    data: adminsData.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      image: admin.profileImageUrl || undefined,
      lastLoginAt: admin.lastLoginAt || undefined,
      createdAt: admin.createdAt || new Date().toISOString(),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAdminDetail(id: string): Promise<Admin | null> {
  const [admin] = await db.select().from(admins).where(eq(admins.id, id));

  if (!admin) return null;

  const logs = await db
    .select()
    .from(adminLogs)
    .where(eq(adminLogs.adminId, id))
    .orderBy(desc(adminLogs.createdAt))
    .limit(20);

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    profileImage: admin.profileImageUrl || undefined,
    lastLoginAt: admin.lastLoginAt || undefined,
    createdAt: admin.createdAt || new Date().toISOString(),
    updatedAt: admin.updatedAt || new Date().toISOString(),
    twoFactorEnabled: admin.twoFactorEnabled,
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      target: log.target,
      ipAddress: log.ipAddress || "",
      createdAt: log.createdAt || new Date().toISOString(),
    })),
  };
}
