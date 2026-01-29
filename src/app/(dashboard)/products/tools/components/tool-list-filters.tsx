"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState, useTransition } from "react";

import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import NiSearchIcon from "@/icons/nexture/ni-search";

interface ToolListFiltersProps {
  search: string;
  status: "all" | "active" | "inactive";
}

export default function ToolListFilters({
  search: initialSearch,
  status: initialStatus,
}: ToolListFiltersProps) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset page when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`/products/tools?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      updateParams("search", search);
    }
  };

  const handleStatusChange = (value: string) => {
    updateParams("status", value);
  };

  return (
    <Stack direction="row" alignItems="center" sx={{ gap: 4 }}>
      <TextField
        placeholder={t("tools-search-placeholder")}
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        disabled={isPending}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <NiSearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ minWidth: 300 }}
      />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>{t("tools-filter-status")}</InputLabel>
        <Select
          value={initialStatus}
          label={t("tools-filter-status")}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
        >
          <MenuItem value="all">{t("tools-filter-status-all")}</MenuItem>
          <MenuItem value="active">{t("tools-filter-status-active")}</MenuItem>
          <MenuItem value="inactive">
            {t("tools-filter-status-inactive")}
          </MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
