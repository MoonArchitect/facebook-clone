import { ReactComponent as ChevronIcon } from "@facebook-clone/assets/icons/chevron.svg"
import { ReactComponent as CompactModeIcon } from "@facebook-clone/assets/icons/compactmode.svg"
import { ReactComponent as DarkModeIcon } from "@facebook-clone/assets/icons/darkmode.svg"
import { ReactComponent as KeyboardIcon } from "@facebook-clone/assets/icons/keyboard.svg"

import { DropdownItem, MenuTitleItem, OptionsItem } from "../dropdown-items"
import { DropdownMenuPage } from "./dropdown-page/dropdown-page"

import { GlobalTheme } from "../../../../../components/utils/server-options/server-options"
import { useGlobalTheme } from "../../../../../hooks/use-global-theme"
import styles from "../dropdown-menu.module.scss"

export const DropdownDisplayPage = () => {
  const {setTheme} = useGlobalTheme()

  return (
    <DropdownMenuPage id={3}>
      <div className={styles.menu}>
        <MenuTitleItem goToMenu={0} title="Display & Accessibility" />

        <OptionsItem
          leftIcon={<DarkModeIcon />}
          optionId="Dark Mode"
          title="Dark Mode"
          changeAction={(option) => setTheme(option === "On" ? GlobalTheme.DarkTheme : GlobalTheme.BrightTheme)}
          // Copied desc from facebook
          description="Adjust the appearance of this page to reduce glare and give your eyes a break."
          options={["Off", "On", "Automatic"]}
        />

        <OptionsItem
          leftIcon={<CompactModeIcon />}
          optionId="Compact Mode"
          title="Compact Mode"
          // Copied desc from facebook
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
}