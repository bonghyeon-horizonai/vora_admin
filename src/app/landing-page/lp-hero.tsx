"use client";
import LPLogos from "./lp-logos";
import Link from "next/link";
import { useTranslations } from "use-intl";

import { Box, Button, Paper, Typography } from "@mui/material";

import NiBasket from "@/icons/nexture/ni-basket";
import NiSendUpRight from "@/icons/nexture/ni-send-up-right";

export default function LPHero() {
  const t = useTranslations("dashboard");

  return (
    <Paper elevation={0} className="3xl:py-12 flex h-full max-w-full items-center justify-center bg-transparent py-8">
      <Box className="flex h-full w-full max-w-[1200px] flex-1 flex-col items-center gap-10">
        <Box className="flex flex-col items-center">
          <Typography
            component="h1"
            variant="h1"
            className="mb-8 text-center text-[3rem] leading-12 font-extrabold md:text-[5rem] md:leading-20"
          >
            {t("landing-hero-first")}
            <br />
            {t("landing-hero-second")}
            <br />
            {t("landing-hero-third")}
          </Typography>

          <Typography component="p" className="mb-4 max-w-sm text-center text-[1.125rem] leading-6">
            {t("landing-copy")}
          </Typography>

          <Box className="mb-12 flex flex-row justify-center gap-2 lg:justify-start">
            <Button
              size="large"
              color="primary"
              variant="contained"
              startIcon={<NiSendUpRight size={"large"} />}
              href="/auth/sign-in"
              target="_blank"
              LinkComponent={Link}
            >
              {t("landing-view-live")}
            </Button>

            <Button
              size="large"
              color="primary"
              variant="pastel"
              startIcon={<NiBasket size={"large"} />}
              href="https://envato.com"
              target="_blank"
              LinkComponent={"a"}
            >
              {t("landing-purchase")}
            </Button>
          </Box>

          <Box className="mb-16 flex h-9 w-full flex-none flex-row justify-center">
            <LPLogos />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
