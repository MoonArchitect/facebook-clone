import { useEffect } from "react"

export const useClickOutside = (
  domRef: React.RefObject<HTMLElement>,
  effect: () => void
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
