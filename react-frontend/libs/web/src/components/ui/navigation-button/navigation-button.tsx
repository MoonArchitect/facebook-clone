import { MouseEventHandler, ReactElement } from "react"

import clsx from "clsx"
import Link from "next/link"
import styles from "./navigation-button.module.scss"

interface NavigationButtonProps {
  title: string
  icon: ReactElement
  href?: string
  justifyCenter?: boolean
  onClick?: MouseEventHandler
}

export const NavigationButton = (props: NavigationButtonProps) => {
  const { title, icon, href, justifyCenter, onClick } = props

  return (
    <Link
      href={href ?? ""}
      className={clsx(styles.navigationButton, (onClick === undefined && href === undefined) && styles.disabled)}
      onClick={onClick}
      style={{justifyContent: justifyCenter ? "center" : "flex-start"}}
    >
      <div className={styles.icon}>
        {/* <img src={iconSrc} alt="" /> */}
        {icon}
      </div>
      <div className={styles.title}>{title}</div>
    </Link>
  )
}
