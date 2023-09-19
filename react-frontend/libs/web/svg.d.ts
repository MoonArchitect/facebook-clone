declare module "*.svg" {
  import {FunctionComponent, SVGProps} from "react"

  export const ReactComponent: FunctionComponent<SVGProps<SVGElement>>

  const src: string
  export default src
}