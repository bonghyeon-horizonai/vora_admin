import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Box, Button, Stack, Typography } from "@mui/material";

import MemberDetailView from "@/features/admin/members/components/member-detail";
import { getMemberDetail } from "@/features/admin/members/queries";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("dashboard");

  const member = await getMemberDetail(id);

  if (!member) {
    notFound();
  }

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
