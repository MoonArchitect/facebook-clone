// import { getAnalytics } from "firebase/analytics"
// import { initializeApp } from "firebase/app"
// import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { useCallback, useEffect, useRef } from "react"

import { Feed } from "../feed/feed"
import { NavigationMenu } from "./navigation-menu/navigation-menu"
import { RightAddOn } from "./right-add-on/right-add-on"

import styles from "./home.module.scss"

//  <SessionProvider /> react context
//      - is authenticated
//   - user info
//  useSession() hook
//  signIn()
//    - uses firebase client sdk to signin (can get JWT token)
//  signOut()
//

export const HomePage = () => {
  const inputRefUsername = useRef<HTMLInputElement>(null)
  const inputRefPassword = useRef<HTMLInputElement>(null)

  const loginCallback = useCallback(async () => {
    const email = inputRefUsername.current?.value
    const password = inputRefPassword.current?.value
    if (!email || !password) {
      console.log("no email or pwd", inputRefUsername, email, password)
      return
    }

    const response = await fetch("localhost:8080/login", {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({ email, password }), // body data type must match "Content-Type" header
    })
  }, [])

  const signupCallback = useCallback(() => {
    // const email = inputRefUsername.current?.value
    // const password = inputRefPassword.current?.value
    // if (!email || !password) {
    //   console.log("no email or pwd", email, password)
    //   return
    // }
    // const auth = getAuth()
    // createUserWithEmailAndPassword(auth, email, password)
    //   .then((userCredential) => {
    //     // Signed in
    //     // const user = userCredential.user
    //     // ...
    //   })
    //   .catch((error) => {
    //     // console.log("sign up error", error?.code, error?.message)
    //   })
  }, [])

  return (
    <div className={styles.container}>
      <input ref={inputRefUsername} placeholder="username"></input>
      <input ref={inputRefPassword} placeholder="password"></input>
      <button onClick={signupCallback}>Create</button>
      <button onClick={loginCallback}>Login</button>
      <NavigationMenu />
      <Feed />
      <RightAddOn />
    </div>
  )
}
