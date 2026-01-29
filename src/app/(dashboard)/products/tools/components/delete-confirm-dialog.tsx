"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

import { useTranslations } from "next-intl";

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
}: DeleteConfirmDialogProps) {
  const t = useTranslations("dashboard");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("tools-delete-confirm-title")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("tools-delete-confirm-message")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("tools-delete-confirm-cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading
            ? t("tools-delete-progress")
            : t("tools-delete-confirm-delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
