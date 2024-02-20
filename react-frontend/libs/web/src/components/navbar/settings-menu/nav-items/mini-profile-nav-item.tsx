import clsx from "clsx"
import Link from "next/link"
import { useRef } from "react"

import { useMeQuery } from "@facebook-clone/web/query-hooks/profile-hooks"
import styles from "./nav-items.module.scss"

export const MiniProfileNavItem = () => {
  const navItemRef = useRef(null)
  const {data} = useMeQuery()

  return (
    <li className={clsx(styles.navItem, styles.hideNavItemAt500)} ref={navItemRef}>
      <Link href="/profile" className={styles.miniProfile}>
        <img src={data?.thumbnailURL ?? ""} alt="profile thumbnail" />
        <span>{data?.name ?? "not available"}</span>
      </Link>
    </li>
  )
}
