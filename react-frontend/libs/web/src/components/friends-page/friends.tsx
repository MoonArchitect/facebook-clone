import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { ReactComponent as ChevronIcon } from "@facebook-clone/assets/icons/chevron.svg"
import { ReactComponent as CogIcon } from "@facebook-clone/assets/icons/cog.svg"
import { ReactComponent as SearchIcon } from "@facebook-clone/assets/icons/search.svg"

import { LineDivider } from "../ui"
import {
  FriendTabs,
  FriendsMenuItem,
  FriendsMenuPage,
  MenuPageTitle,
} from "./friends-menu"
import {
  BirthdaysIcon,
  FriendRequestsIcon,
  FriendsListIcon,
  HomeIcon,
  SuggestionsIcon,
} from "./icons"

import styles from "./friends.module.scss"

export const MenuTab = () => {
  const [activeId, setActiveId] = useState<FriendTabs>(FriendTabs.Default)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    let target = FriendTabs.Default

    if (pathname?.includes("requests")) target = FriendTabs.Requests
    if (pathname?.includes("suggestions")) target = FriendTabs.Suggestions
    if (pathname?.includes("list")) target = FriendTabs.List
    if (pathname?.includes("birthdays")) target = FriendTabs.Birthdays
    if (pathname?.includes("friendlist")) target = FriendTabs.Friendlist

    if (target !== activeId) {
      setActiveId(target)
    }
  }, [activeId, pathname])

  return (
    <div className={styles.friendsTabMenu} ref={dropdownRef}>
      <FriendsMenuPage id={0} activeId={activeId}>
        <div className={styles.menuPage}>
          <div className={styles.menuInfo}>
            <div className={styles.menuTitle}>Friends</div>
            <div className={styles.menuSettings}>
              <CogIcon />
            </div>
          </div>

          <FriendsMenuItem href="/friends" leftIcon={<HomeIcon />}>
            <span> Home </span>
          </FriendsMenuItem>

          <FriendsMenuItem
            href="/friends/requests"
            leftIcon={<FriendRequestsIcon />}
            rightIcon={<ChevronIcon />}
          >
            <span> Friend Requests </span>
          </FriendsMenuItem>

          <FriendsMenuItem
            href="/friends/suggestions"
            leftIcon={<SuggestionsIcon />}
            rightIcon={<ChevronIcon />}
          >
            <span> Suggestions </span>
          </FriendsMenuItem>

          <FriendsMenuItem
            href="/friends/list"
            leftIcon={<FriendsListIcon />}
            rightIcon={<ChevronIcon />}
          >
            <span> All friends </span>
          </FriendsMenuItem>

          <FriendsMenuItem
            href="/friends/birthdays"
            leftIcon={<BirthdaysIcon />}
          >
            <span> Birthdays </span>
          </FriendsMenuItem>

          <FriendsMenuItem
            href="/friends/friendlist"
            leftIcon={<FriendsListIcon />}
            rightIcon={<ChevronIcon />}
          >
            <span> Custom Lists </span>
          </FriendsMenuItem>
        </div>
      </FriendsMenuPage>

      <FriendsMenuPage id={1} activeId={activeId}>
        <div className={styles.menuPage}>
          <MenuPageTitle title="Friend Requests" href="/friends" />
          <LineDivider />
        </div>
      </FriendsMenuPage>

      <FriendsMenuPage id={2} activeId={activeId}>
        <div className={styles.menuPage}>
          <MenuPageTitle title="Suggestions" href="/friends" />
        </div>
      </FriendsMenuPage>

      <FriendsMenuPage id={3} activeId={activeId}>
        <div className={styles.menuPage}>
          <MenuPageTitle title="All friends" href="/friends" />
          <div className={styles.menuSearch}>
            <span className={styles.menuSearchIcon}>
              <SearchIcon />
            </span>
            <input
              className={styles.menuSearchInput}
              placeholder="Search Friends"
            />
          </div>
          <LineDivider />
          <div style={{ marginTop: "8px", marginLeft: "16px" }}>Friends</div>
          <div
            style={{
              marginTop: "4px",
              marginLeft: "16px",
              fontSize: ".8125rem",
              fontWeight: "400",
              color: "var(--secondary-text)",
            }}
          >
            No friends to show
          </div>
        </div>
      </FriendsMenuPage>

      <FriendsMenuPage id={4} activeId={activeId}>
        <div className={styles.menuPage}>
          <MenuPageTitle title="Custom Lists" href="/friends" />
        </div>
      </FriendsMenuPage>
    </div>
  )
}
