import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useRef } from "react"

import styles from "./nav-items.module.scss"

export const FindFriendsNavItem = () => {
  const navItemRef = useRef(null)

  const href = "/friends"

  const pathname = usePathname()
  const isActive = useMemo(() => pathname?.includes(href), [pathname, href])

  return (
    <li
      className={clsx(styles.navItem, styles.hideNavItemAt1300)}
      ref={navItemRef}
    >
      <Link
        href={href}
        className={clsx(
          styles.iconButton,
          isActive && styles.iconButtonHighlighted
        )}
      >
        <span style={{ paddingBottom: "1px" }}>Find Friends</span>
      </Link>
    </li>
  )
}
