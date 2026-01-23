"use client";
import Link from "next/link";
import { useTranslations } from "use-intl";

import { Box, Button } from "@mui/material";

import Logo from "@/components/logo/logo";

export default function LPTopNav() {
  const t = useTranslations("dashboard");

  return (
    <Box className="flex h-16 w-full flex-none items-center justify-between">
      <Logo classNameFull="hidden sm:block" classNameMobile="sm:hidden" />

      <Box className="flex flex-row gap-1">
        <Button
          className="min-w-0! px-2! lg:px-4!"
          variant="text"
          size="large"
          color="text-primary"
          href="/auth/sign-in"
          target="_blank"
          LinkComponent={Link}
        >
          {t("landing-view")}
        </Button>
        <Button
          className="min-w-0! px-2! lg:px-4!"
          variant="text"
          size="large"
          color="text-primary"
          href="/docs/welcome/introduction"
          target="_blank"
          LinkComponent={Link}
        >
          {t("footer-docs")}
        </Button>
        <Button
          className="min-w-0! px-2! lg:px-4!"
          variant="text"
          size="large"
          color="text-primary"
          target="_blank"
          href="https://www.figma.com/design/CCUQejXdGzW2wMj2SCt8Sz/Gogo-Design---Preview?node-id=1381-11546&t=ZvHFuhjjUoY6u9ul-1"
          LinkComponent={Link}
        >
          {t("footer-figma")}
        </Button>
        <Button
          className="min-w-0! px-2! lg:px-4!"
          variant="text"
          size="large"
          color="text-primary"
          target="_blank"
          href="https://envato.com"
          LinkComponent={Link}
        >
          {t("footer-purchase")}
        </Button>
      </Box>
    </Box>
  );
}
