"use client"

import { PropsWithChildren } from "react"


import { ProfileCover } from "@facebook-clone/web/components/profile-page/profile-cover"
import { RequireAuthenticated } from "@facebook-clone/web/components/utils/require-auth"
import { useMeQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"

export default function ProfileLayout(props: PropsWithChildren) {
  const { children } = props

  return (
    <RequireAuthenticated redirectPath="/">
      <ProfileComponent />
      {children}
    </RequireAuthenticated>
  )
}

const ProfileComponent = () => {
  const {data} = useMeQuery()

  return (
    <ProfileCover profile={data} />
  )
}