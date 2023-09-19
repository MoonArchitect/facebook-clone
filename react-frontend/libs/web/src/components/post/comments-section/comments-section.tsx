// import DefaultUserProfilePicture from "assets/images/profile-picture.png"

import { CommentData, PostData } from "../post"

import styles from "./comments-section.module.scss"

export const Comment = (props: CommentData) => {
  const { username, message, date, userIconSrc, wasEdited } = props

  return (
    <div className={styles.container}>
      <div className={styles.userIcon}>
        <img src={userIconSrc} alt="" />
      </div>
      <div className={styles.messageContainer}>
        <div className={styles.message}>
          <div className={styles.userName}>{username}</div>
          <div className={styles.text}>{message}</div>
        </div>
        <div className={styles.reactionContainer}>
          <div className={styles.reactionButton}>Like</div>
          <div className={styles.reactionButton}>Reply</div>
          <div className={styles.reactionButton}>Share</div>
          <div className={styles.reactionInfo}>{date.toDateString()}</div>
          <div className={styles.reactionInfo}>{wasEdited && "Edited"}</div>
        </div>
      </div>
    </div>
  )
}

type CommentsSectionProps = Pick<PostData, "comments">

export const CommentsSection = (props: CommentsSectionProps) => {
  const { comments } = props

  return (
    <div className={styles.commentsSectionContainer}>
      {comments.map((data) => (
        <Comment
          // use comment id
          key={`${data.username}-${data.date.toISOString()}`}
          {...data}
        />
      ))}
    </div>
  )
}
