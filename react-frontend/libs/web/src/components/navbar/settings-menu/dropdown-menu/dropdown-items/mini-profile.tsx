import clsx from "clsx"
import Link from "next/link"

import { useMeQuery } from "../../../../../query-hooks/profile-query-hooks"

import { getImageURLFromId } from "@facebook-clone/api_client/src"
import commonStyles from "./common-item-styles.module.scss"

export const MiniProfile = () => {
  const {data} = useMeQuery()

  return (
    <Link href="/profile" className={clsx(commonStyles.menuItem, commonStyles.menuMiniProfile)}>
      <img src={data?.thumbnailID ? getImageURLFromId(data.thumbnailID) : ""} alt="" />
      <div>
        <span>{data?.name ?? "not available"}</span>
        <br />
        <span className={commonStyles.subTitle}>See your profile</span>
      </div>
    </Link>
  )
}
