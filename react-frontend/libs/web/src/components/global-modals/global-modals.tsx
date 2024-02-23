"use client"

import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react"
import { CreatePostModal } from "./create-post-modal/create-post-modal"
import { SignInModal } from "./sign-in-modal/sign-in-modal"
import { SignUpModal } from "./sign-up-modal/sign-up-modal"

type GlobalMoodals = {
  showSignupModal: () => void
  showSigninModal: () => void
  showCreatePostModal: () => void
}

const globalModalContext = createContext<GlobalMoodals>({
  showSignupModal: () => console.error("Error: GlobalModalContext is not initialized"),
  showSigninModal: () => console.error("Error: GlobalModalContext is not initialized"),
  showCreatePostModal: () => console.error("Error: GlobalModalContext is not initialized"),
})

export const useGlobalModal = (): GlobalMoodals => {
  const {showSignupModal, showSigninModal, showCreatePostModal} = useContext(globalModalContext)

  return {
    showSignupModal,
    showSigninModal,
    showCreatePostModal
  }
}

export const GlobalModals = (props: PropsWithChildren) => {
  const {children} = props

  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false)
  const [isSignInModalOpen, setSignInModalOpen] = useState(false)
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false)

  const globalModalContextValue = useMemo<GlobalMoodals>(() => ({
    showSignupModal: () => setSignUpModalOpen(true),
    showSigninModal: () => setSignInModalOpen(true),
    showCreatePostModal: () => setCreatePostModalOpen(true),
  }), [])

  return (
    <globalModalContext.Provider value={globalModalContextValue}>
      <SignUpModal isOpen={isSignUpModalOpen} close={() => setSignUpModalOpen(false)} />
      <SignInModal isOpen={isSignInModalOpen} close={() => setSignInModalOpen(false)} />
      <CreatePostModal isOpen={isCreatePostModalOpen} close={() => setCreatePostModalOpen(false)} />
      {children}
    </globalModalContext.Provider>
  )
}