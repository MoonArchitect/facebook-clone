import { useState } from "react"

import { CommentsSection } from "./comments-section/comments-section"
import { ContentOrigin } from "./content-origin/content-origin"
import { ContentReactions } from "./content-reactions/content-reactions"
import { TextContent } from "./text-content/text-content"

import { useGetPostDataQuey } from "../../query-hooks/profile-query-hooks"
import { MediaContent } from "./media-content/media-content"
import styles from "./post.module.scss"


type PostProps = {
  postID: string
}

export const Post = (props: PostProps) => {
  const {postID} = props
  const {data: post, isSuccess} = useGetPostDataQuey(postID)
  const [isCommentFocused, setIsCommentFocused] = useState(false)

  if (!isSuccess) {
    return (
      <div className={styles.container}>
        oops no data
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ContentOrigin dateCreated={post.createdAt} postOwner={post.owner} postID={postID} />
      <TextContent text={post.postText} />

      {(post.postImages !== null && post.postImages.length > 0) && (
        <MediaContent images={post.postImages} />
      )}

      <ContentReactions
        postID={post.id}
        numberOfComments={post.comments?.length ?? 0}
        likedByCurrentUser={post.likedByCurrentUser}
        reactionsCount={post.likeCount}
        sharesCount={post.shareCount}
        onFocusComment={() => setIsCommentFocused(!isCommentFocused)}
      />

      <CommentsSection
        comments={post.comments ?? []}
        isCommentFocused={isCommentFocused}
        focusComment={() => setIsCommentFocused(true)}
        postID={postID} />
    </div>
  )
}
