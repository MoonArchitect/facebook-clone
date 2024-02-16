import { ServerOptionCookieKey, ServerOptionKeys } from "./server-options"

export const setServerOption = (key: ServerOptionKeys, value: string): void => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(ServerOptionCookieKey + "="))

  const cookieValue = cookie !== undefined ? cookie.split('=')[1] : ""

  const decodeValue = decodeURIComponent(cookieValue)
  const cookieOptions = decodeValue
    .split(';')
    .filter((val) => !val.startsWith(key + "=") && val.length > 0)

  cookieOptions.push(key + "=" + value) // TODO: validate value based on key maybe?
  const newCookieValue = encodeURIComponent(cookieOptions.join(";"))

  // TODO: think about security
  // should Expires be set or should cookie be a "session" cookie?
  // use proper Domain from config
  const newCookie = ServerOptionCookieKey + "=" + newCookieValue + ";Domain=localhost;Secure"

  document.cookie = newCookie;
}
