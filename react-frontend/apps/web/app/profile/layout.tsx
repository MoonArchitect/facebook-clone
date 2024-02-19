"use client"

import { PropsWithChildren } from "react"


import { ProfileCover } from "@facebook-clone/web/components/profile-page/profile-cover"
import { RequireAuthenticated } from "@facebook-clone/web/components/utils/require-auth"

export default function ProfileLayout(props: PropsWithChildren) {
  const { children } = props

  return (
    <RequireAuthenticated redirectPath="/">
      <ProfileCover />
      {/* <ProfileNavigationMenu /> */}
      {children}
    </RequireAuthenticated>
  )
}
