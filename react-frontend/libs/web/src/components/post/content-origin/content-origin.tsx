import { ReactComponent as FlatMenuIcon } from "@facebook-clone/assets/icons/flat-menu.svg"
import { ReactComponent as Globe2Icon } from "@facebook-clone/assets/icons/globe2.svg"


import { APIUserProfileResponse, getImageURLFromId } from "@facebook-clone/api_client/main_api"
import Link from "next/link"
import styles from "./content-origin.module.scss"

type ContentOriginProps = {
  user: APIUserProfileResponse
  dateCreated?: number
}

function getLinkToProfile(username: string): string {
  return `/user/${username}`
}

export const ContentOrigin = (props: ContentOriginProps) => {
  const { user, dateCreated } = props

  return (
    <div className={styles.container}>
      <Link href={getLinkToProfile(user.username)} className={styles.icon}><img src={getImageURLFromId(user.thumbnailID)} alt="profile thumbnail" /></Link>
      <div className={styles.infoContainer}>
        <Link href={getLinkToProfile(user.username)} className={styles.links}>{user.name}</Link>
        <div className={styles.info}>
          <span className={styles.infoDate}>{dateCreated ? new Date(dateCreated * 1000).toDateString() : "Loading ..."}</span>
          &thinsp;·&thinsp;
          <span className={styles.infoIcon}>
            <Globe2Icon />
          </span>
        </div>
      </div>
      <div className={styles.optionsButton}>
        <FlatMenuIcon />
      </div>
    </div>
  )
}
