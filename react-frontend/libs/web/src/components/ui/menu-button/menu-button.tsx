import clsx from "clsx"
import { ReactElement, useRef, useState } from "react"

import { useClickOutside } from "../../../hooks"

import styles from "./menu-button.module.scss"

export const MenuButton = ({ icon = undefined }: { icon?: ReactElement }) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)

  useClickOutside(buttonRef, () => {
    setIsOpen(false)
  })

  return (
    <div className={styles.menuButtonContainer}>
      <div className={clsx(styles.icon, isOpen && styles.active)} ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        {icon}
      </div>
    </div>
  )
}
