import { useState } from "react"

import { ReactComponent as ChevronIcon } from "@facebook-clone/assets/icons/chevron.svg"

import { NavigationButton } from "../../ui"

import { getImageURLFromId } from "@facebook-clone/api_client/src"
import { useMeQuery } from "../../../query-hooks/profile-query-hooks"
import { RequireAuthenticated } from "../../utils/require-auth"
import styles from "./navigation-menu.module.scss"

const WelcomeIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yl/r/GavNGH1v5-z.png" alt="" />
const MemoriesIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/y7/r/AYj2837MmgX.png" alt="" />
const FacebookIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yy/r/xH4w-lk44we.png" alt="" />
const AdIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yl/r/_JPdPzLmp9j.png" alt="" />
const ClimateIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/tKwWVioirmj.png" alt="" />
const COVIDIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yR/r/tInzwsw2pVX.png" alt="" />
const EmotionalIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/y5/r/GyZZ7Jrr5OV.png" alt="" />
const FavoritesIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yP/r/Zy9sJGThmCS.png" alt="" />
const MessengerIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yq/r/YF1bztyGuX-.png" alt="" />

const UserProfileNavigationButton = () => {
  const {data} = useMeQuery()
  return (
    <RequireAuthenticated>
      <NavigationButton
        href="/profile"
        icon={
          <img
            style={{objectFit: "cover", height: "100%", width: "100%" }}
            src={data?.thumbnailID ? getImageURLFromId(data.thumbnailID) : ""}
            alt="Your profile" />
        }
        title={data?.name ?? "not available"} />
    </RequireAuthenticated>
  )
}

export const NavigationMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.buttonsList}>
          <UserProfileNavigationButton />
          <NavigationButton icon={MessengerIcon} title="Find Friends" />
          <NavigationButton icon={WelcomeIcon} title="Welcome" />
          <NavigationButton icon={COVIDIcon} title="Groups" />
          <NavigationButton icon={WelcomeIcon} title="Marketplace" />
          <NavigationButton icon={FavoritesIcon} title="Watch" />
          <NavigationButton icon={MemoriesIcon} title="Memories" />
          <NavigationButton icon={MessengerIcon} title="Saved" />

          {isExpanded && (
            <>
              <NavigationButton icon={FacebookIcon} title="Facebook Pay" />
              <NavigationButton icon={AdIcon} title="Ad Center" />
              <NavigationButton icon={ClimateIcon} title="Ads Manager" />
              <NavigationButton icon={ClimateIcon} title="Climate Science Center" />
              <NavigationButton icon={MessengerIcon} title="Community Help" />
              <NavigationButton icon={COVIDIcon} title="COVID-19 Information Center" />
              <NavigationButton icon={EmotionalIcon} title="Emotional Health" />
              <NavigationButton icon={MemoriesIcon} title="Events" />
              <NavigationButton icon={FavoritesIcon} title="Favorites" />
              <NavigationButton icon={AdIcon} title="Fundraisers" />
              <NavigationButton icon={WelcomeIcon} title="Gaming Video" />
              <NavigationButton icon={MessengerIcon} title="Live videos" />
              <NavigationButton icon={MessengerIcon} title="Messenger" />
              <NavigationButton icon={ClimateIcon} title="Messenger Kids" />
              <NavigationButton icon={COVIDIcon} title="Most Recent" />
              <NavigationButton icon={FacebookIcon} title="Pages" />
              <NavigationButton icon={WelcomeIcon} title="Play Games" />
              <NavigationButton icon={AdIcon} title="Quest" />
              <NavigationButton icon={COVIDIcon} title="Recent ad activity" />
              <NavigationButton icon={WelcomeIcon} title="Weather" />
            </>
          )}

          <NavigationButton
            onClick={() => setIsExpanded(!isExpanded)}
            icon={
              <div className={styles.navigationButtonSvgIcon}>
                <ChevronIcon
                  style={{
                    transform: isExpanded ? "rotate(-90deg)" : "rotate(90deg)",
                  }}
                />
              </div>
            }
            title={isExpanded ? "See less" : "See more"}
          />
        </div>

        <div className={styles.separator}></div>

        <div className={styles.shortcuts}>
          <div className={styles.shortcutsTitle}>Your shortcuts</div>
          <NavigationButton icon={WelcomeIcon} title="Group #1" />
          <NavigationButton icon={WelcomeIcon} title="Group #2" />
          <NavigationButton icon={WelcomeIcon} title="Group #3" />
          <NavigationButton icon={WelcomeIcon} title="Group #4" />
        </div>
      </div>
    </div>
  )
}
