"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FormEvent, MouseEvent, useCallback, useMemo, useRef, useState } from "react"

import { ReactComponent as CameraIcon } from "@facebook-clone/assets/icons/camera.svg"
import { ReactComponent as ChevronIcon } from "@facebook-clone/assets/icons/chevron.svg"
import { ReactComponent as CogIcon } from "@facebook-clone/assets/icons/cog.svg"
import { ReactComponent as PlusIcon } from "@facebook-clone/assets/icons/plus.svg"

import { useUploadProfileCover, useUploadProfileThumbnail } from "@facebook-clone/web/query-hooks/asset-hooks"
import { useMeQuery } from "@facebook-clone/web/query-hooks/profile-hooks"
import ReactModal from "react-modal"
import styles from "./profile-cover.module.scss"

// TODO: move to global config of some kind
const maxImageSize = 5 * 1024 * 1024 // 5 MB

type ImagePreviewStateType = {
  isOpen: boolean
  url: string
  target: 'thumbnail' | 'cover'
}

export const ProfileCover = () => {
  const {data} = useMeQuery()
  const coverImageUploadRef = useRef<HTMLInputElement>(null)
  const {mutateAsync: uploadProfileCover} = useUploadProfileCover()
  const {mutateAsync: uploadProfileThumbnail} = useUploadProfileThumbnail()

  // ugly but works
  const [imagePreviewState, setImagePreviewState] = useState<ImagePreviewStateType>({
    target: 'cover',
    isOpen: false,
    url: ""
  })
  const modalAppElement = useMemo(() => typeof window !== 'undefined' && document.getElementById('root') || undefined, [])

  const selectNewCoverImage = useCallback((e: MouseEvent<HTMLDivElement> | MouseEvent<HTMLButtonElement>) => {
    coverImageUploadRef.current?.click()
    setImagePreviewState({...imagePreviewState, target: "cover"})
    e.stopPropagation()
  }, [imagePreviewState])

  const selectNewThumbnailImage = useCallback((e: MouseEvent<HTMLDivElement> | MouseEvent<HTMLButtonElement>) => {
    coverImageUploadRef.current?.click()
    setImagePreviewState({...imagePreviewState, target: "thumbnail"})
    e.stopPropagation()
  }, [imagePreviewState])

  const onCoverImageChangeCallback = useCallback((e: FormEvent<HTMLInputElement>) => {
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

    // TODO validate dimensions, file type, etc.

    const fileURL = URL.createObjectURL(file)
    console.log("setImagePreviewState")
    setImagePreviewState({
      ...imagePreviewState,
      isOpen: true,
      url: fileURL,
    })
  }, [imagePreviewState, setImagePreviewState])

  const closeModalCallback = useCallback(() => {
    URL.revokeObjectURL(imagePreviewState.url)
    setImagePreviewState({...imagePreviewState, isOpen: false})
    if (coverImageUploadRef.current?.value)
      coverImageUploadRef.current.value = '';
    else
      console.error("couldnot reset file selection")
  }, [imagePreviewState, setImagePreviewState])

  const uploadImageCallback = useCallback(async () => {
    const blob = await fetch(imagePreviewState.url).then(r => r.blob());
    if (imagePreviewState.target === 'cover')
      await uploadProfileCover(blob).then(() => closeModalCallback())
    else
      await uploadProfileThumbnail(blob).then(() => closeModalCallback())
  }, [imagePreviewState, uploadProfileCover, uploadProfileThumbnail, closeModalCallback])

  return (
    <div className={styles.container}>
      <ReactModal
        isOpen={imagePreviewState.isOpen}
        onRequestClose={closeModalCallback}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
        appElement={modalAppElement}
      >
        <h1 className={styles.title}>Choose profile picture</h1>
        <div className={styles.imageRegionContainer}>
          <img className={styles.imagePreview} src={imagePreviewState.url} alt="imate preview" />
          <div className={styles.imageRegion}/>
        </div>
        <div className={styles.buttonsContainer}>
          <button className={styles.cancel} onClick={closeModalCallback}>Cancel</button>
          <button className={styles.save} onClick={uploadImageCallback}>Save</button>
        </div>
      </ReactModal>

      <input
        type="file"
        accept="image/*"
        ref={coverImageUploadRef}
        className={styles.hiddenInput}
        onChangeCapture={onCoverImageChangeCallback}
      />

      <div className={styles.coverImage} onClick={selectNewCoverImage} >
        {data?.bannerURL && <img src={data.bannerURL} alt={"profile cover"}/>}
        <button className={styles.coverImageButton} onClick={selectNewCoverImage}><CameraIcon/> Add Cover Photo</button>
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.thumbnailContainer} onClick={selectNewThumbnailImage}>
          <img className={styles.profileThumbnail} onClick={selectNewThumbnailImage} src={data?.thumbnailURL} alt={"profile thumbnail"}></img>
          <CameraIcon/>
        </div>
        <div className={styles.nameContainer}>
          <h1 className={styles.name}>{data?.name ?? "not availbale"}</h1>
          <p className={styles.friendCount}>4 Friends</p>
        </div>
        <div className={styles.buttonContainer}>
          <button className={clsx(styles.addStoryButton, styles.buttonText)}><PlusIcon/>Add to Story</button>
          <button className={clsx(styles.editProfileButton, styles.buttonText)}><CogIcon/>Edit profile</button>
          <button className={clsx(styles.settingsButton)}><ChevronIcon/></button>
        </div>
      </div>

      <div className={styles.lineDivider} />

      <div className={styles.navigationContainer}>
        <NavigationButton href="/profile" title="Posts" />
        <NavigationButton href="/profile/about" title="About" />
        <NavigationButton href="/profile/friends" title="Friends" />
        <NavigationButton href="/profile/photos" title="Photos" />
        <NavigationButton href="/profile/videos" title="Videos" />
        <NavigationButton href=" " title="More" />
      </div>
    </div>
  )
}

interface NavigationButtonProps {
    href: string
    title: string
  }


const NavigationButton = (props: NavigationButtonProps) => {
  const { href, title } = props

  const pathname = usePathname()
  const isActive = useMemo(
    () => (pathname?.endsWith(href)),
    [pathname, href]
  )

  return (
    <Link
      href={href}
      className={clsx(styles.linkButton, isActive && styles.highlightedLink)}
    >
      {title}
      <div className={clsx(styles.highlightBar, isActive && styles.show)} />
    </Link>
  )
}