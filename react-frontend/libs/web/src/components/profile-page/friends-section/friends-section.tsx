"use client"

import { APIUserProfile, getImageURLFromId } from "@facebook-clone/api_client/src"
import Link from "next/link"
import { useMemo } from "react"
import { OptionMenuButton } from "../../ui/options-popup/option-menu-buttons"
import { OptionsButton } from "../../ui/options-popup/options-popup"
import { useSession } from "../../utils/session-context"
import styles from "./friends-section.module.scss"

export const ProfileFriendsSection = () => {
  const {userData} = useSession()

  if (userData === undefined)
    return "loading"

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Friends</h1>
      <div className={styles.friendList}>
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
        <FriendTile profile={userData} />
      </div>
    </div>
  )
}

type FriendTileProps = {
  profile: APIUserProfile
}

const FriendTile = (props: FriendTileProps) => {
  const {profile} = props

  const userHref = useMemo(() => `/user/${profile.username}`, [profile])

  return (
    <div className={styles.friendTileContainer}>
      <Link href={userHref} className={styles.friendTileInfo}>
        <img className={styles.tileImage} src={getImageURLFromId(profile.thumbnailID)} alt="profile thumbnail" />
        <h1 className={styles.tileTitle}>{profile.name}</h1>
      </Link>
      <div className={styles.optionsButton}>
        <OptionsButton>
          <OptionMenuButton accent="no" title="Info" />
          <OptionMenuButton accent="blue" title="Messege" />
          <OptionMenuButton accent="red" title="Unfriend" />
        </OptionsButton>
      </div>
    </div>
  )
}
