import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Box, Button, Stack, Typography } from "@mui/material";

import MemberDetailView from "@/features/admin/members/components/member-detail";
import { MemberDetail } from "@/features/admin/members/types";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const mapUserStatus = (
  status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN" | null,
): "ACTIVE" | "INACTIVE" | "BANNED" => {
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

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("dashboard");

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
    notFound();
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
      // In this schema, amounts are often on transactions.
      // For simplicity let's check if we can match a transaction or leave blank for now.
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

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Link href="/members/list" passHref>
          <Button variant="outlined">{t("members-detail-back")}</Button>
        </Link>
        <Typography variant="h4" fontWeight="bold">
          {t("members-detail-title")}
        </Typography>
      </Stack>

      <MemberDetailView member={member} />
    </Box>
  );
}
