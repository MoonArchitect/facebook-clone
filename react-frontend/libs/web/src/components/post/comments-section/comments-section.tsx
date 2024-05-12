import { APICommentData, getImageURLFromId } from "@facebook-clone/api_client/src"
import { ReactComponent as ArrowIcon } from "@facebook-clone/assets/icons/arrow.svg"

import clsx from "clsx"
import Link from "next/link"
import { FormEvent, KeyboardEvent, useCallback, useMemo, useRef, useState } from "react"
import { useCreateCommentMutation } from "../../../query-hooks/profile-query-hooks"
import { getDateString } from "../../utils/date"
import { RequireAuthenticated } from "../../utils/require-auth"
import { useSession } from "../../utils/session-context"
import styles from "./comments-section.module.scss"

type CommentProps = {
  comment: APICommentData
}

export const Comment = (props: CommentProps) => {
  const { comment } = props
  const {owner, text, createdAt} = comment
  const createdAtDate = useMemo(() => getDateString(createdAt), [createdAt])

  return (
    <div className={styles.container}>
      <Link href={`/user/${owner.username}`} className={styles.userIcon}>
        <img src={getImageURLFromId(owner.thumbnailID)} alt="profile thumbnail" />
      </Link>
      <div className={styles.messageContainer}>
        <div className={styles.message}>
          <Link href={`/user/${owner.username}`}  className={styles.userName}>{owner.name}</Link>
          <div className={styles.text}>{text}</div>
        </div>
        <div className={styles.reactionContainer}>
          <div className={styles.reactionInfo}>{createdAtDate}</div>
          <div className={styles.reactionButton}>Like</div>
          <div className={styles.reactionButton}>Reply</div>
          <div className={styles.reactionButton}>Share</div>
          {/* <div className={styles.reactionInfo}>{wasEdited && "Edited"}</div> */}
        </div>
      </div>
    </div>
  )
}

type CommentsSectionProps = {
  comments: APICommentData[]
  postID: string
  isCommentFocused: boolean
  focusComment: () => void
}

export const CommentsSection = (props: CommentsSectionProps) => {
  const { comments, isCommentFocused, postID, focusComment } = props
  const [commentsVisible, setCommentsVisible] = useState(1)

  const showMoreCommentsCallback = useCallback(() =>
    setCommentsVisible(Math.min(commentsVisible + 2, comments.length)),
  [commentsVisible, comments.length])

  return (
    <div className={styles.commentsSectionContainer}>

      {comments[0] !== undefined &&
        comments.map((comment, i) => i < commentsVisible
          ? <Comment key={`comment-${comment.createdAt}-${comment.owner.id}`} comment={comment} />
          : null)}
      {/* TODO: use comment id as key */}

      {comments.length > commentsVisible &&
         <div className={styles.showMoreButton} onClick={showMoreCommentsCallback}>View more comments</div>
      }

      <RequireAuthenticated>
        <CreateCommentSection isCommentFocused={isCommentFocused} focusComment={focusComment} postID={postID} />
      </RequireAuthenticated>
    </div>
  )
}

const CreateCommentSection = (props: Pick<CommentsSectionProps, "isCommentFocused" | "focusComment" | "postID">) => {
  const {isCommentFocused, postID, focusComment} = props
  const [isEmptyText, setIsEmptyText] = useState(true)
  const {userData} = useSession()
  const {mutate: createComment, isPending} = useCreateCommentMutation(postID)

  const editableDivRef = useRef<HTMLDivElement>(null)

  const updateIsEmptyText = useCallback((e: FormEvent<HTMLDivElement>) => {
    if (e.currentTarget.innerText === "" || e.currentTarget.innerText === "\n") {
      setIsEmptyText(true)
    } else if (isEmptyText) {
      setIsEmptyText(false)
    }
  }, [isEmptyText, setIsEmptyText])

  const createCommentCallback = useCallback(() => {
    if (isPending) {
      console.warn("pending request")
      return
    }

    if (editableDivRef.current === null || editableDivRef.current.innerText.trim() === "") {
      console.error("comment is empty") // TODO: client side validation, error if attempted.
      return
    }

    createComment({text: editableDivRef.current.innerText.trim()}, {onSuccess: () => {
      if (editableDivRef.current) {
        editableDivRef.current.innerText = ""
        setIsEmptyText(true)
      }
    }
    })
  }, [isPending, createComment])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      createCommentCallback()
    }
  }

  return (
    <div className={styles.createComment}>
      <div className={clsx(styles.loadingCover, isPending && styles.loading)} />

      <Link className={styles.userLink} href="/profile">
        <img
          className={styles.userThumbnail}
          src={userData?.thumbnailID ? getImageURLFromId(userData.thumbnailID) : ""}
          alt="profile thumbnail"/>
      </Link>
      <div className={clsx(styles.inputContainer, isCommentFocused && styles.expandedInput)} onFocus={focusComment}>
        {isEmptyText && <div className={styles.inputPlaceholder}>Submit your first comment</div>}
        <div
          ref={editableDivRef}
          className={styles.input}
          contentEditable
          onInput={updateIsEmptyText}
          onKeyDown={handleKeyDown}></div>
        <ArrowIcon
          className={clsx(styles.arrowIcon, isCommentFocused && styles.visible)}
          onClick={createCommentCallback} />
      </div>
    </div>
  )
}
