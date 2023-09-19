import { ReactComponent as HelpIcon } from "@facebook-clone/assets/icons/help.svg"
import { ReactComponent as MailtIcon } from "@facebook-clone/assets/icons/mail.svg"
import { ReactComponent as WarningIcon } from "@facebook-clone/assets/icons/warning.svg"

import { DropdownItem, MenuTitleItem } from "../dropdown-items"
import { DropdownMenuPage } from "./dropdown-page/dropdown-page"

import styles from "../dropdown-menu.module.scss"

export const DropdownHelpPage = () => (
  <DropdownMenuPage id={2}>
    <div className={styles.menu}>
      <MenuTitleItem goToMenu={0} title="Help & Support" />

      <DropdownItem leftIcon={<HelpIcon />}>
        <span> Help Center </span>
      </DropdownItem>

      <DropdownItem leftIcon={<MailtIcon />}>
        <span> Support Inbox </span>
      </DropdownItem>

      <DropdownItem leftIcon={<WarningIcon />}>
        <span> Report a Problem </span>
      </DropdownItem>
    </div>
  </DropdownMenuPage>
)
