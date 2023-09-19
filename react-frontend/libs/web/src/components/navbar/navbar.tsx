import { NavigationMenu } from "./navigation-menu/navigation-menu"
import { SearchMenu } from "./search-menu/search-menu"
import { SettingsMenu } from "./settings-menu/settings-menu"

import styles from "./navbar.module.scss"

export const Navbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.layer_1}>
        <NavigationMenu />
      </div>

      <div className={styles.layer_2}>
        <SearchMenu />
        <SettingsMenu />
      </div>
    </div>
  )
}
