import { MouseEventHandler, ReactElement } from "react"

import Link from "next/link"
import styles from "./navigation-button.module.scss"

interface NavigationButtonProps {
  title: string
  icon: ReactElement
  href?: string
  onClick?: MouseEventHandler
}

export const NavigationButton = (props: NavigationButtonProps) => {
  const { title, icon, href="", onClick } = props

  return (
    <Link href={href} className={styles.navigationButton} onClick={onClick}>
      <div className={styles.icon}>
        {/* <img src={iconSrc} alt="" /> */}
        {icon}
      </div>
      <div className={styles.title}>{title}</div>
    </Link>
  )
}
