import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PropsWithChildren, ReactNode, useMemo } from "react"
import { CSSTransition } from "react-transition-group"

import { ReactComponent as ArrowIcon } from "@facebook-clone/assets/icons/arrow.svg"

import styles from "./friends-menu.module.scss"

export const enum FriendTabs {
  Default = 0,
  Requests = 1,
  Suggestions = 2,
  List = 3,
  Birthdays = 0,
  Friendlist = 4,
}

interface FriendsMenuPageProps {
  id: FriendTabs
  activeId: FriendTabs
}

export const FriendsMenuPage = (
  props: PropsWithChildren<FriendsMenuPageProps>
) => {
  const { children, id, activeId } = props

  const animationClassNames = useMemo(() => {
    if (id !== FriendTabs.Default)
      return {
        enter: styles.rightSlideEnter,
        enterActive: styles.rightSlideEnterActive,
        exit: styles.rightSlideExit,
        exitActive: styles.rightSlideExitActive,
      }
    else
      return {
        enter: styles.leftSlideEnter,
        enterActive: styles.leftSlideEnterActive,
        exit: styles.leftSlideExit,
        exitActive: styles.leftSlideExitActive,
      }
  }, [id])

  return (
    <CSSTransition
      in={activeId === id}
      timeout={150}
      classNames={animationClassNames}
      unmountOnExit
    >
      {children}
    </CSSTransition>
  )
}

interface FriendsMenuItemProps {
  href: string
  children?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const FriendsMenuItem = (props: FriendsMenuItemProps) => {
  const { href, children, leftIcon, rightIcon } = props

  const pathname = usePathname()
  const isActive = useMemo(() => pathname === href, [pathname, href])

  return (
    <Link
      // end
      href={href}
      className={clsx(
        styles.friendsTabMenuItem,
        !rightIcon && isActive && styles.friendsTabMenuItemActivated
      )}
    >
      <div className={styles.iconButton}>{leftIcon}</div>
      {children}
      <div className={clsx(styles.iconButton, styles.iconRight)}>
        {rightIcon}
      </div>
    </Link>
  )
}

interface MenuPageTitleProps {
  title: string
  href: string
}

export const MenuPageTitle = (props: MenuPageTitleProps) => {
  const { title, href } = props

  return (
    <div className={styles.pageNavigation}>
      <Link href={href}>
        <ArrowIcon />
      </Link>
      <div className={styles.titleContainer}>
        <Link href={href} className={styles.pageLink}>
          Friends
        </Link>
        <div className={styles.pageTitle}>{title}</div>
      </div>
    </div>
  )
}
