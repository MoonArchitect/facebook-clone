"use client"

import { useMeQuery } from "@facebook-clone/web/query-hooks/profile-hooks"
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react"

export type SessionType = {
    isLoggedIn: boolean
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
  const {refetch: refetchMeQuery} = useMeQuery()

  return {
    state,
    signout: () => {
      setState({isLoggedIn: false})
    },
    signin: () => {
      refetchMeQuery()
        .then(() => setState({isLoggedIn: true}))
        .catch(() => console.error("Failed to refetchMeQuery in signin callback"))
    }
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