import { MemberDetail } from "../types";
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

interface MemberDetailProps {
  member: MemberDetail;
}

export default function MemberDetailView({ member }: MemberDetailProps) {
  const t = useTranslations("dashboard");

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          avatar={
            <Avatar
              src={member.image}
              alt={member.name}
              sx={{ width: 64, height: 64 }}
            />
          }
          title={
            <Typography variant="h5" fontWeight="bold">
              {member.name}
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
                label={member.status}
                color={
                  member.status === "ACTIVE"
                    ? "success"
                    : member.status === "BANNED"
                      ? "error"
                      : "default"
                }
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                ID: {member.id}
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
                    primary={t("members-detail-email")}
                    secondary={member.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t("members-detail-provider")}
                    secondary={member.provider}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t("members-detail-created-at")}
                    secondary={dayjs(member.createdAt).format(
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
                    primary={t("members-detail-lang-code")}
                    secondary={member.languageCode}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t("members-detail-onboarding")}
                    secondary={member.onboardingStatus || "N/A"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t("members-detail-last-login")}
                    secondary={
                      member.lastLoginAt
                        ? dayjs(member.lastLoginAt).format(
                            "YYYY-MM-DD HH:mm:ss",
                          )
                        : "Never"
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title={t("members-detail-linked-accounts")} />
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("members-detail-provider")}</TableCell>
                    <TableCell>{t("members-detail-account-id")}</TableCell>
                    <TableCell>{t("members-detail-linked-at")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {member.accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.providerId}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {account.accountId}
                      </TableCell>
                      <TableCell>
                        {account.createdAt
                          ? dayjs(account.createdAt).format("YYYY-MM-DD")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {member.accounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        {t("members-detail-no-accounts")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title={t("members-detail-recent-sessions")} />
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("members-detail-ip")}</TableCell>
                    <TableCell>{t("members-detail-ua")}</TableCell>
                    <TableCell>{t("members-detail-time")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {member.sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.ipAddress || "-"}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {session.userAgent || "-"}
                      </TableCell>
                      <TableCell>
                        {session.createdAt
                          ? dayjs(session.createdAt).format("MM-DD HH:mm")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {member.sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        {t("members-detail-no-sessions")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardHeader title={t("members-detail-purchases")} />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("members-detail-product")}</TableCell>
                <TableCell>{t("members-col-status")}</TableCell>
                <TableCell>{t("members-detail-amount")}</TableCell>
                <TableCell>{t("members-detail-period-start")}</TableCell>
                <TableCell>{t("members-detail-period-end")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {member.purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.productName}</TableCell>
                  <TableCell>
                    <Chip
                      label={purchase.status}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {purchase.currency} {purchase.amount}
                  </TableCell>
                  <TableCell>
                    {purchase.currentPeriodStart
                      ? dayjs(purchase.currentPeriodStart).format("YYYY-MM-DD")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {purchase.currentPeriodEnd
                      ? dayjs(purchase.currentPeriodEnd).format("YYYY-MM-DD")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {member.purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {t("members-detail-no-purchases")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
