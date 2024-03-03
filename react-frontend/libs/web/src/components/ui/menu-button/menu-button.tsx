import clsx from "clsx"
import { ReactElement, useRef, useState } from "react"


import { UseClickOutsideSubscriber } from "../../../hooks"
import styles from "./menu-button.module.scss"

export const MenuButton = ({ icon = undefined }: { icon?: ReactElement }) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)

  return (
    <div className={styles.menuButtonContainer}>
      <div className={clsx(styles.icon, isOpen && styles.active)} ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        {isOpen && <UseClickOutsideSubscriber domRef={buttonRef} effect={() => setIsOpen(false)} />}
        {icon}
      </div>
    </div>
  )
}
