import React, { useTransition } from "react";
import { useLocale, useTranslations } from "use-intl";

import {
  Avatar,
  Chip,
  Fade,
  ListItemIcon,
  Menu,
  MenuItem,
  PopoverVirtualElement,
} from "@mui/material";

import { LocaleOption } from "@/constants";
import { setClientLocale } from "@/i18n/locale";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import NiMessages from "@/icons/nexture/ni-messages";
import { cn } from "@/lib/utils";

export default function UserLanguageSwitch() {
  const [anchorElLang, setAnchorElLang] = React.useState<
    EventTarget | Element | PopoverVirtualElement | null
  >(null);
  const openLang = Boolean(anchorElLang);
  const handleClickLang = (event: Event | React.SyntheticEvent) => {
    setAnchorElLang(event.currentTarget);
  };
  const handleCloseLang = () => {
    setAnchorElLang(null);
  };

  const t = useTranslations("dashboard");
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();

  function handleOnChangeLocale(value: LocaleOption) {
    startTransition(() => {
      setClientLocale(value);
    });
  }

  return (
    <>
      <MenuItem
        onClick={handleClickLang}
        className={cn(openLang && "bg-grey-500/10")}
        disabled={isPending}
      >
        <ListItemIcon>
          <NiMessages size={20} />
        </ListItemIcon>
        <div className="w-full"> {t("user-language")}</div>
        <Chip
          size="small"
          avatar={
            <Avatar alt={t(locale)} src={`/images/flags/${locale}.jpg`} />
          }
          label={t(locale)}
          variant="outlined"
        />
        <ListItemIcon>
          <NiChevronRightSmall
            size={20}
            className={cn(
              "mr-0 ml-1 transition-transform",
              openLang && "rotate-90",
            )}
          />
        </ListItemIcon>
      </MenuItem>
      <Menu
        anchorEl={anchorElLang as Element}
        disableScrollLock
        open={openLang}
        onClose={handleCloseLang}
        classes={{ paper: "mt-1 w-72" }}
        slots={{
          transition: Fade,
        }}
      >
        <MenuItem
          className={cn(locale === "en" && "active")}
          onClick={() => {
            handleCloseLang();
            handleOnChangeLocale("en");
          }}
        >
          <ListItemIcon>
            <Avatar className="nano" alt="English" src="/images/flags/en.jpg" />
          </ListItemIcon>
          {t("en")}
        </MenuItem>
        <MenuItem
          className={cn(locale === "ko" && "active")}
          onClick={() => {
            handleCloseLang();
            handleOnChangeLocale("ko");
          }}
        >
          <ListItemIcon>
            <Avatar className="nano" alt="Korean" src="/images/flags/ko.jpg" />
          </ListItemIcon>
          {t("ko")}
        </MenuItem>
      </Menu>
    </>
  );
}
