import { count, desc } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

import { Box, Paper, Stack, Typography } from "@mui/material";

import MemberListTable from "@/features/admin/members/components/member-list-table";
import { MemberListItem } from "@/features/admin/members/types";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
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

export default async function MemberListPage({ searchParams }: PageProps) {
  const t = await getTranslations("dashboard");
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const pageSize = 10;
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
      orderBy: [desc(users.createdAt)],
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight="bold">
          {t("members-list-title")}
        </Typography>
      </Stack>

      {/* Table */}
      <Paper sx={{ p: 2 }}>
        <MemberListTable
          members={members}
          total={total}
          page={page}
          pageSize={pageSize}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Paper>
    </Box>
  );
}
