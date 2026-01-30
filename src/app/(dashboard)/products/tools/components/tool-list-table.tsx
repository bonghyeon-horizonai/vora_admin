"use client";

import DeleteConfirmDialog from "./delete-confirm-dialog";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";

import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid";

import type { ToolListItem } from "@/features/admin/tools";
import { deleteToolAction } from "@/features/admin/tools/actions";
import NiBinEmptyIcon from "@/icons/nexture/ni-bin-empty";
import NiPenIcon from "@/icons/nexture/ni-pen";

interface ToolListTableProps {
  tools: ToolListItem[];
  total: number;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export default function ToolListTable({
  tools,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
}: ToolListTableProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Track if we're navigating to prevent DataGrid reset events
  const isNavigatingRef = useRef(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteToolAction(deleteId);
      if (result.success) {
        setDeleteId(null);
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("tools-col-name"),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2" fontWeight={500}>
            {params.value || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "toolCode",
      headerName: t("tools-col-code"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontFamily="monospace"
          >
            {params.value || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "category",
      headerName: t("tools-col-category"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip label={params.value || "-"} size="small" variant="outlined" />
        </Box>
      ),
    },
    {
      field: "isActive",
      headerName: t("tools-col-status"),
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            label={
              params.value
                ? t("tools-status-active")
                : t("tools-status-inactive")
            }
            size="small"
            color={params.value ? "success" : "default"}
          />
        </Box>
      ),
    },
    {
      field: "tier",
      headerName: t("tools-col-tier"),
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "createdAt",
      headerName: t("tools-col-created-at"),
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return "-";
        const date = new Date(params.value);
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Typography variant="body2">
              {date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: t("tools-col-actions"),
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            height: "100%",
          }}
        >
          <Tooltip title={t("tools-action-edit")}>
            <IconButton
              component={Link}
              href={`/products/tools/${params.row.id}`}
              size="small"
            >
              <NiPenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("tools-action-delete")}>
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteId(params.row.id)}
            >
              <NiBinEmptyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleSortChange = (model: GridSortModel) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSortBy = params.get("sortBy");
    const currentSortOrder = params.get("sortOrder");

    if (model.length > 0) {
      const newSortBy = model[0].field;
      const newSortOrder = model[0].sort || "asc";

      // Only push if the sort actually changed
      if (newSortBy !== currentSortBy || newSortOrder !== currentSortOrder) {
        params.set("sortBy", newSortBy);
        params.set("sortOrder", newSortOrder);
        params.set("page", "1");
        router.push(`/products/tools?${params.toString()}`);
      }
    } else if (currentSortBy) {
      params.delete("sortBy");
      params.delete("sortOrder");
      params.set("page", "1");
      router.push(`/products/tools?${params.toString()}`);
    }
  };

  const sortModel: GridSortModel = sortBy
    ? [{ field: sortBy, sort: sortOrder || "desc" }]
    : [];

  // Use URL as the master source of truth for pagination state to avoid race conditions
  const [paginationModel, setPaginationModel] = useState({
    page: page - 1,
    pageSize,
  });

  // Sync local state when the URL changes
  useEffect(() => {
    // Reset navigation flag when URL sync completes
    isNavigatingRef.current = false;

    setPaginationModel((current) => {
      if (current.page !== page - 1 || current.pageSize !== pageSize) {
        return { page: page - 1, pageSize };
      }
      return current;
    });
  }, [page, pageSize]);

  const handlePaginationModelChange = (model: {
    page: number;
    pageSize: number;
  }) => {
    // Ignore DataGrid internal reset events (when it resets to page 0 during data changes)
    if (isNavigatingRef.current) {
      return;
    }

    const newPage = model.page + 1;

    // Only update state and URL if the page actually changed in the URL
    if (newPage !== page) {
      // Set navigation flag to prevent DataGrid reset events
      isNavigatingRef.current = true;
      setPaginationModel(model);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`/products/tools?${params.toString()}`);
    }
  };

  return (
    <>
      <DataGrid
        rows={tools}
        columns={columns}
        rowCount={total}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
        pageSizeOptions={[20]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          border: "none",
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid",
            borderBottomColor: "divider",
          },
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}
