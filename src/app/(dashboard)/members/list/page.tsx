import { getTranslations } from "next-intl/server";

import { Box, Paper, Stack, Typography } from "@mui/material";

import MemberListTable from "@/features/admin/members/components/member-list-table";
import { getMemberList } from "@/features/admin/members/queries";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
}

export default async function MemberListPage({ searchParams }: PageProps) {
  const t = await getTranslations("dashboard");
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const pageSize = 10;

  const { data: members, total } = await getMemberList({
    page,
    pageSize,
    sortBy,
    sortOrder,
  });

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
