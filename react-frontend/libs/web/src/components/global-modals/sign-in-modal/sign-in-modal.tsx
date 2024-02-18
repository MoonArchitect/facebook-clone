"use client"

import Modal from "react-modal"

import { ReactComponent as PlusIcon } from "@facebook-clone/assets/icons/plus.svg"
import { useSigninMutation } from "@facebook-clone/web/query-hooks/auth-hooks"
import { FormEvent, useCallback, useMemo } from "react"

import clsx from "clsx"
import { useGlobalModal } from "../global-modals"
import styles from "./sign-in-modal.module.scss"

export type SignInModalProps = {
  isOpen: boolean
  close: () => void
}

export const SignInModal = (props: SignInModalProps) => {
  const {isOpen, close} = props
  const {mutate: signinMutation} = useSigninMutation()
  const {showSignupModal} = useGlobalModal()

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    if (email && password)
      signinMutation({email, password}, {onSuccess: close})
  }, [signinMutation, close])

  const creatAccountCallback = useCallback(() => {
    showSignupModal()
    close()
  }, [showSignupModal, close])

  const modalAppElement = useMemo(() => typeof window !== 'undefined' && document.getElementById('root') || undefined, [])

  return (
    <Modal
      className={styles.modalContainer}
      isOpen={isOpen}
      overlayClassName={styles.modalOverlay}
      appElement={modalAppElement}
    >
      <form className={styles.container} onSubmit={(e) => handleSubmit(e)}>
        <div className={styles.legend}>
          <div className={styles.text}>
            <h1>Sign in</h1>
          </div>
          <button type="button" className={styles.closeButton} onClick={close}><PlusIcon /></button>
        </div>

        <div className={styles.lineDivider} />

        <div className={styles.row}>
          <input name="email" placeholder="Email address" className={styles.textInput}></input>
        </div>
        <div className={styles.row}>
          <input name="password" type="password" placeholder="Password" className={styles.textInput}></input>
        </div>

        <p className={styles.forgotPassword}>Forgot Password?</p>
        <button type="submit" className={clsx(styles.submitButton, styles.signInButton)}>Sign In</button>

        <div className={styles.lineDivider} />

        <button
          type="button"
          className={clsx(styles.submitButton, styles.createAccountButton)}
          onClick={creatAccountCallback}>
            Create Account
        </button>
      </form>
    </Modal>
  )
}