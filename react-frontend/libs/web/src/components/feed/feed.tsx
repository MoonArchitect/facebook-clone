"use client"

import { Post } from "../post/post"
import { CreatePostSection } from "./create-post-section/create-post-section"

import { UseInfiniteQueryResult } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useEffect, useRef } from "react"
import styles from "./feed.module.scss"

export type FeedProps = {
  queryRes: UseInfiniteQueryResult<string[], AxiosError>
  includeCreatePostSection?: boolean
}

export const Feed = (props: FeedProps) => {
  const {queryRes, includeCreatePostSection} = props
  const {data, isLoading, isFetchingNextPage, fetchNextPage} = queryRes
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ref = loaderRef.current
    const observer = new IntersectionObserver((intersections) => {
      if (!isLoading && intersections[0].isIntersecting) {
        fetchNextPage()
      }
    }, {
      root: null,
      threshold: 0,
      rootMargin: "100%",
    })

    if (ref) {
      observer.observe(ref)
    }

    return () => {
      if (ref) observer.unobserve(ref)
    }
  }, [isLoading, isFetchingNextPage, fetchNextPage])

  return (
    <div className={styles.container}>
      {includeCreatePostSection && <CreatePostSection />}
      {data && data.map((postID) => (
        <Post key={`post-${postID}`} postID={postID} />
      ))}
      <div ref={loaderRef} />
    </div>
  )
}
