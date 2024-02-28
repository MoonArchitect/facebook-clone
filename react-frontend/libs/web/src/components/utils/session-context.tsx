"use client"

import { APIUserProfileResponse } from "@facebook-clone/api_client/main_api"
import { useMeQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"
import { useQueryClient } from "@tanstack/react-query"
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react"

export type SessionType = {
    isLoggedIn: boolean,
    userData?: APIUserProfileResponse
}

export type SessionContextType = {
    state: SessionType
    setState: (v: SessionType) => void
}

const defaultSessionData: SessionType = {isLoggedIn: false}

const sessionContext = createContext<SessionContextType>({
  setState: () => {console.error("USING DEFAULT SESSION CONTEXT VALUE")}, // TODO: do better
  state: defaultSessionData,
} as SessionContextType)

export const useSession = () => {
  const {state, setState} = useContext(sessionContext)
  const {data: userData, refetch: refetchMeQuery} = useMeQuery()
  const queryClient = useQueryClient()

  return {
    state,
    userData,
    signout: () => {
      setState({isLoggedIn: false})
      window.location.reload() // TODO: temp solution to clear most of the state
    },
    signin: () => {
      refetchMeQuery()
        .then(() => {
          setState({isLoggedIn: true})
          queryClient.invalidateQueries()
        })
        .catch(() => console.error("Failed to refetchMeQuery in signin callback"))
    },
    refetchUserData: refetchMeQuery,
  }
}

export type SessionContextProviderType = {
  authCookieExists: boolean
}

export const SessionContextProvider = (props: PropsWithChildren<SessionContextProviderType>) => {
  const [state, setState] = useState<SessionType>({isLoggedIn: props.authCookieExists})
  const {isSuccess} = useMeQuery()

  useEffect(() => {
    if (isSuccess)
      setState({isLoggedIn: true})
  }, [isSuccess])

  return (
    <sessionContext.Provider value={{state, setState}}>
      {props.children}
    </sessionContext.Provider>
  )
}