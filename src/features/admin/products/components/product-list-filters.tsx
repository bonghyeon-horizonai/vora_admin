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

interface ProductListFiltersProps {
  search: string;
  status: "all" | "active" | "inactive";
}

export default function ProductListFilters({
  search: initialSearch,
  status: initialStatus,
}: ProductListFiltersProps) {
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
        router.push(`/products/list?${params.toString()}`);
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
        placeholder={t("products-search-placeholder")}
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
        <InputLabel>{t("products-col-status")}</InputLabel>
        <Select
          value={initialStatus}
          label={t("products-col-status")}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
        >
          <MenuItem value="all">{t("tools-filter-status-all")}</MenuItem>
          <MenuItem value="active">{t("products-status-active")}</MenuItem>
          <MenuItem value="inactive">{t("products-status-inactive")}</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
