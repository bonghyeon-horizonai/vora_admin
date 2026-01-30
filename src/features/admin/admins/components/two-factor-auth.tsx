"use client";

import {
  disableTwoFactor,
  enableTwoFactor,
  generateTwoFactorSecret,
} from "../../auth/actions";
import Image from "next/image";
import { useSnackbar } from "notistack";
import { useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

interface TwoFactorAuthProps {
  adminId: string;
  isEnabled: boolean;
}

export default function TwoFactorAuth({
  adminId,
  isEnabled,
}: TwoFactorAuthProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const handleSetupStart = async () => {
    setLoading(true);
    try {
      const result = await generateTwoFactorSecret(adminId);
      setSecret(result.secret);
      setQrCode(result.qrCodeUrl);
      setOpen(true);
    } catch (error) {
      enqueueSnackbar("Failed to start 2FA setup", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!secret || !token) return;
    setLoading(true);
    try {
      const result = await enableTwoFactor(adminId, secret, token);
      if (result.error) {
        enqueueSnackbar(result.error, { variant: "error" });
      } else {
        enqueueSnackbar("2FA enabled successfully", { variant: "success" });
        setOpen(false);
        setSecret(null);
        setQrCode(null);
        setToken("");
      }
    } catch (error) {
      enqueueSnackbar("Failed to enable 2FA", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm("Are you sure you want to disable 2FA?")) return;
    setLoading(true);
    try {
      await disableTwoFactor(adminId);
      enqueueSnackbar("2FA disabled successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to disable 2FA", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader title="Security Settings" />
        <Divider />
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Two-Factor Authentication (2FA)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEnabled
                  ? "Two-factor authentication is currently enabled."
                  : "Add an extra layer of security to your account."}
              </Typography>
            </Box>
            <Button
              variant={isEnabled ? "outlined" : "contained"}
              color={isEnabled ? "error" : "primary"}
              onClick={isEnabled ? handleDisable : handleSetupStart}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {isEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Stack spacing={3} alignItems="center" sx={{ py: 2 }}>
            <DialogContentText textAlign="center">
              Scan the QR code below with your authenticator app (e.g. Google
              Authenticator).
            </DialogContentText>
            {qrCode && (
              <Box sx={{ border: "1px solid #eee", p: 1, borderRadius: 1 }}>
                <Image
                  src={qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                />
              </Box>
            )}
            <TextField
              fullWidth
              label="Verification Code"
              variant="outlined"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456"
              inputProps={{ maxLength: 6 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            variant="contained"
            disabled={loading || !token}
          >
            Verify & Enable
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
