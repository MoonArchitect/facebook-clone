import { ReactComponent as CommentIcon } from "@facebook-clone/assets/icons/comment.svg"
import { ReactComponent as LikeFilledIcon } from "@facebook-clone/assets/icons/like-filled.svg"
import { ReactComponent as LikeIcon } from "@facebook-clone/assets/icons/like.svg"
import { ReactComponent as ShareIcon } from "@facebook-clone/assets/icons/share.svg"

import { LineDivider } from "../../ui"
import { PostData } from "../post"

import styles from "./content-reactions.module.scss"

interface ContentReactionsProps {
  readonly postData: PostData
  commentVisibilityState: [boolean, (val: boolean) => void]
}

export const ContentReactions = (props: ContentReactionsProps) => {
  const { postData, commentVisibilityState } = props
  const [commentVisibility, setCommentVisibility] = commentVisibilityState

  return (
    <>
      <div className={styles.container}>
        <div className={styles.icon}>
          <LikeFilledIcon />
        </div>
        <div className={styles.number}>
          {postData ? postData.reactionsCount : "L ..."}
        </div>
        <div
          className={styles.commentsNumber}
          onClick={() => {
            setCommentVisibility(!commentVisibility)
          }}
        >
          {postData
            ? postData.comments.length > 1 &&
              `${postData.comments.length} Comments`
            : "L ..."}
        </div>
        <div className={styles.sharesNumber}>
          {postData ? postData.sharesCount : "L ..."}
        </div>
      </div>
      {postData && <LineDivider />}
      {postData && (
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
