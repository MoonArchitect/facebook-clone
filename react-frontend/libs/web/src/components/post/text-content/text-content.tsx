// import { HashTag } from "../hash-tag/hash-tag"

import styles from "./text-content.module.scss"

// TODO: redesign 'post API' and add proper interface instead of any type
// const SingleParagraph = (item:any, i2: number) => (
//   item.type === "text" ? item.data : <HashTag key={`${i2}-${item.data}`} title={item.data} />
// );

// TODO: do not use element index for keys
export const TextContent = () => {
  // if (postData === undefined) {
  //   return <div style={{ height: "120px" }}></div>
  // }

  return (
    <div className={styles.container}>
      <div className={styles.paragraph}>
        <div>
          <span>
            temp text temp text temp text temp text temp text temp text temp
            text temp text temp text temp text temp text temp text temp text
            temp text temp text temp text temp text temp text temp text temp
            text temp text temp text temp text temp text temp text temp text
            temp text temp text temp text temp text temp text temp text temp
            text temp text temp text temp text temp text temp text temp text
          </span>
        </div>
      </div>
      {/* {postData.text.split("\n\n").map((paragraph: string, i1: number) => (
        <div key={`paragraph-${i1}`} className="text-content-paragraph">
          {paragraph.split("\n").map((line: string, i2: number) => (
            <div key={`paragraph-${i1}-${i2}`}>
              {line.split("#").map((part: string, index: number) => {
                if (index == 0) {
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

                  // Alternative
                  // return <React.Fragment key=...> <HashTag title={`#${first}`} key={`paragraph-${i1}-${i2}-${index}-hashtag`} /> <span key={`paragraph-${i1}-${i2}-${index}-span`}>{ rest.join(" ") }</span> </>
                }
              })}
            </div>
          ))}
        </div>
      ))} */}
    </div>
  )
}
