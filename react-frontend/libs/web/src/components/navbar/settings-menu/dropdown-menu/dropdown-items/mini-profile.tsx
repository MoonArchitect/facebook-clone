import clsx from "clsx"
import Link from "next/link"

import { useMeQuery } from "@facebook-clone/web/query-hooks/profile-hooks"
import commonStyles from "./common-item-styles.module.scss"

export const MiniProfile = () => {
  const {data} = useMeQuery()

  return (
    <Link href="profile/" className={clsx(commonStyles.menuItem, commonStyles.menuMiniProfile)}>
      <img src={data?.thumbnailURL ?? ""} alt="" />
      <div>
        <span>{data?.name ?? "not available"}</span>
        <br />
        <span className={commonStyles.subTitle}>See your profile</span>
      </div>
    </Link>
  )
}
