import clsx from "clsx"
import { useCallback, useContext } from "react"

import { ReactComponent as ArrowIcon } from "@facebook-clone/assets/icons/arrow.svg"

import { MenuContext } from "../dropdown-menu"

import commonStyles from "./common-item-styles.module.scss"

interface MenuTitleItemProps {
  goToMenu: number
  title: string
}

export const MenuTitleItem = (props: MenuTitleItemProps) => {
  const { goToMenu, title } = props
  const { activeId, setActiveId, setPreviousId } = useContext(MenuContext)

  const handleClick = useCallback(() => {
    if (goToMenu !== undefined) {
      setPreviousId(activeId)
      setActiveId(goToMenu)
    }
  }, [activeId, goToMenu, setActiveId, setPreviousId])

  return (
    <div className={clsx(commonStyles.menuItem, commonStyles.menuTitleItem)}>
      <div className={commonStyles.menuIconButton} onClick={handleClick}>
        <ArrowIcon />
      </div>
      <span>{title}</span>
    </div>
  )
}
