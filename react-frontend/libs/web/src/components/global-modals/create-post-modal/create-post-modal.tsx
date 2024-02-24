"use client"

import { FormEvent, useCallback, useMemo, useRef, useState } from "react"
import Modal from "react-modal"

import { ReactComponent as PlusIcon } from "@facebook-clone/assets/icons/plus.svg"

import { getImageURLFromId } from "@facebook-clone/api_client/main_api"
import { useCreatePostMutation, useMeQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"
import clsx from "clsx"
import { ProfilePreview } from "../../ui/profile-preview/profile-preview"
import styles from "./create-post-modal.module.scss"

const VideoIcon = () => <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yE/r/epGAMnVkMsy.png?_nc_eui2=AeEWIj5mBPtRos9zMCvBhTVaLvvaxKiLzcEu-9rEqIvNwfYUTcGeuxPQhNVdLjIQuwtmbeI1ofts_EOPCEp0FDXe" className={styles.iconImage} alt="" />
const ImageIcon = () => <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yQ/r/74AG-EvEtBm.png?_nc_eui2=AeGI40qt-sq_wGIC4IbLAolPjLWb3nZ8TcaMtZvednxNxgiThUktEHGM1pQHJkQpPaRBfsdk7-DjbJuY7UPxeJqS" className={styles.iconImage} alt="" />
const PeopleIcon = () => <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yT/r/bvcq83GzJ4T.png?_nc_eui2=AeE_xlCQlDTHyUqxeAFJbLn43Uog0xyj1YXdSiDTHKPVhY7G5GBjUWsDSFcxAl9oRnh65Da1kQyz40GfbTaOhJL4" className={styles.iconImage} alt="" />
const EmojiIcon = () => <img src="https://static.xx.fbcdn.net/rsrc.php/v3/y7/r/_RWOIsUgWGL.png?_nc_eui2=AeHmi-iv8VZdJfcOM62FJDJopRYQ3zWJHxilFhDfNYkfGEnjqhDZHzk2okn4tVs7Grha0kA7UXm2IPfHq24AIBoW" className={styles.iconImage} alt="" />

export type CreatePostModalProps = {
  isOpen: boolean
  close: () => void
}

export const CreatePostModal = (props: CreatePostModalProps) => {
  const {isOpen, close} = props
  const {data} = useMeQuery()
  const [isEmptyText, setIsEmptyText] = useState(true)
  const editableDivRef = useRef<HTMLDivElement>(null)
  const {mutate: createPost, isPending} = useCreatePostMutation(data?.id ?? "unknown") // TODO fix this

  const updateIsEmptyText = useCallback((e: FormEvent<HTMLDivElement>) => {
    if (e.currentTarget.innerText === "" || e.currentTarget.innerText === "\n") {
      setIsEmptyText(true)
    } else if (isEmptyText) {
      setIsEmptyText(false)
    }
  }, [isEmptyText, setIsEmptyText])

  const createPostCallback = useCallback(() => {
    const text = editableDivRef.current?.innerText;
    if (text === undefined || text.trim() === "") {
      console.error("trying to create an empty post")
      return
    }
    createPost({text}, {
      onSuccess: () => close()
    })
  }, [createPost, close])

  const modalAppElement = useMemo(() => typeof window !== 'undefined' && document.getElementById('root') || undefined, [])

  return (
    <Modal
      className={styles.modalContainer}
      onRequestClose={() => close()}
      isOpen={isOpen}
      overlayClassName={styles.modalOverlay}
      appElement={modalAppElement}
    >
      <div className={styles.container} onSubmit={() => null}>
        {isPending && <div className={styles.loadingContainer}>
          <div className={styles.animatedBackground}>Uploading</div>
        </div>}
        <div className={styles.legend}>
          <div className={styles.text}>
            <h3>Create post</h3>
          </div>
          <button type="button" className={styles.closeButton} onClick={close}><PlusIcon /></button>
        </div>

        <div className={styles.lineDivider} />

        <div className={styles.profilePreviewContainer}>
          <ProfilePreview link="/profile" thumbnailURL={getImageURLFromId(data?.thumbnailID)} name={data?.name} />
        </div>

        <div className={styles.inputContainer}>
          {isEmptyText && <div className={styles.inputPlaceholder}>What's on your mind?</div>}
          <div ref={editableDivRef} className={styles.input} contentEditable onInput={updateIsEmptyText}></div>
        </div>

        <div className={styles.menuContainer}>
          <p>Add to your post</p>
          <div className={clsx(styles.iconContainer, styles.selected)}>
            <ImageIcon />
          </div>
          <div className={styles.iconContainer}>
            <VideoIcon />
          </div>
          <div className={styles.iconContainer}>
            <PeopleIcon />
          </div>
          <div className={styles.iconContainer}>
            <EmojiIcon />
          </div>
        </div>

        <div className={styles.submit} onClick={createPostCallback}>
          Post
        </div>
      </div>
    </Modal>
  )
}