"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FormEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"

import { ReactComponent as CameraIcon } from "@facebook-clone/assets/icons/camera.svg"
import { ReactComponent as ChevronIcon } from "@facebook-clone/assets/icons/chevron.svg"
import { ReactComponent as CogIcon } from "@facebook-clone/assets/icons/cog.svg"
import { ReactComponent as FriendsIcon } from "@facebook-clone/assets/icons/friends_filled.svg"
import { ReactComponent as MessengerIcon } from "@facebook-clone/assets/icons/messenger.svg"
import { ReactComponent as PlusIcon } from "@facebook-clone/assets/icons/plus.svg"

import { APIUserProfile, getImageURLFromId } from "@facebook-clone/api_client/src"
import ReactModal from "react-modal"
import { useUploadProfileCover, useUploadProfileThumbnail } from "../../query-hooks/asset-query-hooks"
import { useCreateChatMutation } from "../../query-hooks/chat-query-hooks"
import {
  useAcceptFriendRequestMutation,
  useSendFriendRequestMutation,
  useUnFriendMutation
} from "../../query-hooks/profile-query-hooks"
import { useSession } from "../utils/session-context"
import styles from "./profile-cover.module.scss"

// TODO: move to global config of some kind
const maxImageSize = 5 * 1024 * 1024 // 5 MB

type ImagePreviewStateType = {
  isOpen: boolean
  url: string
  target: 'thumbnail' | 'cover'
}

export type ProfileCoverProps = {
  profile?: APIUserProfile
}

function emptyCallback(){
  return null
}

export const ProfileCover = (props: ProfileCoverProps) => {
  const { profile } = props
  const {userData} = useSession()
  const {replace} = useRouter()
  const pathname = usePathname()

  const coverImageUploadRef = useRef<HTMLInputElement>(null)
  const {mutateAsync: uploadProfileCover} = useUploadProfileCover()
  const {mutateAsync: uploadProfileThumbnail} = useUploadProfileThumbnail()

  // ugly but works
  const [imagePreviewState, setImagePreviewState] = useState<ImagePreviewStateType>({
    target: 'cover',
    isOpen: false,
    url: ""
  })
  const modalAppElement = useMemo(
    () => typeof window !== 'undefined' && document.getElementById('root') || undefined,
    [])

  const isOwner = useMemo(() => userData?.id !== undefined && profile?.id === userData.id, [profile, userData])

  const baseURLPrefix = useMemo(() => {
    if (isOwner) {
      return `/profile`
    } else if (profile?.username) {
      return `/user/${profile.username}`
    }
    return undefined
  }, [isOwner, profile])


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

  useEffect(() => {
    if (userData?.id
      && profile?.id
      && userData?.id === profile?.id
      && pathname.includes(`/user/${userData.username}`)
    ) {
      replace("/profile")
    }
  }, [replace, pathname, profile, userData])

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

      <div
        className={clsx(styles.coverImage, isOwner && styles.interactive)}
        onClick={isOwner ? selectNewCoverImage : emptyCallback}
      >
        {profile?.bannerID && <img src={getImageURLFromId(profile.bannerID)} alt={"profile cover"}/>}
        {isOwner && <button className={clsx(styles.coverImageButton, styles.interactive)} onClick={selectNewCoverImage}>
          <CameraIcon/> Add Cover Photo
        </button>
        }
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.thumbnailContainer} onClick={isOwner ? selectNewThumbnailImage : emptyCallback}>
          <img
            className={clsx(styles.profileThumbnail, isOwner && styles.interactive)}
            src={getImageURLFromId(profile?.thumbnailID ?? "")}
            alt={"profile thumbnail"} />
          {isOwner && <CameraIcon/>}
        </div>
        <div className={styles.nameContainer}>
          <h1 className={styles.name}>{profile?.name ?? ""}</h1>
          <Link href={`${baseURLPrefix}/friends`} className={styles.friendCount}>
            {profile?.friendIDs.length ?? "..."} Friends
          </Link>
        </div>
        <div className={styles.buttonContainer}>
          {!isOwner && userData?.id && profile && <ProfileActions profile={profile} />}
          {isOwner && <button className={clsx(styles.addStoryButton, styles.buttonText, styles.disabled)}>
            <PlusIcon/>Add to Story
          </button>}
          {isOwner && <button className={clsx(styles.editProfileButton, styles.buttonText, styles.disabled)}>
            <CogIcon/>Edit profile
          </button>}
          <button className={clsx(styles.settingsButton, styles.disabled)}><ChevronIcon/></button>
        </div>
      </div>

      <div className={styles.lineDivider} />

      <NavigationBar baseURLPrefix={baseURLPrefix}/>
    </div>
  )
}

type ProfileActionsProps = {
  profile: APIUserProfile
}

const ProfileActions = (props: ProfileActionsProps) => {
  const {profile} = props

  const {userData} = useSession()

  const {mutate: sendFriendRequest} = useSendFriendRequestMutation(profile.username)
  const {mutate: acceptFriendRequest} = useAcceptFriendRequestMutation(profile.username)
  const {mutate: unfriendRequest} = useUnFriendMutation(profile.username, userData?.id)
  const {mutateAsync: createChat} = useCreateChatMutation()

  const createChatCallback = useCallback(async () => {
    createChat({userID: profile.id})
      .then((resp) => console.log("chat created with id: ", resp.chatID))
  }, [profile.id, createChat])

  if (profile.friendshipStatus === 'friends')
    return (
      <>
        <button
          className={clsx(styles.unfriendButton, styles.buttonText)}
          onClick={() => unfriendRequest({userID: profile.id})}
        >
          <FriendsIcon/>Unfriend
        </button>
        <button
          className={clsx(styles.sendMessageButton, styles.buttonText)}
          onClick={createChatCallback}
        >
          <MessengerIcon/>Message
        </button>
      </>
    )

  if (profile.friendshipStatus === 'pending')
    return (
      <button
        className={clsx(styles.acceptFriendRequest, styles.buttonText)}
        onClick={() => acceptFriendRequest({userID: profile.id})}
      >
        <FriendsIcon/>Accept Friend Request
      </button>
    )

  if (profile.friendshipStatus === 'requested')
    return <button className={clsx(styles.pendingFriendRequest, styles.buttonText)}>Friend Request Sent</button>

  if (profile.friendshipStatus === 'none')
    return (
      <button
        className={clsx(styles.sendFriendRequest, styles.buttonText)}
        onClick={() => sendFriendRequest({userID: profile.id})}
      >
        <PlusIcon/>Add Friend
      </button>
    )

  return "loading..."
}

type NavigationBarProps = {
  baseURLPrefix?: string
}

const NavigationBar = (props: NavigationBarProps) => {
  const {baseURLPrefix} = props

  return (
    <div className={styles.navigationContainer}>
      <NavigationButton href={baseURLPrefix ? `${baseURLPrefix}` : " "} title="Posts" />
      <NavigationButton href={baseURLPrefix ? `${baseURLPrefix}/about` : " "} title="About" />
      <NavigationButton href={baseURLPrefix ? `${baseURLPrefix}/friends` : " "} title="Friends" />
      <NavigationButton href={baseURLPrefix ? `${baseURLPrefix}/photos` : " "} title="Photos" />
      <NavigationButton href={baseURLPrefix ? `${baseURLPrefix}/videos` : " "} title="Videos" />
      <NavigationButton href=" " title="More" />
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
      className={clsx(styles.linkButton, isActive && styles.highlightedLink, href === " " && styles.disabled)}
    >
      {title}
      <div className={clsx(styles.highlightBar, isActive && styles.show)} />
    </Link>
  )
}