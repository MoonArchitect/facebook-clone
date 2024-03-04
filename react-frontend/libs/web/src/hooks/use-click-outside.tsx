import { RefObject, useEffect } from "react"

export const useClickOutside = (
  domRef: RefObject<HTMLElement>,
  effect: () => void,
) => {
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const target = event.target

      if (target instanceof Element && !domRef?.current?.contains(target)) {
        effect()
      }
    }

    document.addEventListener("mousedown", clickHandler)

    return () => {
      document.removeEventListener("mousedown", clickHandler)
    }
  }, [domRef, effect])
}

export type UseClickOutsideSubscriber = {
  effect: () => void,
  domRef: RefObject<HTMLElement>
}

// Used to allow this to be unmounted with the popup that it closes to avoid
//  event handler staying subscribed after popup it closes is unmounted
export const UseClickOutsideSubscriber = (props: UseClickOutsideSubscriber) => {
  const {domRef, effect} = props

  useClickOutside(domRef, () => {
    effect()
  })

  return null
}
