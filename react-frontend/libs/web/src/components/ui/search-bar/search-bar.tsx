import { ReactComponent as SearchIcon } from "@facebook-clone/assets/icons/search.svg"

import styles from "./search-bar.module.scss"

export const SearchBar = ({
  placeholder = undefined,
  icon = false,
}: {
  placeholder?: string
  icon?: boolean
}) => {
  return (
    <div className={styles.container}>
      {icon && (
        <span className={styles.icon}>
          <SearchIcon />
        </span>
      )}
      <input placeholder={placeholder}></input>
    </div>
  )
}
