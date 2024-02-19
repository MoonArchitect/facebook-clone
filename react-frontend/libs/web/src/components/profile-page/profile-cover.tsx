"use client"

import { ReactComponent as CameraIcon } from "@facebook-clone/assets/icons/camera.svg"
import { ReactComponent as ChevronIcon } from "@facebook-clone/assets/icons/chevron.svg"
import { ReactComponent as CogIcon } from "@facebook-clone/assets/icons/cog.svg"
import { ReactComponent as PlusIcon } from "@facebook-clone/assets/icons/plus.svg"

import { useMeQuery } from "@facebook-clone/web/query-hooks/profile-hooks"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import styles from "./profile-cover.module.scss"

export const ProfileCover = () => {
  const {data} = useMeQuery()

  return (
    <div className={styles.container}>
      <div className={styles.coverImage}>
        <button className={styles.coverImageButton}><CameraIcon/> Add Cover Photo</button>
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.thumbnailContainer}>
          <img className={styles.profileThumbnail} src={data?.thumbnailURL} alt="profile thumbnail"></img>
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