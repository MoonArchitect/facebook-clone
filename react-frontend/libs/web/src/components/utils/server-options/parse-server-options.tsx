import { cookies } from "next/headers"
import { GlobalTheme, ServerOptionCookieKey, ServerOptionKeys, ServerOptions, defaultOptions } from "./server-options"

export const parseServerOptions = (): ServerOptions => {
  const {get} = cookies()
  const cookie = get(ServerOptionCookieKey)

  const options = {...defaultOptions} // shallow copy

  if (cookie === undefined) {
    return options
  }

  const str = decodeURIComponent(cookie.value)
  const chunks = str.split(';')
  for (const i in chunks) {
    const parts = chunks[i].split('=')
    if (parts.length !== 2) {
      console.error("found server option where parts.length != 2")
    }
    else {
      const key = parts[0]
      const val = parts[1]
      // TODO: support generic option key/values
      if (key === ServerOptionKeys.GlobalTheme) {
        options.theme = val === GlobalTheme.BrightTheme ? GlobalTheme.BrightTheme : GlobalTheme.DarkTheme
      }
    }
  }

  return options
}
