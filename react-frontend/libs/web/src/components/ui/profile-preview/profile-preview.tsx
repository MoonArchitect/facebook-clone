import { getImageURLFromId } from "@facebook-clone/api_client/src"
import Link from "next/link"
import { useMemo } from "react"
import styles from "./profile-preview.module.scss"

export type ProfilePreview = {
  thumbnailID?: string
  name?: string
  link: string
}

export const ProfilePreview = (props: ProfilePreview) => {
  const {link, thumbnailID, name} = props

  const thumbnailURL = useMemo(() => thumbnailID ? getImageURLFromId(thumbnailID) : "", [thumbnailID])

  return (
    <Link href={link} className={styles.container}>
      <img className={styles.thumbnail} src={thumbnailURL} alt="profile thumbnail"/>
      <h1 className={styles.name}>{name}</h1>
    </Link>
  )
}