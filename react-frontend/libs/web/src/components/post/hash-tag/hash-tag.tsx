import styles from "./hash-tag.module.scss"

export const HashTag = ({ title }: { title: string }) => {
  return <span className={styles.hashtag}>{title}</span>
}
