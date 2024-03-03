import Link from "next/link"
import { useMemo } from "react"

import { APIUserProfileResponse, getImageURLFromId } from "@facebook-clone/api_client/main_api"
import { ReactComponent as Globe2Icon } from "@facebook-clone/assets/icons/globe2.svg"

import { OptionMenuButton } from "../../ui/options-popup/option-menu-buttons"
import { OptionsButton } from "../../ui/options-popup/options-popup"
import { getDateString } from "../../utils/date"

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
  const createdAtDate = useMemo(() => dateCreated ? getDateString(dateCreated) : "...", [dateCreated])

  return (
    <div className={styles.container}>
      <Link href={getLinkToProfile(user.username)} className={styles.icon}><img src={getImageURLFromId(user.thumbnailID)} alt="profile thumbnail" /></Link>
      <div className={styles.infoContainer}>
        <Link href={getLinkToProfile(user.username)} className={styles.links}>{user.name}</Link>
        <div className={styles.info}>
          <span className={styles.infoDate}>{createdAtDate}</span>
          &thinsp;·&thinsp;
          <span className={styles.infoIcon}>
            <Globe2Icon />
          </span>
        </div>
      </div>
      <OptionsButton>
        <OptionMenuButton accent="no" title="Info" />
        <OptionMenuButton accent="blue" title="Report" />
        <OptionMenuButton accent="red" title="Delete" />
      </OptionsButton>
    </div>
  )
}
