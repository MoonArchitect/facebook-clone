"use client"

import { APIMiniUserProfile, APIUserProfile, getImageURLFromId } from "@facebook-clone/api_client/src"
import Link from "next/link"
import { useMemo } from "react"
import {
  useAcceptFriendRequestMutation,
  useGetAllFriendsQuery,
  useGetFriendRequestsQuery,
  useUnFriendMutation
} from "../../../query-hooks/profile-query-hooks"
import { OptionMenuButton } from "../../ui/options-popup/option-menu-buttons"
import { OptionsButton } from "../../ui/options-popup/options-popup"

import clsx from "clsx"
import { useSession } from "../../utils/session-context"
import styles from "./friends-section.module.scss"

type ProfileFriendsSectionProps = {
  profile: APIUserProfile
}

export const ProfileFriendsSection = (props: ProfileFriendsSectionProps) => {
  const { profile } = props
  const {data, isLoading} = useGetAllFriendsQuery(profile.id)
  const {state: {isLoggedIn: isClientLoggedIn}, userData} = useSession()
  const isClientsProfile = useMemo(() => profile.id === userData?.id, [userData?.id, profile.id])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Friends</h1>
      <div className={styles.friendList}>
        {isLoading
          ? ""
          : data === undefined
            ? ""
            : data.map((p) =>
              <FriendTile profile={p} isClientLoggedIn={isClientLoggedIn} isClientsProfile={isClientsProfile} />
            )}
      </div>
    </div>
  )
}

// TODO: this is temp, move to a different file
export const ProfileFriendsPage = (props: ProfileFriendsSectionProps) => {
  const { profile } = props
  const {data, isLoading} = useGetAllFriendsQuery(profile.id)
  const {state: {isLoggedIn: isClientLoggedIn}, userData} = useSession()
  const isClientsProfile = useMemo(() => profile.id === userData?.id, [userData?.id, profile.id])

  return (
    <div className={styles.pageContainer}>
      {/* <h1 className={styles.title}>Friends</h1> */}
      <div className={styles.friendList}>
        {isLoading
          ? ""
          : data === undefined
            ? ""
            : data.map((p) =>
              <FriendTile profile={p} isClientLoggedIn={isClientLoggedIn} isClientsProfile={isClientsProfile} />
            )}
      </div>
    </div>
  )
}

// TODO: this is temp, move to a different file
export const FriendRequestsSection = () => {
  const {data, isLoading} = useGetFriendRequestsQuery()

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Pending Requests</h1>
      <div className={styles.friendList}>
        {isLoading ? "" : data === undefined ? "" :
          data.friendshipsPending.map((p) =>
            <FriendRequestTile profile={p} type="pending" />
          )}
      </div>
      <br />
      <h1 className={styles.title}>Your Requests</h1>
      <div className={styles.friendList}>
        {isLoading ? "" : data === undefined ? "" :
          data.friendshipsRequested.map((p) =>
            <FriendRequestTile profile={p} type="requested" />
          )}
      </div>
    </div>
  )
}

type FriendTileProps = {
  profile: APIMiniUserProfile
  isClientLoggedIn: boolean
  isClientsProfile: boolean
}

const FriendTile = (props: FriendTileProps) => {
  const {profile, isClientLoggedIn, isClientsProfile} = props

  const userHref = useMemo(() => `/user/${profile.username}`, [profile])

  const {userData} = useSession()
  const {mutate: unfriendRequest} = useUnFriendMutation(profile.username, userData?.id)

  return (
    <div className={styles.friendTileContainer}>
      <Link href={userHref} className={styles.friendTileInfo}>
        <img className={styles.tileImage} src={getImageURLFromId(profile.thumbnailID)} alt="profile thumbnail" />
        <h1 className={styles.tileTitle}>{profile.name}</h1>
      </Link>
      <div className={styles.optionsButton}>
        {isClientLoggedIn &&
          <OptionsButton>
            <OptionMenuButton accent="no" title="Info" />
            <OptionMenuButton accent="blue" title="Message" />
            {isClientsProfile &&
              <OptionMenuButton accent="red" title="Unfriend" onClick={() => unfriendRequest({userID: profile.id})} />}
          </OptionsButton>
        }
      </div>
    </div>
  )
}

type FriendRequestTileProps = {
  profile: APIMiniUserProfile
  type: "pending" | "requested"
}

const FriendRequestTile = (props: FriendRequestTileProps) => {
  const {profile, type} = props
  const {userData} = useSession()
  const {mutate: acceptFriendRequest} = useAcceptFriendRequestMutation(profile.username, userData?.id)

  const userHref = useMemo(() => `/user/${profile.username}`, [profile])

  return (
    <div className={styles.friendTileContainer}>
      <Link href={userHref} className={styles.friendTileInfo}>
        <img className={styles.tileImage} src={getImageURLFromId(profile.thumbnailID)} alt="profile thumbnail" />
        <h1 className={styles.tileTitle}>{profile.name}</h1>
      </Link>
      <div className={styles.actionButtonContainer}>
        {type === "pending" &&
        <div
          className={clsx(styles.button, styles.accept)}
          onClick={() => acceptFriendRequest({userID: profile.id})}>
          Accept
        </div>
        }
        {type === "pending" && <div className={clsx(styles.button, styles.ignoreRequest)}>Ignore</div>}
        {type === "requested" && <div className={clsx(styles.button, styles.undoRequest)}>Delete Request</div>}
      </div>
    </div>
  )
}
