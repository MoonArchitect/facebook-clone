"use client"

import { useGetHistoricUserPostsQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"
import { Feed } from "../feed/feed"

import { useSession } from "../utils/session-context"
import styles from "./profile-posts-tab.module.scss"

export const ProfilePosts = () => {
  const {userData} = useSession()
  const queryRes = useGetHistoricUserPostsQuery(userData?.id)

  if (userData === undefined)
    return "user not logged in"

  return (
    <div className={styles.feedContainer}>
      <Feed queryRes={queryRes} />
    </div>
  )
}
