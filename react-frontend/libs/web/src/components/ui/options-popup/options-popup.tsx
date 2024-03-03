import { ReactComponent as FlatMenuIcon } from "@facebook-clone/assets/icons/flat-menu.svg"

import { PropsWithChildren, forwardRef, useRef, useState } from "react"
import { CSSTransition } from "react-transition-group"

import { UseClickOutsideSubscriber } from "../../../hooks"

import styles from "./options-popup.module.scss"


// must pass OptionButton(s) as children
export const OptionsButton = (props: PropsWithChildren) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const nodeRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className={styles.optionsButtonContainer}>
      {isExpanded && <UseClickOutsideSubscriber domRef={containerRef} effect={() => setIsExpanded(false)} />}

      <div className={styles.optionsButton} onClick={() => {
        setIsExpanded(!isExpanded)
      }}>
        <FlatMenuIcon />
      </div>

      <CSSTransition
        in={isExpanded}
        nodeRef={nodeRef}
        timeout={100}
        classNames={{
          enter: styles.enter,
          enterActive: styles.enterActive,
          enterDone: styles.enterDone,
          exit: styles.exit,
          exitActive: styles.exitActive,
          exitDone: styles.exitDone,
        }}
        unmountOnExit
      >
        <SettingsPopup ref={nodeRef} children={props.children} />
      </CSSTransition>
    </div>
  )
}

export const SettingsPopup = forwardRef<HTMLDivElement, PropsWithChildren>((props, forwardedRef) => {
  return (
    <div ref={forwardedRef} className={styles.container}>
      {props.children}
    </div>
  )
})
