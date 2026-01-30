import { getTranslations } from "next-intl/server";

import { Box, Paper, Stack, Typography } from "@mui/material";

import AdminListTable from "@/features/admin/admins/components/admin-list-table";
import { getAdminList } from "@/features/admin/admins/queries";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
    status?: string;
  }>;
}

export default async function AdminListPage({ searchParams }: PageProps) {
  const t = await getTranslations("dashboard");
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const search = params.search || "";
  const status = params.status || "";
  const pageSize = 10;

  const { data: admins, total } = await getAdminList({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    status,
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
          {t("admins-list-title")}
        </Typography>
      </Stack>

      {/* Table */}
      <Paper sx={{ p: 2 }}>
        <AdminListTable
          admins={admins}
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
