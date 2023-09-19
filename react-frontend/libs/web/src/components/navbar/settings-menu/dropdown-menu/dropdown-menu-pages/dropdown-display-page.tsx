import { ReactComponent as ChevronIcon } from "@facebook-clone/assets/icons/chevron.svg"
import { ReactComponent as CompactModeIcon } from "@facebook-clone/assets/icons/compactmode.svg"
import { ReactComponent as DarkModeIcon } from "@facebook-clone/assets/icons/darkmode.svg"
import { ReactComponent as KeyboardIcon } from "@facebook-clone/assets/icons/keyboard.svg"

import { DropdownItem, MenuTitleItem, OptionsItem } from "../dropdown-items"
import { DropdownMenuPage } from "./dropdown-page/dropdown-page"

import styles from "../dropdown-menu.module.scss"

// should be abstracted into global storage interface
export const toggleTheme = (option: string) => {
  const darkModeOn = option === "On" ? true : false

  if (darkModeOn) {
    document.body.classList.remove("bright-theme")
    document.body.classList.add("dark-theme", "notransition")
    setTimeout(() => {
      document.body.classList.remove("notransition")
    }, 25)
  } else {
    document.body.classList.remove("dark-theme")
    document.body.classList.add("bright-theme", "notransition")
    setTimeout(() => {
      document.body.classList.remove("notransition")
    }, 25)
  }
}

export const DropdownDisplayPage = () => (
  <DropdownMenuPage id={3}>
    <div className={styles.menu}>
      <MenuTitleItem goToMenu={0} title="Display & Accessibility" />

      <OptionsItem
        leftIcon={<DarkModeIcon />}
        optionId="Dark Mode"
        title="Dark Mode"
        changeAction={toggleTheme}
        // Copied from facebook
        description="Adjust the appearance of this page to reduce glare and give your eyes a break."
        options={["Off", "On", "Automatic"]}
      />

      <OptionsItem
        leftIcon={<CompactModeIcon />}
        optionId="Compact Mode"
        title="Compact Mode"
        // Copied from facebook
        description="Make your font size smaller so more content can fit on the screen."
        options={["Off", "On"]}
      />

      <DropdownItem
        leftIcon={<KeyboardIcon />}
        rightIcon={<ChevronIcon />}
        goToMenu={4}
      >
        <span> Keyboard </span>
      </DropdownItem>
    </div>
  </DropdownMenuPage>
)
