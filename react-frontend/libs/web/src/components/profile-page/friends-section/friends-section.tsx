"use client"

import { APIMiniUserProfile, APIUserProfile, getImageURLFromId } from "@facebook-clone/api_client/src"
import Link from "next/link"
import { useMemo } from "react"
import { useGetAllFriendsQuery } from "../../../query-hooks/profile-query-hooks"
import { OptionMenuButton } from "../../ui/options-popup/option-menu-buttons"
import { OptionsButton } from "../../ui/options-popup/options-popup"

import styles from "./friends-section.module.scss"

type ProfileFriendsSectionProps = {
  profile: APIUserProfile
}

export const ProfileFriendsSection = (props: ProfileFriendsSectionProps) => {
  const { profile } = props
  const {data, isLoading} = useGetAllFriendsQuery(profile.id)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Friends</h1>
      <div className={styles.friendList}>
        {isLoading
          ? ""
          : data === undefined
            ? ""
            : data.map((p) =>
              <FriendTile profile={p} />
            )}
      </div>
    </div>
  )
}

type FriendTileProps = {
  profile: APIMiniUserProfile
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
