
export const ServerOptionCookieKey = 'server-user-options'

export enum GlobalTheme {
    BrightTheme = "bright-theme",
    DarkTheme = "dark-theme"
}

export enum ServerOptionKeys {
  GlobalTheme = "global-theme"
}

export type ServerOptions = {
    theme: GlobalTheme
}

export const defaultOptions: ServerOptions = {
  theme: GlobalTheme.BrightTheme
}