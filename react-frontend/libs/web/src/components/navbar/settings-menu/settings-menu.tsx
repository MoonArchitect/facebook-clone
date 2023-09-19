import { ReactComponent as BellIcon } from "@facebook-clone/assets/icons/bell.svg"
import { ReactComponent as CaretIcon } from "@facebook-clone/assets/icons/caret.svg"
import { ReactComponent as MenuIcon } from "@facebook-clone/assets/icons/menu.svg"
import { ReactComponent as MessengerIcon } from "@facebook-clone/assets/icons/messenger.svg"

import { DropdownMenu } from "./dropdown-menu/dropdown-menu"
import { FindFriendsNavItem, MiniProfileNavItem, NavItem } from "./nav-items"

import styles from "./settings-menu.module.scss"

export const SettingsMenu = () => {
  return (
    <ul className={styles.navbarNav}>
      <FindFriendsNavItem />
      <MiniProfileNavItem />
      <NavItem icon={<MenuIcon />} hintMessage="Menu" />
      <NavItem icon={<MessengerIcon />} hintMessage="Messenger" />
      <NavItem icon={<BellIcon />} hintMessage="Notifications" />

      <NavItem icon={<CaretIcon />} hintMessage="Your Profile" shiftLeft>
        <DropdownMenu></DropdownMenu>
      </NavItem>
    </ul>
  )
}
