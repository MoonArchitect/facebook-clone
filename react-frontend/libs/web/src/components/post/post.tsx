import { useState } from "react"

import { CommentsSection } from "./comments-section/comments-section"
import { ContentOrigin } from "./content-origin/content-origin"
import { ContentReactions } from "./content-reactions/content-reactions"
import { TextContent } from "./text-content/text-content"

import { useGetPostDataQuey } from "@facebook-clone/web/query-hooks/profile-query-hooks"
import styles from "./post.module.scss"


type PostProps = {
  postID: string
}

export const Post = (props: PostProps) => {
  const {postID} = props
  const {data: post, isSuccess} = useGetPostDataQuey(postID)
  const [commentVisibility, setCommentVisibility] = useState(false)

  if (!isSuccess) {
    return (
      <div className={styles.container}>
        oops no data
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ContentOrigin dateCreated={post.createdAt} user={post.owner} />
      <TextContent text={post.postText} />

      {/* {postData && postData.media && (
        <MediaContent media={postData.media} mediaType={postData.media_type} />
      )} */}

      <ContentReactions
        postID={post.id}
        isAvailable={true}
        numberOfComments={post.comments?.length ?? 0}
        likedByCurrentUser={post.likedByCurrentUser}
        reactionsCount={post.likeCount}
        sharesCount={post.shareCount}
        commentVisibilityState={[commentVisibility, setCommentVisibility]}
      />

      {commentVisibility && <CommentsSection comments={post.comments ?? []} />}
    </div>
  )
}
