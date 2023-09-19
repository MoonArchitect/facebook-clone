import { ReactElement, memo } from "react"

import styles from "./friends-content.module.scss"

interface ContentPlaceHolderProps {
  title: string
  icon: ReactElement
  description?: string
}

export const ContentPlaceHolder = memo((props: ContentPlaceHolderProps) => {
  const { title, description, icon } = props

  return (
    <div className={styles.placeHolder}>
      {icon}
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>
    </div>
  )
})
