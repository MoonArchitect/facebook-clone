import { HashTag } from "../hash-tag/hash-tag"

import styles from "./text-content.module.scss"

type TextContentProps = {
  text: string
}

export const TextContent = (props: TextContentProps) => {
  const {text} = props

  // TODO: ugly legacy code, but works good enough for now
  return (
    <div className={styles.container}>
      {text.split("\n\n").map((paragraph: string, i1: number) => (
        <div key={`paragraph-${i1}`} className={styles.paragraph}>
          {paragraph.split("\n").map((line: string, i2: number) => (
            <div key={`paragraph-${i1}-${i2}`}>
              {line.split("#").map((part: string, index: number) => {
                if (index === 0) {
                  return (
                    <span key={`paragraph-${i1}-${i2}-${index}-test`}>
                      {part}
                    </span>
                  )
                } else {
                  const [first, ...rest] = part.split(/\s/)
                  return [
                    <HashTag
                      title={`#${first}`}
                      key={`paragraph-${i1}-${i2}-${index}-hashtag`}
                    />,
                    <span key={`paragraph-${i1}-${i2}-${index}-span`}>
                      {" "}
                      {rest.join(" ")}
                    </span>,
                  ]
                }
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
