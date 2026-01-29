"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@mui/material";

import NiPlusIcon from "@/icons/nexture/ni-plus";

export default function CreateProductButton() {
  const t = useTranslations("dashboard");

  return (
    <Button
      variant="contained"
      startIcon={<NiPlusIcon />}
      component={Link}
      href="/products/list/new"
    >
      {t("products-create-button")}
    </Button>
  );
}
