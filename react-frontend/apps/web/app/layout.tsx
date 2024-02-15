import { PropsWithChildren } from "react"

import { Navbar } from "@facebook-clone/web/components/navbar/navbar"

import { SessionContextProvider } from "@facebook-clone/web/components/utils/session-context"
import { cookies } from "next/headers"
import "./global.css"

export default function IndexLayout(props: PropsWithChildren) {
  const { children } = props
  const {get} = cookies()

  const authCookieExists = get("auth_v0") !== undefined // TODO: do actual auth check with public key

  return (
    <html lang="en">
      <SessionContextProvider authCookieExists={authCookieExists}>
        <body className="bright-theme">
          <Navbar />
          {children}
        </body>
      </SessionContextProvider>
    </html>
  )
}
