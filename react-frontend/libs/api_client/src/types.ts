
export type APIUserProfile = {
  id:           string
  name:         string
  username:     string
  friendIDs:    string[]
  thumbnailID:  string
  bannerID:     string
}

export type APIMiniUserProfile = {
  id:           string
  name:         string
  username:     string
  thumbnailID:  string
  bannerID:     string
}

export type APICommentData = {
  owner: APIMiniUserProfile
  text: string
  responds: APICommentData[] | null
  createdAt: number
}

export type APIPostData = {
  id: string
  owner: APIMiniUserProfile
  postText: string
  postImages: string[] | null
  comments: APICommentData[] | null
  likedByCurrentUser: boolean
  likeCount: number
  shareCount: number
  createdAt: number
}
