import { ReactComponent as ActivityLogIcon } from "@facebook-clone/assets/icons/activitylog.svg"
import { ReactComponent as CogIcon } from "@facebook-clone/assets/icons/cog.svg"
import { ReactComponent as GlobeIcon } from "@facebook-clone/assets/icons/globe.svg"
import { ReactComponent as LockIcon } from "@facebook-clone/assets/icons/lock.svg"
import { ReactComponent as NewsFeedIcon } from "@facebook-clone/assets/icons/newsfeed.svg"

import { DropdownItem, MenuTitleItem } from "../dropdown-items"
import { DropdownMenuPage } from "./dropdown-page/dropdown-page"

import styles from "../dropdown-menu.module.scss"

export const DropdownSettingsPage = () => (
  <DropdownMenuPage id={1}>
    <div className={styles.menu}>
      <MenuTitleItem goToMenu={0} title="Settings & Privacy" />

      <DropdownItem leftIcon={<CogIcon />}>
        <span> Settings </span>
      </DropdownItem>

      <DropdownItem leftIcon={<LockIcon />}>
        <span> Privacy Checkup </span>
      </DropdownItem>

      <DropdownItem leftIcon={<LockIcon />}>
        <span> Privacy Center </span>
      </DropdownItem>

      <DropdownItem leftIcon={<ActivityLogIcon />}>
        <span> Activity Log </span>
      </DropdownItem>

      <DropdownItem leftIcon={<NewsFeedIcon />}>
        <span> News Feed Preferences </span>
      </DropdownItem>

      <DropdownItem leftIcon={<GlobeIcon />}>
        <span> Language </span>
      </DropdownItem>
    </div>
  </DropdownMenuPage>
)
