import { ReactComponent as CommentIcon } from "@facebook-clone/assets/icons/comment.svg"
import { ReactComponent as LikeFilledIcon } from "@facebook-clone/assets/icons/like-filled.svg"
import { ReactComponent as LikeIcon } from "@facebook-clone/assets/icons/like.svg"
import { ReactComponent as ShareIcon } from "@facebook-clone/assets/icons/share.svg"

import { LineDivider } from "../../ui"

import clsx from "clsx"
import { useCallback } from "react"
import { useLikePostMutation, useSharePostMutation } from "../../../query-hooks/profile-query-hooks"
import { useGlobalModal } from "../../global-modals/global-modals"
import { useSession } from "../../utils/session-context"
import styles from "./content-reactions.module.scss"

interface ContentReactionsProps {
  postID: string
  likedByCurrentUser: boolean
  numberOfComments: number
  reactionsCount: number
  sharesCount: number
  onFocusComment: () => void
}

export const ContentReactions = (props: ContentReactionsProps) => {
  const { postID, likedByCurrentUser, numberOfComments, reactionsCount, sharesCount, onFocusComment } = props

  const {state: {isLoggedIn}} = useSession()

  const {mutate: likePost} = useLikePostMutation()
  const {mutate: sharePost} = useSharePostMutation()
  const {showSigninModal} = useGlobalModal()

  const requireAuthCallback = useCallback((func: () => void) => {
    return () => {
      if (isLoggedIn) func()
      else showSigninModal()
    }
  }, [isLoggedIn, showSigninModal])

  return (
    <>
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.icon}>
            <LikeFilledIcon />
          </div>
          {reactionsCount > 0 && <div className={styles.number}>
            {reactionsCount}
          </div>}
        </div>

        <div className={styles.column}>
          {numberOfComments > 0 && <div
            className={styles.commentsNumber}
            onClick={onFocusComment}
          >
            {numberOfComments} Comment{numberOfComments>1 ? "s" : ""}
          </div>}
          {sharesCount > 0 && <div className={styles.sharesNumber}>
            {sharesCount} Shares
          </div>}
        </div>
      </div>

      <LineDivider />

      <div className={styles.menu}>
        <div
          className={clsx(styles.button, likedByCurrentUser && styles.activeButton)}
          onClick={requireAuthCallback(() => likePost({postID}))}
        >
          <LikeIcon /> &thinsp; Like
        </div>
        <div
          className={styles.button}
          onClick={onFocusComment}
        >
          <CommentIcon /> &thinsp; Comment
        </div>
        <div className={styles.button} onClick={requireAuthCallback(() => sharePost({postID}))}>
          <ShareIcon /> &thinsp; Share
        </div>
      </div>

      <LineDivider />
    </>
  )
}
