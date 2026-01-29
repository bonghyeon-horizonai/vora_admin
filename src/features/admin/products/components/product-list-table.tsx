"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  Box,
  Button as MuiButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid";

import { deleteProductAction } from "@/features/admin/products/actions";
import type { ProductListItem } from "@/features/admin/products/types";
import NiBinEmptyIcon from "@/icons/nexture/ni-bin-empty";
import NiPenIcon from "@/icons/nexture/ni-pen";

interface ProductListTableProps {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export default function ProductListTable({
  products: productsData,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
}: ProductListTableProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const [isPending, startTransition] = useTransition();

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteProductAction(deleteId);
      if (result.success) {
        enqueueSnackbar("Product deleted successfully", { variant: "success" });
        router.refresh();
      } else {
        enqueueSnackbar(result.error || "Failed to delete product", {
          variant: "error",
        });
      }
      setDeleteId(null);
    });
  };

  // Track if we're navigating to prevent DataGrid reset events
  const isNavigatingRef = useRef(false);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("products-col-name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2" fontWeight={500}>
            {params.value || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "usdPrice",
      headerName: "USD",
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">
            {params.value ? `$${params.value}` : "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "krwPrice",
      headerName: "KRW",
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">
            {params.value ? `₩${Number(params.value).toLocaleString()}` : "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "jpyPrice",
      headerName: "JPY",
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">
            {params.value ? `¥${Number(params.value).toLocaleString()}` : "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "billingCycle",
      headerName: t("products-col-period"),
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">
            {params.value === "MONTHLY"
              ? t("products-period-monthly")
              : params.value === "YEARLY"
                ? t("products-period-yearly")
                : params.value === "ONCE"
                  ? t("products-period-once")
                  : params.value || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "isActive",
      headerName: t("products-col-status"),
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            label={
              params.value
                ? t("products-status-active")
                : t("products-status-inactive")
            }
            size="small"
            color={params.value ? "success" : "default"}
          />
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: t("products-col-created-at"),
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
      headerName: t("products-col-actions"),
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
          <Tooltip title={t("products-action-edit")}>
            <IconButton
              component={Link}
              href={`/products/list/${params.row.id}`}
              size="small"
            >
              <NiPenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("products-action-delete")}>
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteId(params.row.id)}
              disabled={isPending}
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

      if (newSortBy !== currentSortBy || newSortOrder !== currentSortOrder) {
        params.set("sortBy", newSortBy);
        params.set("sortOrder", newSortOrder);
        params.set("page", "1");
        router.push(`/products/list?${params.toString()}`);
      }
    } else if (currentSortBy) {
      params.delete("sortBy");
      params.delete("sortOrder");
      params.set("page", "1");
      router.push(`/products/list?${params.toString()}`);
    }
  };

  const sortModel: GridSortModel = sortBy
    ? [{ field: sortBy, sort: sortOrder || "desc" }]
    : [];

  const currentPageInUrl = parseInt(searchParams.get("page") || "1", 10);

  const [paginationModel, setPaginationModel] = useState({
    page: currentPageInUrl - 1,
    pageSize,
  });

  useEffect(() => {
    isNavigatingRef.current = false;

    setPaginationModel((current) => {
      if (
        current.page !== currentPageInUrl - 1 ||
        current.pageSize !== pageSize
      ) {
        return { page: currentPageInUrl - 1, pageSize };
      }
      return current;
    });
  }, [currentPageInUrl, pageSize]);

  const handlePaginationModelChange = (model: {
    page: number;
    pageSize: number;
  }) => {
    if (isNavigatingRef.current) {
      return;
    }

    const newPage = model.page + 1;

    if (newPage !== currentPageInUrl) {
      isNavigatingRef.current = true;
      setPaginationModel(model);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`/products/list?${params.toString()}`);
    }
  };

  return (
    <Box>
      <DataGrid
        rows={productsData}
        columns={columns}
        rowCount={total}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
        pageSizeOptions={[pageSize]}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => !isPending && setDeleteId(null)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this product? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDeleteId(null)} disabled={isPending}>
            Cancel
          </MuiButton>
          <MuiButton onClick={handleDelete} color="error" disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
