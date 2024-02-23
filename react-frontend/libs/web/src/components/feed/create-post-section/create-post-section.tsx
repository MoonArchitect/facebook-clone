import { useMeQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"
import { useGlobalModal } from "../../global-modals/global-modals"
import { LineDivider, NavigationButton } from "../../ui"
import { ProfilePreview } from "../../ui/profile-preview/profile-preview"

import { RequireAuthenticated } from "../../utils/require-auth"
import styles from "./create-post-section.module.scss"

const VideoIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yE/r/epGAMnVkMsy.png?_nc_eui2=AeEWIj5mBPtRos9zMCvBhTVaLvvaxKiLzcEu-9rEqIvNwfYUTcGeuxPQhNVdLjIQuwtmbeI1ofts_EOPCEp0FDXe" className={styles.iconImage} alt="" />
const ImageIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/yQ/r/74AG-EvEtBm.png?_nc_eui2=AeGI40qt-sq_wGIC4IbLAolPjLWb3nZ8TcaMtZvednxNxgiThUktEHGM1pQHJkQpPaRBfsdk7-DjbJuY7UPxeJqS" className={styles.iconImage} alt="" />
const HappyIcon = <img src="https://static.xx.fbcdn.net/rsrc.php/v3/y7/r/_RWOIsUgWGL.png?_nc_eui2=AeHmi-iv8VZdJfcOM62FJDJopRYQ3zWJHxilFhDfNYkfGEnjqhDZHzk2okn4tVs7Grha0kA7UXm2IPfHq24AIBoW" className={styles.iconImage} alt="" />

export const CreatePostSection = () => {
  const {data} = useMeQuery()
  const {showCreatePostModal} = useGlobalModal()

  return (
    <RequireAuthenticated>
      <div className={styles.container}>
        <div className={styles.firstRow}>
          <div className={styles.thumbnailContainer}>
            <ProfilePreview thumbnailURL={data?.thumbnailURL ?? ""} link="/profile" />
          </div>
          <div className={styles.createButton} onClick={showCreatePostModal}>Create Post</div>
        </div>
        <LineDivider />
        <div className={styles.secondRow}>
          <NavigationButton justifyCenter icon={VideoIcon} title="Live Video"/>
          <NavigationButton justifyCenter icon={ImageIcon} title="Photo/Video"/>
          <NavigationButton justifyCenter icon={HappyIcon} title="Feelings/activity"/>
        </div>
      </div>
    </RequireAuthenticated>
  )
}