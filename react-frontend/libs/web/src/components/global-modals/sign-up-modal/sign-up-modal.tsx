"use client"

import { ReactComponent as PlusIcon } from "@facebook-clone/assets/icons/plus.svg"
import Modal from "react-modal"

import { useSignupMutation } from "@facebook-clone/web/query-hooks/auth-hooks"
import { FormEvent, useCallback, useMemo } from "react"
import styles from "./sign-up-modal.module.scss"

export type SignUpModalProps = {
  isOpen: boolean
  close: () => void
}

export const SignUpModal = (props: SignUpModalProps) => {
  const {isOpen, close} = props
  const {mutate: signupMutation} = useSignupMutation()

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const firstName = form.get("firstname")?.toString();
    const lastName = form.get("surname")?.toString();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    // console.log({ firstName, lastName, email, password });

    if (email && password && firstName && lastName)
      signupMutation({email, password, firstName, lastName}, {onSuccess: close})
  }, [close, signupMutation])

  const modalAppElement = useMemo(() => typeof window !== 'undefined' && document.getElementById('root') || undefined, [])

  return (
    <Modal
      className={styles.modalContainer}
      onRequestClose={() => close()}
      isOpen={isOpen}
      overlayClassName={styles.modalOverlay}
      appElement={modalAppElement ?? undefined}
    >
      <form className={styles.container} onSubmit={(e) => handleSubmit(e)}>
        <div className={styles.legend}>
          <div className={styles.text}>
            <h1>Sign up</h1>
            <p>It's quick and easy</p>
          </div>
          <button className={styles.closeButton} onClick={close}><PlusIcon /></button>
        </div>

        <div className={styles.lineDivider} />

        <div className={styles.row}>
          <input name="firstname" placeholder="First Name" className={styles.textInput}></input>
          <input name="surname" placeholder="Surname" className={styles.textInput}></input>
        </div>
        <div className={styles.row}>
          <input name="email" placeholder="Email address" className={styles.textInput}></input>
        </div>
        <div className={styles.row}>
          <input name="password" type="password" placeholder="Password" className={styles.textInput}></input>
        </div>
        {/* <div className={styles.row}>
          <div>Date of birth</div>
          <div>
            <select>
              <option>1</option>
              <option>2</option>
            </select>
            <select>
              <option>1</option>
              <option>2</option>
            </select>
            <select>
              <option>1</option>
              <option>2</option>
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <div>Gender</div>
          <div>
            <input type="radio" name="gender-option"></input>
            <input type="radio" name="gender-option"></input>
            <input type="radio" name="gender-option"></input>
          </div>
        </div> */}

        <p className={styles.smallText}>
          People who use our service may have uploaded your contact information to Facebook. Learn more.
        </p>
        <p className={styles.smallText}>
          By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy. You may receive SMS notifications from us and can opt out at any time.
        </p>

        <button className={styles.submitButton}>Submit</button>
      </form>
    </Modal>
  )
}