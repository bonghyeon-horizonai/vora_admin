"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";

import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import type { LanguageCode, ToolWithI18n } from "@/features/admin/tools";
import {
  type CreateToolSchema,
  createToolSchema,
} from "@/features/admin/tools";
import {
  createToolAction,
  updateToolAction,
} from "@/features/admin/tools/actions";
import { zodResolver } from "@hookform/resolvers/zod";

interface ToolFormProps {
  tool: ToolWithI18n | null;
  isNew: boolean;
}

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "KR", label: "한국어" },
  { code: "EN", label: "English" },
  { code: "JP", label: "日本語" },
];

import { useTranslations } from "next-intl";

export default function ToolForm({ tool, isNew }: ToolFormProps) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const CATEGORIES = [
    { value: "SEARCH", label: t("tools-cat-search") },
    { value: "GENERATION", label: t("tools-cat-generation") },
    { value: "OPERATION", label: t("tools-cat-operation") },
    { value: "DOCUMENTS", label: t("tools-cat-documents") },
    { value: "UTILITY", label: t("tools-cat-utility") },
    { value: "KNOWLEDGE_BASE", label: t("tools-cat-knowledge-base") },
    { value: "AMUSEMENT", label: t("tools-cat-amusement") },
  ];

  // Prepare default values
  const getDefaultI18n = (code: LanguageCode) => {
    const existing = tool?.i18n.find((i) => i.languageCode === code);
    return {
      languageCode: code,
      name: existing?.name || "",
      description: existing?.description || "",
    };
  };

  const defaultValues: CreateToolSchema = {
    category: tool?.category || null,
    toolCode: tool?.toolCode || "",
    internalUsageLimit: tool?.internalUsageLimit || null,
    isFree: tool?.isFree ?? false,
    tier: tool?.tier || null,
    iconImageUrl: tool?.iconImageUrl || "",
    isActive: tool?.isActive ?? true,
    i18n: LANGUAGES.map((lang) => getDefaultI18n(lang.code)),
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateToolSchema>({
    resolver: zodResolver(
      createToolSchema,
    ) as unknown as Resolver<CreateToolSchema>,
    defaultValues,
  });

  const onSubmit = (data: CreateToolSchema) => {
    setError(null);

    startTransition(async () => {
      const result = isNew
        ? await createToolAction(data)
        : await updateToolAction(tool!.id, { ...data, id: tool!.id });

      if (result.success) {
        router.push("/products/tools");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* I18n Tabs */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("tools-form-basic-info")}
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        {LANGUAGES.map((lang, idx) => (
          <Tab key={lang.code} label={lang.label} value={idx} />
        ))}
      </Tabs>

      {LANGUAGES.map((lang, idx) => (
        <Box
          key={lang.code}
          sx={{ display: activeTab === idx ? "block" : "none", mb: 3 }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name={`i18n.${idx}.name`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`${t("tools-form-name-label")} (${lang.label})`}
                    fullWidth
                    required={idx === 0}
                    error={!!errors.i18n?.[idx]?.name}
                    helperText={errors.i18n?.[idx]?.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name={`i18n.${idx}.description`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`${t("tools-form-desc-label")} (${lang.label})`}
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      ))}

      {/* Tool Properties */}
      <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
        {t("tools-form-properties")}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t("tools-form-category")}</InputLabel>
                <Select
                  {...field}
                  label={t("tools-form-category")}
                  value={field.value || ""}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="tier"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t("tools-form-tier")}</InputLabel>
                <Select
                  {...field}
                  label={t("tools-form-tier")}
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      String(e.target.value) === ""
                        ? null
                        : Number(e.target.value),
                    )
                  }
                >
                  <MenuItem value="">{t("tools-form-select-none")}</MenuItem>
                  {[0, 1, 2, 3, 4, 5].map((t) => (
                    <MenuItem key={t} value={t}>
                      Tier {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="toolCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("tools-form-tool-code")}
                fullWidth
                required
                error={!!errors.toolCode}
                helperText={errors.toolCode?.message}
                placeholder="tool_example_code"
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="iconImageUrl"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("tools-form-icon-url")}
                fullWidth
                placeholder="https://example.com/icon.png"
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Toggles */}
      <Stack direction="row" sx={{ mt: 3, flexWrap: "wrap", gap: 6 }}>
        <Controller
          name="isFree"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label={t("tools-form-is-free")}
            />
          )}
        />
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label={t("tools-form-is-active")}
            />
          )}
        />
      </Stack>

      {/* Actions */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ mt: 4 }}
      >
        <Button
          variant="outlined"
          onClick={() => router.back()}
          disabled={isPending}
        >
          {t("tools-form-cancel")}
        </Button>
        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? t("tools-form-saving") : t("tools-form-save")}
        </Button>
      </Stack>
    </Box>
  );
}
