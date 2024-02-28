"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PropsWithChildren, useState } from "react"

export const TanstackQueryClientProvider = (props: PropsWithChildren) => {
  const [queryClient] = useState(
    // TODO: sensible config
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
      {/* <ReactQueryDevtools  /> */}
    </QueryClientProvider>
  )
}