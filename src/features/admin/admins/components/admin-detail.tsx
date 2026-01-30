import { Admin } from "../types";
import TwoFactorAuth from "./two-factor-auth";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

interface AdminDetailViewProps {
  admin: Admin;
}

export default function AdminDetailView({ admin }: AdminDetailViewProps) {
  const t = useTranslations("dashboard");

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          avatar={
            <Avatar
              src={admin.profileImage}
              alt={admin.name}
              sx={{ width: 64, height: 64 }}
            />
          }
          title={
            <Typography variant="h5" fontWeight="bold">
              {admin.name}
            </Typography>
          }
          subheader={
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <Chip
                label={admin.status}
                color={
                  admin.status === "ACTIVE"
                    ? "success"
                    : admin.status === "BANNED"
                      ? "error"
                      : "default"
                }
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                ID: {admin.id}
              </Typography>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={t("admins-detail-email")}
                    secondary={admin.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t("admins-detail-role")}
                    secondary={
                      <Chip
                        label={admin.role}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t("admins-detail-created-at")}
                    secondary={dayjs(admin.createdAt).format(
                      "YYYY-MM-DD HH:mm:ss",
                    )}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={t("admins-detail-updated-at")}
                    secondary={dayjs(admin.updatedAt).format(
                      "YYYY-MM-DD HH:mm:ss",
                    )}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t("admins-detail-last-login")}
                    secondary={
                      admin.lastLoginAt
                        ? dayjs(admin.lastLoginAt).format("YYYY-MM-DD HH:mm:ss")
                        : "Never"
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TwoFactorAuth adminId={admin.id} isEnabled={admin.twoFactorEnabled} />

      <Card>
        <CardHeader title={t("admins-detail-logs")} />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("admins-log-action")}</TableCell>
                  <TableCell>{t("admins-log-target")}</TableCell>
                  <TableCell>{t("admins-log-ip")}</TableCell>
                  <TableCell>{t("admins-log-time")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admin.logs && admin.logs.length > 0 ? (
                  admin.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.target}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>
                        {dayjs(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      {t("admins-log-no-logs")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
}
