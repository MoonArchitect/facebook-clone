"use client"

import { ProfileCover } from "@facebook-clone/web/components/profile-page/profile-cover"
import { useProfileByUsernameQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"
import { PropsWithChildren } from "react"

export default function ProfileLayout(props: PropsWithChildren<{params: {username: string}}>) {
  const { params, children } = props
  const {username} = params
  const {data} = useProfileByUsernameQuery(username)

  return (
    <>
      <ProfileCover profile={data} />
      {children}
    </>
  )
}
