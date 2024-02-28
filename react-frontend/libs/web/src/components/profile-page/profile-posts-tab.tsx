"use client"

import { useGetHistoricUserPostsQuery, useProfileByUsernameQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"
import { Feed } from "../feed/feed"

import { useSession } from "../utils/session-context"
import styles from "./profile-posts-tab.module.scss"

export type ProfilePostsProps = {
  username: string
}

export const ProfilePosts = (props: ProfilePostsProps) => {
  const {username} = props
  const {data} = useProfileByUsernameQuery(username)
  const {userData} = useSession()
  const queryRes = useGetHistoricUserPostsQuery(data?.id)

  return (
    <div className={styles.feedContainer}>
      <Feed queryRes={queryRes} includeCreatePostSection={userData && userData.id === data?.id} />
    </div>
  )
}
