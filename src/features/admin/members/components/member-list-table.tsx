"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  Avatar,
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

import { MemberListItem } from "@/features/admin/members/types";
import NiBinEmptyIcon from "@/icons/nexture/ni-bin-empty";
import NiPenIcon from "@/icons/nexture/ni-pen";

interface MemberListTableProps {
  members: MemberListItem[];
  total: number;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export default function MemberListTable({
  members: membersData,
  total,
  pageSize,
  sortBy,
  sortOrder,
}: MemberListTableProps) {
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
      // TODO: Implement delete action
      // const result = await deleteMemberAction(deleteId);

      // Mock success for now
      const result = { success: true, error: null };

      if (result.success) {
        enqueueSnackbar("Member deleted successfully", { variant: "success" });
        router.refresh();
      } else {
        enqueueSnackbar(result.error || "Failed to delete member", {
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
      headerName: t("members-col-name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "100%",
            height: "100%",
          }}
        >
          <Avatar
            src={params.row.image}
            alt={params.value}
            sx={{ width: 40, height: 40 }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Typography variant="subtitle2" noWrap sx={{ lineHeight: 1.2 }}>
              {params.value || "-"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ lineHeight: 1.2 }}
            >
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "provider",
      headerName: t("members-col-provider"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            sx={{ textTransform: "capitalize" }}
          />
        </Box>
      ),
    },
    {
      field: "status",
      headerName: t("members-col-status"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        let color: "default" | "success" | "error" | "warning" = "default";
        let label = params.value;

        switch (params.value) {
          case "ACTIVE":
            color = "success";
            label = t("members-status-active");
            break;
          case "INACTIVE":
            color = "default";
            label = t("members-status-inactive");
            break;
          case "BANNED":
            color = "error";
            label = t("members-status-banned");
            break;
        }

        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Chip label={label} size="small" color={color} />
          </Box>
        );
      },
    },
    {
      field: "createdAt",
      headerName: t("members-col-created-at"),
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
      field: "lastLoginAt",
      headerName: t("members-col-last-login"),
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
      headerName: t("members-col-actions"),
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
          <Tooltip title={t("members-action-edit")}>
            <IconButton
              component={Link}
              href={`/members/${params.row.id}`}
              size="small"
            >
              <NiPenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("members-action-delete")}>
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
        router.push(`/members/list?${params.toString()}`);
      }
    } else if (currentSortBy) {
      params.delete("sortBy");
      params.delete("sortOrder");
      params.set("page", "1");
      router.push(`/members/list?${params.toString()}`);
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
      router.push(`/members/list?${params.toString()}`);
    }
  };

  return (
    <Box>
      <DataGrid
        rows={membersData}
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
        rowHeight={72}
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
        <DialogTitle>{t("members-delete-confirm-title")}</DialogTitle>
        <DialogContent>
          <Typography>{t("members-delete-confirm-message")}</Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDeleteId(null)} disabled={isPending}>
            {t("members-delete-confirm-cancel")}
          </MuiButton>
          <MuiButton onClick={handleDelete} color="error" disabled={isPending}>
            {isPending
              ? t("members-delete-progress")
              : t("members-delete-confirm-delete")}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
