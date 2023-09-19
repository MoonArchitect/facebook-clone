import Image from "next/image"
import { useState } from "react"

import { ReactComponent as ChevronIcon } from "@facebook-clone/assets/icons/chevron.svg"
import UserProfilePicture from "@facebook-clone/assets/images/profile-picture.png"

import { NavigationButton } from "../../ui"

import styles from "./navigation-menu.module.scss"

const Group1Icon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/mk4dH3FK0jT.png" alt="" />
const Group2Icon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/mk4dH3FK0jT.png" alt="" />
const Group3Icon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/mk4dH3FK0jT.png" alt="" />
const Group4Icon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/mk4dH3FK0jT.png" alt="" />

const FindIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yx/r/-XF4FQcre_i.png" alt="" />
const WelcomeIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yl/r/GavNGH1v5-z.png" alt="" />
const GroupsIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/mk4dH3FK0jT.png" alt="" />
const MarketplaceIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/ys/r/9BDqQflVfXI.png" alt="" />
const WatchIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yG/r/A1HlI2LVo58.png" alt="" />
const MemoriesIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/y7/r/AYj2837MmgX.png" alt="" />
const SavedIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yr/r/2uPlV4oORjU.png" alt="" />
const FacebookIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yy/r/xH4w-lk44we.png" alt="" />
const AdIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yl/r/_JPdPzLmp9j.png" alt="" />
const AdsIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yk/r/qR88GIDM38e.png" alt="" />
const ClimateIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/tKwWVioirmj.png" alt="" />
const CommunityIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yk/r/WreZVYrGEZH.png" alt="" />
const COVIDIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yR/r/tInzwsw2pVX.png" alt="" />
const EmotionalIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/y5/r/GyZZ7Jrr5OV.png" alt="" />
const EventsIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yd/r/9-o1e6LN_TX.png" alt="" />
const FavoritesIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yP/r/Zy9sJGThmCS.png" alt="" />
const FundraisersIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yA/r/A2tHTy6ibgT.png" alt="" />
const GamingIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yd/r/Zrzgh_mIaCN.png" alt="" />
const LiveIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yO/r/FBOwekDrmB5.png" alt="" />
const MessengerIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yq/r/YF1bztyGuX-.png" alt="" />
const MessengerKidsIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/y2/r/HBcx-giUZ2Y.png" alt="" />
const MostIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/ys/r/FGO-FBo3R2E.png" alt="" />
const PagesIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yZ/r/i7hepQ2OeZg.png" alt="" />
const PlayIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yn/r/XEWvxf1LQAG.png" alt="" />
const QuestIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yU/r/mUS9tzN7v5X.png" alt="" />
const RecentIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yI/r/WcCzeboYevF.png" alt="" />
const WeatherIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yq/r/kULMG0uFcEQ.png" alt="" />

export const NavigationMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.buttonsList}>
          <NavigationButton icon={<Image src={UserProfilePicture} alt="Your profile image" />} title="Your Name" />
          <NavigationButton icon={FindIcon} title="Find Friends" />
          <NavigationButton icon={WelcomeIcon} title="Welcome" />
          <NavigationButton icon={GroupsIcon} title="Groups" />
          <NavigationButton icon={MarketplaceIcon} title="Marketplace" />
          <NavigationButton icon={WatchIcon} title="Watch" />
          <NavigationButton icon={MemoriesIcon} title="Memories" />
          <NavigationButton icon={SavedIcon} title="Saved" />

          {isExpanded && (
            <>
              <NavigationButton icon={FacebookIcon} title="Facebook Pay" />
              <NavigationButton icon={AdIcon} title="Ad Center" />
              <NavigationButton icon={AdsIcon} title="Ads Manager" />
              <NavigationButton icon={ClimateIcon} title="Climate Science Center" />
              <NavigationButton icon={CommunityIcon} title="Community Help" />
              <NavigationButton icon={COVIDIcon} title="COVID-19 Information Center" />
              <NavigationButton icon={EmotionalIcon} title="Emotional Health" />
              <NavigationButton icon={EventsIcon} title="Events" />
              <NavigationButton icon={FavoritesIcon} title="Favorites" />
              <NavigationButton icon={FundraisersIcon} title="Fundraisers" />
              <NavigationButton icon={GamingIcon} title="Gaming Video" />
              <NavigationButton icon={LiveIcon} title="Live videos" />
              <NavigationButton icon={MessengerIcon} title="Messenger" />
              <NavigationButton icon={MessengerKidsIcon} title="Messenger Kids" />
              <NavigationButton icon={MostIcon} title="Most Recent" />
              <NavigationButton icon={PagesIcon} title="Pages" />
              <NavigationButton icon={PlayIcon} title="Play Games" />
              <NavigationButton icon={QuestIcon} title="Quest" />
              <NavigationButton icon={RecentIcon} title="Recent ad activity" />
              <NavigationButton icon={WeatherIcon} title="Weather" />
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
          <NavigationButton icon={Group1Icon} title="Group #1" />
          <NavigationButton icon={Group2Icon} title="Group #2" />
          <NavigationButton icon={Group3Icon} title="Group #3" />
          <NavigationButton icon={Group4Icon} title="Group #4" />
        </div>
      </div>
    </div>
  )
}
