import { ReactComponent as ChevronIcon } from "@facebook-clone/assets/icons/chevron.svg"
import { ReactComponent as CogIcon } from "@facebook-clone/assets/icons/cog.svg"
import { ReactComponent as DarkModeIcon } from "@facebook-clone/assets/icons/darkmode.svg"
import { ReactComponent as HelpIcon } from "@facebook-clone/assets/icons/help.svg"
import { ReactComponent as LogoutIcon } from "@facebook-clone/assets/icons/logout.svg"

import { DropdownItem, MiniProfile } from "../dropdown-items"
import { DropdownMenuPage } from "./dropdown-page/dropdown-page"

import styles from "../dropdown-menu.module.scss"

export const DropdownHomePage = () => (
  <DropdownMenuPage id={0}>
    <div className={styles.menu}>
      <MiniProfile />

      <hr
        style={{
          width: "95%",
          color: "#CED0D4",
          borderColor: "#CED0D4",
          backgroundColor: "#CED0D4",
          height: "1px",
          borderWidth: "0px",
        }}
      ></hr>

      <DropdownItem
        leftIcon={<CogIcon />}
        rightIcon={<ChevronIcon />}
        goToMenu={1}
      >
        <span> Settings & Privacy </span>
      </DropdownItem>

      <DropdownItem
        leftIcon={<HelpIcon />}
        rightIcon={<ChevronIcon />}
        goToMenu={2}
      >
        <span> Help & Support </span>
      </DropdownItem>

      <DropdownItem
        leftIcon={<DarkModeIcon />}
        rightIcon={<ChevronIcon />}
        goToMenu={3}
      >
        <span> Display & Accessibility </span>
      </DropdownItem>

      <DropdownItem leftIcon={<LogoutIcon />}>
        <span> Log out </span>
      </DropdownItem>

      <span
        style={{
          fontSize: "12px",
          fontWeight: "100",
          color: "var(--secondary-text)",
          paddingLeft: "5px",
        }}
      >
        Privacy · Terms · Advertising · Ad Choices · Cookies · More
      </span>
    </div>
  </DropdownMenuPage>
)
