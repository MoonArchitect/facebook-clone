import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useMemo, useState } from "react"

import { ReactComponent as FriendsIcon } from "@facebook-clone/assets/icons/friends_filled.svg"
import { ReactComponent as UnfilledFriendsIcon } from "@facebook-clone/assets/icons/friends_unfilled.svg"
import { ReactComponent as GroupsIcon } from "@facebook-clone/assets/icons/groups_filled.svg"
import { ReactComponent as UnfilledGroupsIcon } from "@facebook-clone/assets/icons/groups_unfilled.svg"
import { ReactComponent as HomeIcon } from "@facebook-clone/assets/icons/home_filled.svg"
import { ReactComponent as UnfilledHomeIcon } from "@facebook-clone/assets/icons/home_unfilled.svg"

import styles from "./navigation-menu.module.scss"

interface NavigationTabProps {
  hintMessage: string
  href: string
  exactPathMatch?: boolean
  iconOff: ReactNode
  iconOn: ReactNode
}

const NavigationTab = (props: NavigationTabProps) => {
  const { hintMessage, href, iconOff, iconOn, exactPathMatch = false } = props

  const [isHovered, setIsHovered] = useState(false)

  const pathname = usePathname()
  const isActive = useMemo(
    () => (exactPathMatch ? pathname === href : pathname?.endsWith(href)),
    [exactPathMatch, pathname, href]
  )

  return (
    <Link
      href={href}
      className={clsx(styles.linkButton, isActive && styles.highlightedLink)}
      onClick={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      children={
        <>
          {isActive ? iconOn : iconOff}
          <div className={clsx(styles.highlightBar, isActive && styles.show)} />
          <div className={clsx(styles.hint, isHovered && styles.show)}>
            {hintMessage}
          </div>
        </>
      }
    />
  )
}

export const NavigationMenu = () => {
  return (
    <div className={styles.container}>
      <NavigationTab
        hintMessage="Home"
        href="/"
        exactPathMatch
        iconOff={<UnfilledHomeIcon />}
        iconOn={<HomeIcon />}
      />

      <NavigationTab
        hintMessage="Friends"
        href="/friends"
        exactPathMatch
        iconOff={<UnfilledFriendsIcon />}
        iconOn={<FriendsIcon />}
      />

      <NavigationTab
        hintMessage="Groups"
        href="/groups/feed"
        iconOff={<UnfilledGroupsIcon />}
        iconOn={<GroupsIcon />}
      />
    </div>
  )
}
