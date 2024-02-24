import { ReactComponent as CommentIcon } from "@facebook-clone/assets/icons/comment.svg"
import { ReactComponent as LikeFilledIcon } from "@facebook-clone/assets/icons/like-filled.svg"
import { ReactComponent as LikeIcon } from "@facebook-clone/assets/icons/like.svg"
import { ReactComponent as ShareIcon } from "@facebook-clone/assets/icons/share.svg"

import { LineDivider } from "../../ui"

import styles from "./content-reactions.module.scss"

interface ContentReactionsProps {
  isAvailable: boolean
  numberOfComments?: number
  reactionsCount?: number
  sharesCount?: number
  commentVisibilityState: [boolean, (val: boolean) => void]
}

export const ContentReactions = (props: ContentReactionsProps) => {
  const { isAvailable, numberOfComments, reactionsCount, sharesCount, commentVisibilityState } = props
  const [commentVisibility, setCommentVisibility] = commentVisibilityState

  return (
    <>
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.icon}>
            <LikeFilledIcon />
          </div>
          <div className={styles.number}>
            {reactionsCount ? reactionsCount : "..."}
          </div>
        </div>

        <div className={styles.column}>
          {numberOfComments !== undefined && numberOfComments > 1 && <div
            className={styles.commentsNumber}
            onClick={() => {
              setCommentVisibility(!commentVisibility)
            }}
          >
            {numberOfComments} Comments
          </div>}
          <div className={styles.sharesNumber}>
            {sharesCount ? sharesCount : "..."} Shares
          </div>
        </div>
      </div>
      {isAvailable && <LineDivider />}
      {isAvailable && (
        <div className={styles.menu}>
          <div className={styles.button}>
            <LikeIcon /> &thinsp; Like
          </div>
          <div
            className={styles.button}
            onClick={() => {
              setCommentVisibility(!commentVisibility)
            }}
          >
            <CommentIcon /> &thinsp; Comment
          </div>
          <div className={styles.button}>
            <ShareIcon /> &thinsp; Share
          </div>
        </div>
      )}

      {commentVisibility && <LineDivider />}
    </>
  )
}
