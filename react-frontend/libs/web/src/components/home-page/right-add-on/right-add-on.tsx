import { ReactComponent as PlusIcon } from "@facebook-clone/assets/icons/plus.svg"

import styles from "./right-add-on.module.scss"

export const RightAddOn = () => {
  return (
    <div className={styles.rightAddonContainer}>
      <div className={styles.content}>
        <div className={styles.sponsoredSection}>Sponsored</div>
        <div className={styles.separator}></div>
        <div className={styles.groupConversations}>Group conversations</div>
        <div className={styles.createNewGroup}>
          <div className={styles.icon}>
            <PlusIcon />
          </div>

          <div className={styles.title}>Create new group</div>
        </div>
      </div>
    </div>
  )
}
