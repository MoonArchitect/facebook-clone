import { useMemo, useState } from "react"

import { CommentsSection } from "./comments-section/comments-section"
import { ContentOrigin } from "./content-origin/content-origin"
import { ContentReactions } from "./content-reactions/content-reactions"
// import { HashTag } from "./hash-tag/hash-tag"
// import { MediaContent } from "./media-content/media-content"
import { TextContent } from "./text-content/text-content"

import styles from "./post.module.scss"

export interface CommentData {
  // comment_id: string
  // creator_id: string
  // text: string
  // likes: number
  // replies: CommentData[]
  username: string
  message: string
  date: Date
  userIconSrc: string
  wasEdited: boolean
}

export interface CreatorData {
  user_id: string
  date_created: Date
  post_ids: string[]
  username: string
}

export interface PostData {
  // post_id: string
  date_created: Date
  // text: string
  // creator_id: string
  comments: CommentData[]
  sharesCount: string
  reactionsCount: string
}

// TODO: redesign 'post API scheme' and add proper interface instead of any type
export const Post = () => {
  const [commentVisibility, setCommentVisibility] = useState(false)
  // const [postData, setPostData] = useState<IPostDocument | undefined>(undefined)
  // const [creatorData, setCreatorData] = useState<IUserDocument | undefined>(
  //   undefined
  // )

  const postData: PostData = useMemo(() => {
    return {
      comments: [
        {
          date: new Date(2000, 2, 2, 2, 2, 2),
          message: "temp",
          userIconSrc: "",
          username: "test username",
          wasEdited: false,
        },
        {
          date: new Date(2000, 2, 2, 2, 2, 2),
          message: "comment 2",
          userIconSrc: "",
          username: "test username",
          wasEdited: false,
        },
      ],
      creator_id: "",
      date_created: new Date(2000, 1, 1, 1, 1, 1, 1),
      post_id: "",
      text: "Temp test",
      reactionsCount: "2", // make this a number
      sharesCount: "2 Shares", // make this a number
    }
  }, [])

  const creatorData: CreatorData = useMemo(() => {
    return {
      date_created: new Date(2000, 1, 1, 1, 1, 1, 1),
      post_ids: [""],
      user_id: "test-creator-id",
      username: "test name",
    }
  }, [])

  // const postRef = data.post_id
  // const postScore = data.score;

  // useEffect(() => {
  //   getDoc<IPostDocument>(postRef)
  //     .then((docSnapshot) => {
  //       const docData = docSnapshot.data() // TODO check if post is undefined, if so try again, don't set `postData`, `postData` should be IPostDocument (do not allow undefined)
  //       if (docData === undefined)
  //         throw "Custom error: Post document does not exist"
  //       console.log(docData)
  //       // setPostData(docData);
  //       // setTimeout(() => setPostData(docData), 4500);
  //       return docData
  //     })
  //     // .then(docData => getDoc<IUserDocument>(docData.creator))
  //     // .then(creatorSnapshot => setCreatorData(creatorSnapshot.data()))
  //     .catch((e) => console.log("Couldn't load post: " + e))
  // }, [])

  return (
    <div className={styles.container}>
      <ContentOrigin postData={postData} creatorData={creatorData} />
      <TextContent />
      {/* <TextContent postData={postData} /> */}

      {/* {postData && postData.media && (
        <MediaContent media={postData.media} mediaType={postData.media_type} />
      )} */}

      <ContentReactions
        postData={postData}
        commentVisibilityState={[commentVisibility, setCommentVisibility]}
      />

      {commentVisibility && <CommentsSection comments={postData.comments} />}
    </div>
  )
}
