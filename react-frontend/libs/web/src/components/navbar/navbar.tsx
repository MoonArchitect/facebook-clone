"use client"

import { NavigationMenu } from "./navigation-menu/navigation-menu"
import { SearchMenu } from "./search-menu/search-menu"
import { SettingsMenu } from "./settings-menu/settings-menu"

import { useGlobalModal } from "../global-modals/global-modals"
import { RequireAuthenticated } from "../utils/require-auth"

import styles from "./navbar.module.scss"

export const Navbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.layer_1}>
        <RequireAuthenticated>
          <NavigationMenu />
        </RequireAuthenticated>
      </div>

      <div className={styles.layer_2}>
        <SearchMenu />
        <RequireAuthenticated fallbackComponent={<SigninComponent />}>
          <SettingsMenu />
        </RequireAuthenticated>
      </div>
    </div>
  )
}

const SigninComponent = () => {
  const {showSignupModal, showSigninModal} = useGlobalModal()

  return (
    <div className={styles.signinComponent}>
      <button className={styles.signinButton} onClick={showSigninModal}>Sign In</button>
      <button className={styles.createAccountButton} onClick={showSignupModal}>Create Account</button>
    </div>
  )
}
