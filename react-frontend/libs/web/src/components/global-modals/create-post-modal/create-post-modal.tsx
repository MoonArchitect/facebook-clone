"use client"

import { FormEvent, MouseEvent, useCallback, useMemo, useRef, useState } from "react"
import Modal from "react-modal"

import { ReactComponent as PlusIcon } from "@facebook-clone/assets/icons/plus.svg"

import { getImageURLFromId } from "@facebook-clone/api_client/main_api"
import { useUploadPostImage } from "@facebook-clone/web/query-hooks/asset-query-hooks"
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
  const [isImageAttached, setIsImageAttached] = useState(false)
  const [imagePreviewURL, setImagePreviewURL] = useState<string | undefined>(undefined)
  const editableDivRef = useRef<HTMLDivElement>(null)
  const coverImageUploadRef = useRef<HTMLInputElement>(null)
  const {mutate: createPost, isPending: isCreatingPost} = useCreatePostMutation(data?.id ?? "unknown") // TODO fix this nullish coalescing
  const {mutate: uploadPostImage, isPending: isUploadingImage} = useUploadPostImage()

  const isPendingUpload = useMemo(() => isCreatingPost || isUploadingImage, [isCreatingPost, isUploadingImage])

  const updateIsEmptyText = useCallback((e: FormEvent<HTMLDivElement>) => {
    if (e.currentTarget.innerText === "" || e.currentTarget.innerText === "\n") {
      setIsEmptyText(true)
    } else if (isEmptyText) {
      setIsEmptyText(false)
    }
  }, [isEmptyText, setIsEmptyText])

  const closeCallback = useCallback(() => {
    if(imagePreviewURL) URL.revokeObjectURL(imagePreviewURL)
    setImagePreviewURL("")
    close()
  }, [imagePreviewURL, setImagePreviewURL, close])

  const createPostCallback = useCallback(() => {
    const text = editableDivRef.current?.innerText;
    if (text === undefined || text.trim() === "") {
      console.error("trying to create an empty post")
      return
    }

    const attachImage = imagePreviewURL !== undefined && imagePreviewURL !== ""
    console.log("attachImage: ", attachImage)

    createPost({text, attachImage}, {
      onSuccess: async (resp) => {
        if (attachImage) {
          const blob = await fetch(imagePreviewURL).then(r => r.blob());
          uploadPostImage({id: resp.imageID, img: blob}, {
            onSuccess: () => closeCallback()
          })
        } else {
          closeCallback()
        }
      }
    })
  }, [imagePreviewURL, uploadPostImage, closeCallback, createPost])

  const onImageChangeCallback = useOnCoverImageChangeCallback(setImagePreviewURL)
  const selectNewImage = useCallback((e: MouseEvent<HTMLDivElement> | MouseEvent<HTMLButtonElement>) => {
    coverImageUploadRef.current?.click()
    e.stopPropagation()
  }, [])

  const modalAppElement = useMemo(() => typeof window !== 'undefined' && document.getElementById('root') || undefined, [])

  return (
    <Modal
      className={styles.modalContainer}
      onRequestClose={() => closeCallback()}
      isOpen={isOpen}
      overlayClassName={styles.modalOverlay}
      appElement={modalAppElement}
    >
      <div className={styles.container} onSubmit={() => null}>
        {isPendingUpload && <div className={styles.loadingContainer}>
          <div className={styles.animatedBackground}>Uploading</div>
        </div>}
        <div className={styles.legend}>
          <div className={styles.text}>
            <h3>Create post</h3>
          </div>
          <button type="button" className={styles.closeButton} onClick={closeCallback}><PlusIcon /></button>
        </div>

        <div className={styles.lineDivider} />

        <div className={styles.profilePreviewContainer}>
          <ProfilePreview link="/profile" thumbnailURL={getImageURLFromId(data?.thumbnailID)} name={data?.name} />
        </div>

        <div className={styles.inputContainer}>
          {isEmptyText && <div className={styles.inputPlaceholder}>What's on your mind?</div>}
          <div ref={editableDivRef} className={styles.input} contentEditable onInput={updateIsEmptyText}></div>
        </div>

        {isImageAttached && <div className={styles.imagePreviewContainer} onClick={selectNewImage}>
          <img className={styles.imagePreview} src={imagePreviewURL} alt="attached image preview" />
        </div>}

        <input
          type="file"
          accept="image/*"
          ref={coverImageUploadRef}
          className={styles.hiddenInput}
          onChangeCapture={onImageChangeCallback}
        />

        <div className={styles.menuContainer}>
          <p>Add to your post</p>
          <div className={clsx(styles.iconContainer, isImageAttached && styles.selected)} onClick={() => setIsImageAttached(!isImageAttached)}>
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

const maxImageSize = 5 * 1024 * 1024 // TODO: ugly, move into config

// TODO: ugly, and copied line for line from anotehr component, generalize, add placeholder animations, etc.
const useOnCoverImageChangeCallback = (setImagePreviewURL: (val: string) => void) => {
  return useCallback((e: FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    const file = files?.item(0)
    if (file === null || file === undefined) {
      console.error("failed to select files")
      return
    }

    if (file.size > maxImageSize)  {
      console.error("file is too large: ", file.size)
      return
    }

    // // TODO validate dimensions, file type, etc.

    const fileURL = URL.createObjectURL(file)
    setImagePreviewURL(fileURL)
  }, [setImagePreviewURL])
}