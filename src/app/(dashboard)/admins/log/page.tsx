import { getTranslations } from "next-intl/server";

import { Box, Stack, Typography } from "@mui/material";

import AdminLogTable from "@/features/admin/admins/components/admin-log-table";
import { getAllAdminLogs } from "@/features/admin/admins/queries";

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminLogPage({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const t = await getTranslations("dashboard");

  const pageNum = parseInt(page || "1", 10);
  const pageSize = 10;

  const logsResponse = await getAllAdminLogs({
    page: pageNum,
    pageSize,
  });

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight="bold">
          {t("admins-log-title")}
        </Typography>
      </Stack>

      <AdminLogTable
        logs={logsResponse.data}
        total={logsResponse.total}
        page={pageNum}
        pageSize={pageSize}
      />
    </Box>
  );
}
