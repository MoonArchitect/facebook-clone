import { getImageURLFromId } from "@facebook-clone/api_client/src"
import { SyntheticEvent, useCallback, useState } from "react"
import styles from "./media-content.module.scss"

// TODO: redesign 'post API' and add proper interface instead of any type
// const getMediaContent = (media: any, mediaType: string) => {
// switch (mediaType) {
//   case "image":
//     return <img className="media-content-img" src={media.url} alt="" />
//   case "link":
//     return (
//       <a href={media.url} className="media-content-link">
//         <img className="media-content-link-preview" src={media.previewUrl} />
//         <div className="media-content-link-info">
//           {media.domainTitle && (
//             <div className="media-content-link-domain-title">
//               {" "}
//               {media.domainTitle}{" "}
//             </div>
//           )}
//           {media.title && (
//             <div className="media-content-link-title"> {media.title} </div>
//           )}
//           {media.description && (
//             <div className="media-content-link-description">
//               {" "}
//               {media.description}{" "}
//             </div>
//           )}
//         </div>
//       </a>
//     )
// }
// }

export type MediaContentProps = {
  images: string[]
}

export const MediaContent = (props: MediaContentProps) => {
  const {images} = props

  const [imgSrc, setImgSrc] = useState(images.length > 0 ? getImageURLFromId(images[0]) : "")
  const [reloadCount, setReloadCount] = useState(0)

  // TODO: this is terrible, redo
  const onImageLoadError = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
    if (reloadCount < 2 && images.length > 0) {
      setTimeout(() => {
        setImgSrc(getImageURLFromId(images[0]) + `?reloadCount=${reloadCount}`)
        setReloadCount(reloadCount + 1)
      }, 200)
    }
  }, [reloadCount, images])

  if (images.length === 0)
    return null

  return (
    <div className={styles.container}>
      <img className={styles.img} src={imgSrc} alt="post media content" onError={onImageLoadError} />
    </div>
  )
}
