"use client"

import { NavigationMenu } from "./navigation-menu/navigation-menu"
import { SearchMenu } from "./search-menu/search-menu"
import { SettingsMenu } from "./settings-menu/settings-menu"

import { useSigninMutation, useSignupMutation } from "@facebook-clone/web/query-hooks/auth-hooks"
import { useRef } from "react"
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
  const {mutate: signinMutation} = useSigninMutation()
  const {mutate: signupMutation} = useSignupMutation()
  const inputRefUsername = useRef<HTMLInputElement>(null)
  const inputRefPassword = useRef<HTMLInputElement>(null)

  const signinCallback = () => {
    const email = inputRefUsername.current?.value
    const password = inputRefPassword.current?.value
    if (!email || !password) {
      console.error("no email or pwd: ", email, " - ", password)
      return
    }
    signinMutation({email, password})
  }

  const signupCallback = () => {
    const email = inputRefUsername.current?.value
    const password = inputRefPassword.current?.value
    if (!email || !password) {
      console.error("no email or pwd: ", email, " - ", password)
      return
    }
    signupMutation({email, password})
  }

  return (
    <div>
      <input ref={inputRefUsername} placeholder="username"></input>
      <input ref={inputRefPassword} placeholder="password"></input>
      <button onClick={signupCallback}>Create</button>
      <button onClick={signinCallback}>Login</button>
    </div>
  )

}
