"use client"

import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react"
import { SignInModal } from "./sign-in-modal/sign-in-modal"
import { SignUpModal } from "./sign-up-modal/sign-up-modal"

type GlobalMoodals = {
  showSignupModal: () => void
  showSigninModal: () => void
}

const globalModalContext = createContext<GlobalMoodals>({
  showSignupModal: () => console.error("Error: GlobalModalContext is not initialized"),
  showSigninModal: () => console.error("Error: GlobalModalContext is not initialized"),
})

export const useGlobalModal = (): GlobalMoodals => {
  const {showSignupModal, showSigninModal} = useContext(globalModalContext)

  return {
    showSignupModal,
    showSigninModal
  }
}

export const GlobalModals = (props: PropsWithChildren) => {
  const {children} = props

  const [signUpModalOpen, setSignUpModalOpen] = useState(false)
  const [signInModalOpen, setSignInModalOpen] = useState(false)

  const globalModalContextValue = useMemo<GlobalMoodals>(() => ({
    showSignupModal: () => setSignUpModalOpen(true),
    showSigninModal: () => setSignInModalOpen(true),
  }), [])

  return (
    <globalModalContext.Provider value={globalModalContextValue}>
      <SignUpModal isOpen={signUpModalOpen} close={() => setSignUpModalOpen(false)} />
      <SignInModal isOpen={signInModalOpen} close={() => setSignInModalOpen(false)} />
      {children}
    </globalModalContext.Provider>
  )
}