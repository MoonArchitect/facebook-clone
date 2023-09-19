import { PropsWithChildren, useContext, useMemo } from "react"
import { CSSTransition } from "react-transition-group"

import { MenuContext } from "../../dropdown-menu"

import styles from "./dropdown-menu-page.module.scss"

interface DropdownMenuPageProps {
  id: number
}

export const DropdownMenuPage = (
  props: PropsWithChildren<DropdownMenuPageProps>
) => {
  const { children, id } = props
  const { activeId, previousId, calcHeight } = useContext(MenuContext)

  const classNames = useMemo(() => {
    if (activeId <= id && previousId <= id)
      return {
        enter: styles.slideRightEnter,
        enterActive: styles.slideRightEnterActive,
        exit: styles.slideRightExit,
        exitActive: styles.slideRightExitActive,
      }
    else
      return {
        enter: styles.slideLeftEnter,
        enterActive: styles.slideLeftEnterActive,
        exit: styles.slideLeftExit,
        exitActive: styles.slideLeftExitActive,
      }
  }, [id, activeId, previousId])

  return (
    <CSSTransition
      in={activeId === id}
      timeout={150}
      classNames={classNames}
      unmountOnExit
      onEnter={calcHeight}
    >
      {children}
    </CSSTransition>
  )
}
