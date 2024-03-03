import { ReactComponent as KeyboardIcon } from "@facebook-clone/assets/icons/keyboard.svg"
import { ReactComponent as StarIcon } from "@facebook-clone/assets/icons/star.svg"

import { DropdownItem, MenuTitleItem, OptionsItem } from "../dropdown-items"
import { DropdownMenuPage } from "./dropdown-page/dropdown-page"

import styles from "../dropdown-menu.module.scss"

export const DropdownKeyboardPage = () => (
  <DropdownMenuPage id={4}>
    <div className={styles.menu}>
      <MenuTitleItem goToMenu={3} title="Keyboard" />

      <OptionsItem
        leftIcon={<StarIcon />}
        optionId="Use Single-Character Keyboard Shortcuts"
        title="Use Single-Character Keyboard Shortcuts"
        // Copied from facebook
        description="Use single-character shortcuts to perform common actions."
        options={["Off", "On"]}
      />

      <DropdownItem leftIcon={<KeyboardIcon />}>
        <span> See All Keyboard Shortcuts </span>
      </DropdownItem>
    </div>
  </DropdownMenuPage>
)
