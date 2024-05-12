import clsx from "clsx"
import { ReactNode, useRef, useState } from "react"
import { CSSTransition } from "react-transition-group"


import { UseClickOutsideSubscriber } from "../../../../hooks"
import styles from "./nav-items.module.scss"

export const NavItem = ({
  icon,
  children,
  hintMessage = "",
  shiftLeft = false,
  onClick,
}: {
  icon: ReactNode
  children?: ReactNode
  hintMessage?: string
  shiftLeft?: boolean
  onClick?: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const navItemRef = useRef<HTMLLIElement>(null)

  return (
    <li className={styles.navItem} ref={navItemRef}>
      {isOpen && <UseClickOutsideSubscriber domRef={navItemRef} effect={() => setIsOpen(false)} />}

      <div
        className={clsx(styles.iconButton, isOpen && styles.iconButtonActive)}
        onClick={() => {
          setIsOpen(!isOpen)
          setIsHovered(false)
          onClick?.()
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {icon}
      </div>

      {children && (
        <CSSTransition
          in={isOpen}
          timeout={150}
          classNames={{
            enter: styles.navItemContentEnter,
            enterActive: styles.navItemContentEnterActive,
            exit: styles.navItemContentExit,
            exitActive: styles.navItemContentExitActive,
          }}
          unmountOnExit
        >
          {children}
        </CSSTransition>
      )}

      {hintMessage !== "" && (
        <div
          className={clsx(
            styles.navItemHint,
            isHovered && styles.navItemHintShow,
            shiftLeft && styles.navItemShiftLeft
          )}
        >
          {hintMessage}
        </div>
      )}
    </li>
  )
}
