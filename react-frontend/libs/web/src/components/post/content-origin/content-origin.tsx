import Link from "next/link"
import { useCallback, useMemo } from "react"

import { ReactComponent as Globe2Icon } from "@facebook-clone/assets/icons/globe2.svg"

import { APIMiniUserProfile, getImageURLFromId } from "@facebook-clone/api_client/src"
import { useDeletePostMutation } from "../../../query-hooks/profile-query-hooks"

import { OptionMenuButton } from "../../ui/options-popup/option-menu-buttons"
import { OptionsButton } from "../../ui/options-popup/options-popup"
import { getDateString } from "../../utils/date"
import { useSession } from "../../utils/session-context"

import { RequireAuthenticated } from "../../utils/require-auth"
import styles from "./content-origin.module.scss"

type ContentOriginProps = {
  postOwner: APIMiniUserProfile
  postID: string
  dateCreated?: number
}

function getLinkToProfile(username: string): string {
  return `/user/${username}`
}

export const ContentOrigin = (props: ContentOriginProps) => {
  const { postOwner, dateCreated, postID } = props
  const createdAtDate = useMemo(() => dateCreated ? getDateString(dateCreated) : "...", [dateCreated])

  const {userData} = useSession()
  const {mutate: deletePost} = useDeletePostMutation(userData?.id ?? "")

  const deletePostHandler = useCallback(() => {
    deletePost({postID})
  }, [postID, deletePost])

  return (
    <div className={styles.container}>
      <Link href={getLinkToProfile(postOwner.username)} className={styles.icon}><img src={getImageURLFromId(postOwner.thumbnailID)} alt="profile thumbnail" /></Link>
      <div className={styles.infoContainer}>
        <Link href={getLinkToProfile(postOwner.username)} className={styles.links}>{postOwner.name}</Link>
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
        <RequireAuthenticated>
          <OptionMenuButton accent="blue" title="Report" />
          {postOwner.id === userData?.id && <OptionMenuButton accent="red" title="Delete" onClick={deletePostHandler} />}
        </RequireAuthenticated>
      </OptionsButton>
    </div>
  )
}
