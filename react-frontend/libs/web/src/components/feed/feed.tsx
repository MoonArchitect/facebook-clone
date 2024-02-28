"use client"

import { Post } from "../post/post"
import { CreatePostSection } from "./create-post-section/create-post-section"

import { UseInfiniteQueryResult } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useEffect, useRef } from "react"
import styles from "./feed.module.scss"

export type FeedProps = {
  queryRes: UseInfiniteQueryResult<string[], AxiosError>
}

export const Feed = (props: FeedProps) => {
  const {queryRes} = props
  const {data, isLoading, isFetchingNextPage, fetchNextPage} = queryRes
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ref = loaderRef.current
    console.log("ref: ", ref, "isLoading: ", isLoading)
    const observer = new IntersectionObserver((intersections) => {
      if (!isLoading && intersections[0].isIntersecting) {
        console.log("loading!")
        fetchNextPage()
      }
    }, {
      root: null,
      threshold: 0,
      rootMargin: "100%",
    })
    if (ref) {
      console.log("sub: ", ref)
      observer.observe(ref)
    }

    return () => {
      console.log("unsub: ", ref)
      if (ref) observer.unobserve(ref)
    }
  }, [isLoading, isFetchingNextPage, fetchNextPage])

  return (
    <div className={styles.container}>
      <CreatePostSection />
      {data && data.map((postID) => (
        <Post key={`post-${postID}`} postID={postID} />
      ))}
      <div ref={loaderRef} />
    </div>
  )
}
