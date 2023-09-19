import { createContext, useEffect, useRef, useState } from "react"

import {
  DropdownDisplayPage,
  DropdownHelpPage,
  DropdownHomePage,
  DropdownKeyboardPage,
  DropdownSettingsPage,
} from "./dropdown-menu-pages"

import styles from "./dropdown-menu.module.scss"

export const MenuContext = createContext({
  activeId: 0,
  previousId: -1,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  calcHeight: (el: HTMLElement) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPreviousId: (n: number) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setActiveId: (n: number) => {},
})

export const DropdownMenu = () => {
  const [previousId, setPreviousId] = useState(-1)
  const [activeId, setActiveId] = useState(0)
  const [menuHeight, setMenuHeight] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = dropdownRef.current?.children[0]
    if (element instanceof HTMLElement) {
      setMenuHeight(element.offsetHeight)
    }
  }, [])

  function calcHeight(el: HTMLElement) {
    const height = el.offsetHeight
    setMenuHeight(height)
  }

  return (
    <div
      className={styles.dropdown}
      style={{ height: menuHeight }}
      ref={dropdownRef}
    >
      <MenuContext.Provider
        value={{
          activeId: activeId,
          previousId: previousId,
          calcHeight: calcHeight,
          setPreviousId: setPreviousId,
          setActiveId: setActiveId,
        }}
      >
        <DropdownHomePage />
        <DropdownSettingsPage />
        <DropdownHelpPage />
        <DropdownDisplayPage />
        <DropdownKeyboardPage />
      </MenuContext.Provider>
    </div>
  )
}
