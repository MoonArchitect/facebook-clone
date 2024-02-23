import Link from "next/link"
import styles from "./profile-preview.module.scss"

export type ProfilePreview = {
  thumbnailURL: string
  name?: string
  link: string
}

export const ProfilePreview = (props: ProfilePreview) => {
  const {link, thumbnailURL, name} = props

  return (
    <Link href={link} className={styles.container}>
      <img className={styles.thumbnail} src={thumbnailURL} alt="profile thumbnail"/>
      <h1 className={styles.name}>{name}</h1>
    </Link>
  )
}