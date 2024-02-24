import { useState } from "react"

import { APIPostData } from "@facebook-clone/api_client/main_api"
import { CommentsSection } from "./comments-section/comments-section"
import { ContentOrigin } from "./content-origin/content-origin"
import { ContentReactions } from "./content-reactions/content-reactions"
import { TextContent } from "./text-content/text-content"

import styles from "./post.module.scss"


type PostProps = {
  post: APIPostData
}

export const Post = (props: PostProps) => {
  const {post} = props
  const [commentVisibility, setCommentVisibility] = useState(false)

  // useEffect(() => console.log("post: ", post), [post])

  return (
    <div className={styles.container}>
      <ContentOrigin dateCreated={post.createdAt} user={post.owner} />
      <TextContent text={post.postText} />

      {/* {postData && postData.media && (
        <MediaContent media={postData.media} mediaType={postData.media_type} />
      )} */}

      <ContentReactions
        isAvailable={true}
        numberOfComments={post.comments?.length ?? 0}
        reactionsCount={post.likeCount}
        sharesCount={post.shareCount}
        commentVisibilityState={[commentVisibility, setCommentVisibility]}
      />

      {commentVisibility && <CommentsSection comments={post.comments ?? []} />}
    </div>
  )
}
