import { Feed } from "../feed/feed"

import styles from "./profile-posts-tab.module.scss"

export const ProfilePosts = () => {
  return (
    <div className={styles.feedContainer}>
      <Feed />
    </div>
  )
}
