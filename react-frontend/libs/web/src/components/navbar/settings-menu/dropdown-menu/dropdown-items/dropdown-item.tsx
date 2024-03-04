import clsx from "clsx"
import { PropsWithChildren, ReactNode, useCallback, useContext } from "react"

import { MenuContext } from "../dropdown-menu"

import commonStyles from "./common-item-styles.module.scss"

interface DropdownItemProps {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  goToMenu?: number
  onClick?: () => void
}

export const DropdownItem = (props: PropsWithChildren<DropdownItemProps>) => {
  const { children, leftIcon, rightIcon, goToMenu, onClick } = props

  const { activeId, setActiveId, setPreviousId } = useContext(MenuContext)

  const handleClick = useCallback(() => {
    if (goToMenu !== undefined) {
      setPreviousId(activeId)
      setActiveId(goToMenu)
    } else {
      onClick?.()
    }
  }, [activeId, goToMenu, onClick, setActiveId, setPreviousId])

  return (
    <div
      className={clsx(commonStyles.menuItem, goToMenu === undefined && onClick === undefined && commonStyles.disabled)}
      onClick={handleClick}
    >
      <div className={commonStyles.menuIconButton}>{leftIcon}</div>
      {children}
      <div
        className={clsx(
          commonStyles.menuIconButton,
          commonStyles.menuIconRight
        )}
      >
        {rightIcon}
      </div>
    </div>
  )
}
