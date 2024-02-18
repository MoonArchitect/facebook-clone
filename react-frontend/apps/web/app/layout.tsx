import { PropsWithChildren } from "react"

import { Navbar } from "@facebook-clone/web/components/navbar/navbar"

import { APIUserProfileResponse } from "@facebook-clone/api_client/main_api"
import { GlobalModals } from "@facebook-clone/web/components/global-modals/global-modals"
import { TanstackQueryClientProvider } from "@facebook-clone/web/components/utils/react-query-provider"
import { parseServerOptions } from "@facebook-clone/web/components/utils/server-options/parse-server-options"
import { GlobalTheme } from "@facebook-clone/web/components/utils/server-options/server-options"
import { SessionContextProvider } from "@facebook-clone/web/components/utils/session-context"
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import axios from "axios"
import { cookies } from "next/headers"
import { cache } from 'react'
import "./global.css"

const getQueryClient = cache(() => new QueryClient())

export default async function IndexLayout(props: PropsWithChildren) {
  const { children } = props
  const {get} = cookies()
  const queryClient = getQueryClient()

  const authCookieExists = get("auth_v0") !== undefined // TODO: do actual auth check with public key
  const {theme} = parseServerOptions()

  const userAuthKey = get("auth_v0")?.value

  const mainAPIClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    timeout: 1000,
    headers: {'Cookie': userAuthKey ? `auth_v0=${userAuthKey}` : ""},
    withCredentials: true
  })

  await queryClient.prefetchQuery({
    queryKey: ["get-me-query"],
    queryFn:  async () => {
      const resp = await mainAPIClient.get<APIUserProfileResponse>("/profiles/me")
      return resp.data
    },
  })
  const dehydratedState = dehydrate(queryClient)


  return (
    <html lang="en">
      <TanstackQueryClientProvider>
        <HydrationBoundary state={dehydratedState}>
          <SessionContextProvider authCookieExists={authCookieExists}>
            <body className={theme === GlobalTheme.BrightTheme ? "bright-theme" : "dark-theme"}>
              <GlobalModals>
                <Navbar />
                {children}
              </GlobalModals>
            </body>
          </SessionContextProvider>
        </HydrationBoundary>
      </TanstackQueryClientProvider>
    </html>
  )
}
