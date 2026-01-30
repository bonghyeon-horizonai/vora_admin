import UserLanguageSwitch from "./user-language-switch";
import UserModeSwitch from "./user-mode-switch";
import UserThemeSwitch from "./user-theme-switch";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Fade,
  ListItemIcon,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popper from "@mui/material/Popper";

import {
  adminLogout,
  getAuthenticatedAdmin,
} from "@/features/admin/auth/actions";
import NiBuilding from "@/icons/nexture/ni-building";
import NiDocumentFull from "@/icons/nexture/ni-document-full";
import NiFolder from "@/icons/nexture/ni-folder";
import NiQuestionHexagon from "@/icons/nexture/ni-question-hexagon";
import NiSettings from "@/icons/nexture/ni-settings";
import NiUser from "@/icons/nexture/ni-user";
import { cn } from "@/lib/utils";

export default function User() {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const t = useTranslations("dashboard");
  const [admin, setAdmin] = useState<{
    id: string;
    email: string;
    name: string | null;
    role: string | null;
    profileImageUrl: string | null;
  } | null>(null);

  useEffect(() => {
    async function fetchAdmin() {
      const data = await getAuthenticatedAdmin();
      setAdmin(data);
    }
    fetchAdmin();
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const router = useRouter();

  return (
    <>
      <Box ref={anchorRef}>
        {/* Desktop button */}
        <Button
          variant="text"
          color="text-primary"
          className={cn(
            "group hover:bg-grey-25 ml-2 hidden gap-2 rounded-lg py-0! pr-0! hover:py-1! hover:pr-1.5! md:flex",
            open && "active bg-grey-25 py-1! pr-1.5!",
          )}
          onClick={handleToggle}
        >
          <Box>{admin?.name || admin?.email || "Admin"}</Box>
          <Avatar
            alt={admin?.name || "avatar"}
            src={admin?.profileImageUrl || ""}
            className={cn(
              "large transition-all group-hover:ml-0.5 group-hover:h-8 group-hover:w-8",
              open && "ml-0.5 h-8! w-8!",
            )}
          />
        </Button>
        {/* Desktop button */}

        {/* Mobile button */}
        <Button
          variant="text"
          size="large"
          color="text-primary"
          className={cn(
            "hover:bg-grey-25 icon-only hover-icon-shrink [&.active]:text-primary group mr-1 ml-1 p-0! hover:p-1.5! md:hidden",
            open && "active bg-grey-25 p-1.5!",
          )}
          onClick={handleToggle}
          startIcon={
            <Avatar
              alt={admin?.name || "avatar"}
              src={admin?.profileImageUrl || ""}
              className={cn(
                "large transition-all group-hover:h-7 group-hover:w-7",
                open && "h-7! w-7!",
              )}
            />
          }
        />
        {/* Mobile button */}
      </Box>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        className="mt-3!"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Box>
              <ClickAwayListener onClickAway={handleClose}>
                <Card className="shadow-darker-sm!">
                  <CardContent>
                    <Box className="max-w-64 sm:w-72 sm:max-w-none">
                      <Box className="mb-4 flex flex-col items-center">
                        <Avatar
                          alt={admin?.name || "avatar"}
                          src={admin?.profileImageUrl || ""}
                          className="large mb-2"
                        />
                        <Typography variant="subtitle1" component="p">
                          {admin?.name || admin?.email || "Admin"}
                        </Typography>
                        <Typography
                          variant="body2"
                          component="p"
                          className="text-text-secondary -mt-2"
                        >
                          {admin?.email || ""}
                        </Typography>
                      </Box>
                      <Divider className="large" />
                      <MenuList className="p-0">
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            router.push("#");
                          }}
                        >
                          <ListItemIcon>
                            <NiUser size={20} />
                          </ListItemIcon>
                          {t("user-overview")}
                        </MenuItem>
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            router.push("#");
                          }}
                        >
                          <ListItemIcon>
                            <NiSettings size={20} />
                          </ListItemIcon>
                          {t("user-profile")}
                        </MenuItem>
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            router.push("#");
                          }}
                        >
                          <ListItemIcon>
                            <NiBuilding size={20} />
                          </ListItemIcon>
                          {t("user-issues")}
                        </MenuItem>
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            router.push("#");
                          }}
                        >
                          <ListItemIcon>
                            <NiFolder size={20} />
                          </ListItemIcon>
                          {t("user-projects")}
                        </MenuItem>
                        <Divider className="large" />

                        <UserModeSwitch />
                        <UserThemeSwitch />
                        <UserLanguageSwitch />

                        <Divider className="large" />
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            router.push("#");
                          }}
                        >
                          <ListItemIcon>
                            <NiDocumentFull size={20} />
                          </ListItemIcon>
                          {t("user-documentation")}
                        </MenuItem>
                        <MenuItem
                          onClick={(event) => {
                            handleClose(event);
                            router.push("#");
                          }}
                        >
                          <ListItemIcon>
                            <NiQuestionHexagon size={20} />
                          </ListItemIcon>
                          {t("user-help")}
                        </MenuItem>
                      </MenuList>
                      <Box className="my-8"></Box>
                      <Button
                        variant="outlined"
                        size="tiny"
                        color="grey"
                        className="w-full"
                        onClick={async () => {
                          await adminLogout();
                          router.refresh(); // Clear client cache
                          router.push("/auth/sign-in");
                        }}
                      >
                        {t("user-sign-out")}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </ClickAwayListener>
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  );
}
