"use client"

import { redirect } from "next/navigation"
import { PropsWithChildren, ReactNode } from "react"
import { useSession } from "./session-context"

type RequireLoggedinProps = {
    fallbackComponent?: ReactNode
    redirectPath?: string
}

// TODO: make a separate server component version
export const RequireAuthenticated = (props: PropsWithChildren<RequireLoggedinProps>) => {
  const {children, fallbackComponent, redirectPath} = props
  const { state: {isLoggedIn} } = useSession()
  // const {push} = useRouter()

  if (!isLoggedIn) {
    if (redirectPath) {
      // push(redirectPath)
      redirect(redirectPath)
    }

    return fallbackComponent ?? null
  }

  return children
}
