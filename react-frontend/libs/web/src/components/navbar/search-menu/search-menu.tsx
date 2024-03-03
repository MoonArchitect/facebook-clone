import clsx from "clsx"
import Link from "next/link"
import { useRef, useState } from "react"

import { ReactComponent as FacebookIcon } from "@facebook-clone/assets/icons/facebook_icon.svg"
import { ReactComponent as SearchIcon } from "@facebook-clone/assets/icons/search.svg"


import { UseClickOutsideSubscriber } from "../../../hooks"
import styles from "./search-menu.module.scss"

export const SearchMenu = () => {
  const [inputFocused, setInputFocused] = useState(false)
  const divRef = useRef(null)

  return (
    <div className={styles.container} ref={divRef}>
      {inputFocused && <UseClickOutsideSubscriber domRef={divRef} effect={() => setInputFocused(false)} />}

      <Link href="/" className={clsx(styles.icon, inputFocused && styles.focused)}>
        <FacebookIcon />
      </Link>

      <div className={clsx(styles.searchContainer, inputFocused && styles.focused)} />

      <div className={clsx(styles.searchMenuSearch, inputFocused && styles.searchMenuSearchFocused)}>
        <span className={clsx(styles.searchMenuIcon, inputFocused && styles.searchMenuIconFocused)}>
          <SearchIcon />
        </span>
        <input
          className={styles.searchMenuInput}
          placeholder={`${inputFocused ? "" : " "}Search Facebook`}
          onFocus={() => setInputFocused(true)}
        />
      </div>

    </div>
  )
}
