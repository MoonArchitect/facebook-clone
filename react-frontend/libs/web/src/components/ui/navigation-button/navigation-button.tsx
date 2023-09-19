import { MouseEventHandler, ReactElement } from "react"

import styles from "./navigation-button.module.scss"

interface NavigationButtonProps {
  title: string
  icon: ReactElement
  onClick?: MouseEventHandler
}

export const NavigationButton = (props: NavigationButtonProps) => {
  const { title, icon, onClick } = props

  return (
    <div className={styles.navigationButton} onClick={onClick}>
      <div className={styles.icon}>
        {/* <img src={iconSrc} alt="" /> */}
        {icon}
      </div>
      <div className={styles.title}>{title}</div>
    </div>
  )
}
