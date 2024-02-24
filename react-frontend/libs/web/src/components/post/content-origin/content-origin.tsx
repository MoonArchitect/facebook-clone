import { ReactComponent as FlatMenuIcon } from "@facebook-clone/assets/icons/flat-menu.svg"
import { ReactComponent as Globe2Icon } from "@facebook-clone/assets/icons/globe2.svg"


import { APIMiniProfile, getImageURLFromId } from "@facebook-clone/api_client/main_api"
import styles from "./content-origin.module.scss"

type ContentOriginProps = {
  user: APIMiniProfile
  dateCreated?: number
}

export const ContentOrigin = (props: ContentOriginProps) => {
  const { user, dateCreated } = props

  return (
    <div className={styles.container}>
      <div className={styles.icon}><img src={getImageURLFromId(user.thumbnailID)} alt="profile thumbnail" /></div>
      <div className={styles.infoContainer}>
        <div className={styles.links}>{user.name}</div>
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
