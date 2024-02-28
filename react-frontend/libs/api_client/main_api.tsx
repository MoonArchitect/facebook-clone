import axios from 'axios'

// TODO: check if this is shared between all users on server side
const mainAPIClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 5000,
  withCredentials: true
})

const assetsAPIClient = axios.create({
  baseURL: 'http://localhost:8080/asset_api/v1',
  timeout: 5000,
  withCredentials: true
})


export type SignInRequestData = {
  email: string
  password: string
}

export type SignUpRequestData = {
  email: string
  password: string
  firstName: string
  lastName: string
}

export type APIUserProfileResponse = {
  id:           string
  name:         string
  username:     string
  thumbnailID:  string
  bannerID:     string
}

export type CreatePostRequestData = {
  text: string
}

export type GetHistricUserPostsData = {
  userID: string
  skip: number
}

export type APICommentData = {
  owner: APIMiniProfile
  text: string
  responds: APICommentData[] | null
  createdAt: number
}

export type APIPostData = {
  id: string
  owner: APIMiniProfile
  postText: string
  postImages: string[] | null
  comments: APICommentData[] | null
  likedByCurrentUser: boolean
  likeCount: number
  shareCount: number
  createdAt: number
}

export type APIMiniProfile = {
  name: string
  thumbnailID: string
}

export type LikePostRequest = {
  postID: string
}

export type SharePostRequest = {
  postID: string
}

export type GetPostRequest = {
  postID: string
}

export const mainAPI = {
  signIn: async (data: SignInRequestData) => {
    await mainAPIClient.post("/auth/signin", data)
  },
  signOut: async () => {
    await mainAPIClient.post("/auth/signout")
  },
  signUp: async (data: SignUpRequestData) => {
    await mainAPIClient.post("/auth/signup", data)
  },
  getMe: async () => {
    const resp = await mainAPIClient.get<APIUserProfileResponse>("/profiles/me")
    return resp.data
  },
  createPost: async (data: CreatePostRequestData) => {
    await mainAPIClient.post("/posts", data)
  },
  getHistoricUserPosts: async (params: GetHistricUserPostsData) => {
    const resp = await mainAPIClient.get<APIPostData[]>("/profiles/posts", {params})
    return resp.data
  },
  getHomePageFeed: async (skip: number) => {
    const resp = await mainAPIClient.get<APIPostData[]>("/feed/home", {params: {skip}})
    return resp.data
  },
  getGroupsPageFeed: async (skip: number) => {
    const resp = await mainAPIClient.get<APIPostData[]>("/feed/groups", {params: {skip}})
    return resp.data
  },
  getPost: async (params: GetPostRequest) => {
    const resp = await mainAPIClient.get<APIPostData>("/posts", {params})
    return resp.data
  },
  likePost: async (data: LikePostRequest) => {
    await mainAPIClient.post("/posts/like", data)
  },
  sharePost: async (data: SharePostRequest) => {
    await mainAPIClient.post("/posts/share", data)
  },
}

export const assetsAPI = {
  uploadProfileCover: async (data: Blob) => {
    await assetsAPIClient.post("/profile/cover", data, {headers: {"Content-Type": data.type}})
  },
  uploadProfileThumbnail: async (data: Blob) => {
    await assetsAPIClient.post("/profile/thumbnail", data, {headers: {"Content-Type": data.type}})
  },
}

export function getImageURLFromId(imageID?: string): string {
  if (imageID === undefined)
    return ""

  return "https://test-facebook-public.s3.ap-southeast-1.amazonaws.com/" + imageID
}