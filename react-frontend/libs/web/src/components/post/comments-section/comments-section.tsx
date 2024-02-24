// import DefaultUserProfilePicture from "assets/images/profile-picture.png"

import { APICommentData } from "@facebook-clone/api_client/main_api"

import { useMemo } from "react"
import styles from "./comments-section.module.scss"

type CommentProps = {
  comment: APICommentData
}

export const Comment = (props: CommentProps) => {
  const { comment } = props
  const {ownerId, text, createdAt} = comment
  const createdAtDate = useMemo(() => new Date(createdAt), [createdAt])

  return (
    <div className={styles.container}>
      <div className={styles.userIcon}>
        {/* <img src={userIconSrc} alt="" /> */}
      </div>
      <div className={styles.messageContainer}>
        <div className={styles.message}>
          <div className={styles.userName}>{ownerId}</div>
          <div className={styles.text}>{text}</div>
        </div>
        <div className={styles.reactionContainer}>
          <div className={styles.reactionButton}>Like</div>
          <div className={styles.reactionButton}>Reply</div>
          <div className={styles.reactionButton}>Share</div>
          <div className={styles.reactionInfo}>{createdAtDate.toDateString()}</div>
          {/* <div className={styles.reactionInfo}>{wasEdited && "Edited"}</div> */}
        </div>
      </div>
    </div>
  )
}

type CommentsSectionProps = {
  comments: APICommentData[]
}

export const CommentsSection = (props: CommentsSectionProps) => {
  const { comments } = props

  return (
    <div className={styles.commentsSectionContainer}>
      {comments.map((data) => (
        <Comment
          // use comment id
          key={`${data.ownerId}-${data.createdAt}`}
          comment={data}
        />
      ))}
    </div>
  )
}
