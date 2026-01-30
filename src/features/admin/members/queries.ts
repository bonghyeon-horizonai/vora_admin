import { MemberDetail, MemberListItem, MemberStatus } from "./types";
import { AnyColumn, count, eq, SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const mapUserStatus = (
  status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN" | null,
): MemberStatus => {
  switch (status) {
    case "ACTIVE":
      return "ACTIVE";
    case "SUSPENDED":
      return "BANNED";
    case "WITHDRAWN":
      return "INACTIVE";
    default:
      return "INACTIVE";
  }
};

interface GetMemberListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getMemberList({
  page = 1,
  pageSize = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetMemberListParams = {}) {
  const offset = (page - 1) * pageSize;

  const [membersData, countMetadata] = await Promise.all([
    db.query.users.findMany({
      with: {
        accounts: true,
        sessions: {
          orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
          limit: 1,
        },
      },
      orderBy: (users, { asc, desc }) => {
        let sortCol: SQL | AnyColumn | null = null;
        switch (sortBy) {
          case "name":
            sortCol = users.name;
            break;
          case "email":
            sortCol = users.email;
            break;
          case "createdAt":
          default:
            sortCol = users.createdAt;
        }
        return sortCol
          ? [sortOrder === "desc" ? desc(sortCol) : asc(sortCol)]
          : [desc(users.createdAt)];
      },
      limit: pageSize,
      offset,
    }),
    db.select({ count: count() }).from(users),
  ]);

  const total = countMetadata[0].count;

  const members: MemberListItem[] = membersData.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email || "",
    provider: user.accounts[0]?.providerId || "email",
    status: mapUserStatus(user.status),
    createdAt: user.createdAt || new Date().toISOString(),
    lastLoginAt: user.sessions[0]?.createdAt || undefined,
    image: user.profileImageUrl || "",
  }));

  return {
    data: members,
    total,
    page,
    pageSize,
  };
}

export async function getMemberDetail(
  id: string,
): Promise<MemberDetail | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      accounts: true,
      sessions: {
        orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
        limit: 5,
      },
      userPurchases: {
        with: {
          product: {
            with: {
              productsI18NS: {
                // ideally filter by language but simplifying for now or getting default
              },
            },
          },
        },
        orderBy: (purchases, { desc }) => [desc(purchases.createdAt)],
      },
      paymentTransactions: {
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
        limit: 5,
      },
    },
  });

  if (!user) {
    return null;
  }

  const member: MemberDetail = {
    id: user.id,
    name: user.name,
    email: user.email || "",
    image: user.profileImageUrl || "",
    provider: user.accounts[0]?.providerId || "email",
    status: mapUserStatus(user.status),
    createdAt: user.createdAt || new Date().toISOString(),
    lastLoginAt: user.sessions[0]?.createdAt || undefined,
    languageCode: user.languageCode || "KR",
    onboardingStatus: user.onboardingStatus,
    accounts: user.accounts.map((acc) => ({
      id: acc.id,
      providerId: acc.providerId,
      accountId: acc.accountId,
      createdAt: acc.createdAt,
    })),
    sessions: user.sessions.map((sess) => ({
      id: sess.id,
      ipAddress: sess.ipAddress,
      userAgent: sess.userAgent,
      createdAt: sess.createdAt,
    })),
    purchases: user.userPurchases.map((p) => {
      // Simple heuristic to get product name. Ideally join with i18n table properly filtering by language
      const productName =
        p.product?.productsI18NS?.[0]?.name ||
        p.product?.productCode ||
        "Unknown Product";

      // Find latest transaction for this purchase to get amount/currency if not directly available on purchase
      const relatedTransaction = user.paymentTransactions.find(
        (t) => t.status?.includes("SUBSCRIPTION") || t.status?.includes("PAID"),
      );

      return {
        id: p.id,
        productName,
        status: p.status || "UNKNOWN",
        amount: relatedTransaction?.amount || null,
        currency: relatedTransaction?.currencyCode || null,
        currentPeriodStart: p.currentPeriodStart,
        currentPeriodEnd: p.currentPeriodEnd,
      };
    }),
  };

  return member;
}
