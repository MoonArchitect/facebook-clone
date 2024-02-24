"use client"

import { useGetHistoricUserPostsQuery, useMeQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"
import { Post } from "../post/post"
import { CreatePostSection } from "./create-post-section/create-post-section"

import styles from "./feed.module.scss"

export const Feed = () => {
  const {data: userData} = useMeQuery()
  const {data} = useGetHistoricUserPostsQuery(userData?.id ?? "", userData?.id !== undefined)

  return (
    <div className={styles.container}>
      <CreatePostSection />
      {data && data.map((post) => (
        <Post post={post} />
      ))}
    </div>
  )
}
