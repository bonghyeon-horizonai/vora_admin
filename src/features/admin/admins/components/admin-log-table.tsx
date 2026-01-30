"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Avatar, Box, Chip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import { AdminLogItem } from "@/features/admin/admins/types";

interface AdminLogTableProps {
  logs: AdminLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminLogTable({
  logs: logsData,
  total,
  pageSize,
}: AdminLogTableProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Track if we're navigating to prevent DataGrid reset events
  const isNavigatingRef = useRef(false);

  const columns: GridColDef[] = [
    {
      field: "admin",
      headerName: t("admins-col-name"),
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
            src={params.row.adminImage}
            alt={params.row.adminName}
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
              {params.row.adminName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ lineHeight: 1.2 }}
            >
              {params.row.adminEmail}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "action",
      headerName: t("admins-log-action"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip label={params.value} size="small" variant="outlined" />
        </Box>
      ),
    },
    {
      field: "target",
      headerName: t("admins-log-target"),
      width: 150,
    },
    {
      field: "ipAddress",
      headerName: t("admins-log-ip"),
      width: 130,
    },
    {
      field: "createdAt",
      headerName: t("admins-log-time"),
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return "-";
        const date = new Date(params.value);
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Typography variant="body2">
              {date.toLocaleString(locale === "ko" ? "ko-KR" : "en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </Typography>
          </Box>
        );
      },
    },
  ];

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
      router.push(`/admins/log?${params.toString()}`);
    }
  };

  return (
    <Box>
      <DataGrid
        rows={logsData}
        columns={columns}
        rowCount={total}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[pageSize]}
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
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
    </Box>
  );
}
