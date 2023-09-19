// import { IPostDocument, IUserDocument } from "Firebase/IFirebase"
// import DefaultUserProfilePicture from "assets/images/profile-picture.png"

import { ReactComponent as FlatMenuIcon } from "@facebook-clone/assets/icons/flat-menu.svg"
import { ReactComponent as Globe2Icon } from "@facebook-clone/assets/icons/globe2.svg"

import { CreatorData, PostData } from "../post"

import styles from "./content-origin.module.scss"

interface ContentOriginProps {
  postData: PostData
  creatorData: CreatorData
}

export const ContentOrigin = (props: ContentOriginProps) => {
  const { postData, creatorData } = props

  // userIcon: "", userName: creatorData ? creatorData.name : "... loading ...", date: postData.date_created.toDate().toDateString()
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{/* <img src={DefaultUserProfilePicture} /> */}D</div>
      <div className={styles.infoContainer}>
        <div className={styles.links}>{creatorData ? creatorData.username : "Loading ..."}</div>
        <div className={styles.info}>
          <span className={styles.infoDate}>{postData ? postData.date_created.toDateString() : "Loading ..."}</span>
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
