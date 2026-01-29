"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@mui/material";

import NiPlusIcon from "@/icons/nexture/ni-plus";

export default function CreateToolButton() {
  const t = useTranslations("dashboard");

  return (
    <Button
      component={Link}
      href="/products/tools/new"
      variant="contained"
      startIcon={<NiPlusIcon />}
    >
      {t("tools-create-button")}
    </Button>
  );
}
