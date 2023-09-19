import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"

import UserProfilePicture from "@facebook-clone/assets/images/profile-picture.png"

import commonStyles from "./common-item-styles.module.scss"

export const MiniProfile = () => {
  return (
    <Link href="profile/" className={clsx(commonStyles.menuItem, commonStyles.menuMiniProfile)}>
      <Image src={UserProfilePicture} alt="" />
      <div>
        <span>Your Name</span>
        <br />
        <span className={commonStyles.subTitle}>See your profile</span>
      </div>
    </Link>
  )
}
