import { GlobalTheme, ServerOptionKeys } from "../components/utils/server-options/server-options"
import { setServerOption } from "../components/utils/server-options/set-server-options"

export const useGlobalTheme = () => {
  const setTheme = (mode: GlobalTheme) => {
    if (mode === GlobalTheme.DarkTheme) {
      setServerOption(ServerOptionKeys.GlobalTheme, GlobalTheme.DarkTheme)

      document.body.classList.remove("bright-theme")
      document.body.classList.add("dark-theme", "notransition")
      setTimeout(() => {
        document.body.classList.remove("notransition")
      }, 25)
    } else {
      setServerOption(ServerOptionKeys.GlobalTheme, GlobalTheme.BrightTheme)

      document.body.classList.remove("dark-theme")
      document.body.classList.add("bright-theme", "notransition")
      setTimeout(() => {
        document.body.classList.remove("notransition")
      }, 25)
    }
  }

  return {
    setTheme,
  }
}