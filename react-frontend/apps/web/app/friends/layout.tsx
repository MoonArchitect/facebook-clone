"use client"

import { PropsWithChildren } from "react"

import { MenuTab } from "@facebook-clone/web/components/friends-page/friends"
import { RequireAuthenticated } from "@facebook-clone/web/components/utils/require-auth"

export default function IndexLayout(props: PropsWithChildren) {
  const { children } = props

  return (
    <RequireAuthenticated redirectPath="/">
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "calc(100vh - var(--nav-size))",
        }}
      >
        <MenuTab />
        {children}
      </div>
    </RequireAuthenticated>
  )
}
