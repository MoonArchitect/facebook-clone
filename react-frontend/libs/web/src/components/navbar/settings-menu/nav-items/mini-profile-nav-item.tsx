import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"

import UserProfilePicture from "@facebook-clone/assets/images/profile-picture.png"

import { useClickOutside } from "../../../../hooks"

import styles from "./nav-items.module.scss"

export const MiniProfileNavItem = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navItemRef = useRef(null)

  useClickOutside(navItemRef, () => {
    setIsOpen(false)
  })

  return (
    <li className={clsx(styles.navItem, styles.hideNavItemAt500)} ref={navItemRef}>
      <Link href="profile/" className={styles.miniProfile} onClick={() => setIsOpen(!isOpen)}>
        <Image src={UserProfilePicture} alt="" />
        <span>Name</span>
      </Link>
    </li>
  )
}
