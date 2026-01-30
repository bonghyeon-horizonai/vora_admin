import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Box, Button, Stack, Typography } from "@mui/material";

import AdminDetailView from "@/features/admin/admins/components/admin-detail";
import { getAdminDetail } from "@/features/admin/admins/queries";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("dashboard");

  const admin = await getAdminDetail(id);

  if (!admin) {
    notFound();
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Link href="/admins/list" passHref>
          <Button variant="outlined">{t("admins-detail-back")}</Button>
        </Link>
        <Typography variant="h4" fontWeight="bold">
          {t("admins-detail-title")}
        </Typography>
      </Stack>

      <AdminDetailView admin={admin} />
    </Box>
  );
}
