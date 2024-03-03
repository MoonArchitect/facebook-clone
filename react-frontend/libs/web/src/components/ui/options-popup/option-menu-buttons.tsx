
import clsx from "clsx"
import styles from "./option-menu-buttons.module.scss"

type OptionMenuButtonProps = {
    title: string
    accent: "no" | "red" | "blue"
    onClick?: () => void
}

export const OptionMenuButton = (props: OptionMenuButtonProps) => {
  const {title, accent, onClick} = props

  return (
    <div className={clsx(styles.buttonContainer, accent === "red" && styles.redAccent, accent === "blue" && styles.blueAccent)} onClick={onClick}>
      {title}
    </div>
  )
}
