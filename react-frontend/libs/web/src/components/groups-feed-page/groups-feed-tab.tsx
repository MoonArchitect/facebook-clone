import { ReactElement } from "react"

import { ReactComponent as CogIcon } from "@facebook-clone/assets/icons/cog.svg"
import { ReactComponent as CompassIcon } from "@facebook-clone/assets/icons/compass.svg"
import { ReactComponent as NewsFeedIcon } from "@facebook-clone/assets/icons/newsfeed.svg"
import { ReactComponent as ReactIcon } from "@facebook-clone/assets/icons/react_logo.svg"

import { Feed } from "../feed/feed"
import { LineDivider, MenuButton, NavigationButton, SearchBar } from "../ui"

import { useGetGroupsPageFeedQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"
import styles from "./groups-feed-tab.module.scss"

// <Button icon={CogIcon} action=...  />

interface GroupLinkProps {
  icon: ReactElement
  name: string
  post_for_you?: number
}

const GroupLink = (props: GroupLinkProps) => {
  const { icon, name, post_for_you = 0 } = props

  return (
    <div className={styles.groupLink}>
      {/* <img src={logoURL} alt="" /> */}
      {icon}
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={styles.additionalInfo}>
          {post_for_you ? (
            <>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  background: "var(--accent)",
                  borderRadius: "50%",
                  display: "inline-flex",
                  marginBottom: "0.03rem",
                  marginRight: "4px",
                }}
              ></span>
              <span>
                {post_for_you} {post_for_you === 1 ? "post" : "posts"} for you
              </span>
            </>
          ) : (
            "Last active 2 days ago"
          )}
        </div>
      </div>
    </div>
  )
}

const Groups = () => {
  return (
    <div className={styles.groupsMenu}>
      <div className={styles.titleBlock}>
        <div className={styles.title}> Groups </div>
        <MenuButton icon={<CogIcon />} />
      </div>

      <div className={styles.searchContainer}>
        <SearchBar placeholder="Search groups" icon />
      </div>

      <div className={styles.navigationBlock}>
        <NavigationButton icon={<NewsFeedIcon />} title="Your feed" />
        <NavigationButton icon={<CompassIcon />} title="Discover" />
      </div>

      <div className={styles.createNewGroupButton}>＋ Create new group</div>

      <LineDivider />

      <div
        style={{
          marginLeft: "16px",
          marginTop: "14px",
          marginBottom: "8px",
          fontSize: "1.0625rem",
          lineHeight: "1.1765",
          fontWeight: "600",
        }}
      >
        {" "}
        Groups you've joined{" "}
      </div>

      <GroupLink
        post_for_you={1}
        name="Deno"
        icon={
          <img
            src={"https://deno.land/logo.svg?__frsh_c=8qaybgjxxdv0"}
            alt=""
          />
        }
      />
      <GroupLink
        name="NodeJS"
        icon={
          <img
            src={"https://cdn-icons-png.flaticon.com/512/5968/5968322.png"}
            alt=""
          />
        }
      />
      <GroupLink post_for_you={5} name="React" icon={<ReactIcon />} />
    </div>
  )
}

// Menu Buttons component

export const GroupsFeedTab = () => {
  const queryRes = useGetGroupsPageFeedQuery()

  return (
    <div className={styles.groupsTabContainer}>
      <Groups />
      <div className={styles.feed}>
        <div className={styles.recentActivity}> Recent activity </div>
        <Feed queryRes={queryRes} includeCreatePostSection />
      </div>
    </div>
  )
}
