
import { Feed } from "../feed/feed"
import { NavigationMenu } from "./navigation-menu/navigation-menu"
import { RightAddOn } from "./right-add-on/right-add-on"

import styles from "./home.module.scss"


export const HomePage = () => {
  return (
    <div className={styles.container}>
      <NavigationMenu />
      <Feed />
      <RightAddOn />
    </div>
  )
}
