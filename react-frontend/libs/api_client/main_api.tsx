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
  attachImage: boolean
}

export type CreatePostResponse = {
  imageID: string
}

export type GetHistricUserPostsData = {
  userID: string
  skip: number
}

export type APICommentData = {
  owner: APIUserProfileResponse
  text: string
  responds: APICommentData[] | null
  createdAt: number
}

export type APIPostData = {
  id: string
  owner: APIUserProfileResponse
  postText: string
  postImages: string[] | null
  comments: APICommentData[] | null
  likedByCurrentUser: boolean
  likeCount: number
  shareCount: number
  createdAt: number
}

// export type APIMiniProfile = {
//   name: string
//   username: string
//   thumbnailID: string
// }

export type LikePostRequest = {
  postID: string
}

export type DeletePostRequest = {
  postID: string
}

export type SharePostRequest = {
  postID: string
}

export type GetPostRequest = {
  postID: string
}

export type CreateCommentRequest = {
  postID: string
  text: string
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
  getProfileByUsername: async (username: string) => {
    const resp = await mainAPIClient.get<APIUserProfileResponse>("/profiles/get", {params: {username}})
    return resp.data
  },
  createPost: async (data: CreatePostRequestData) => {
    const resp = await mainAPIClient.post<CreatePostResponse>("/posts", data)
    return resp.data
  },
  createComment: async (data: CreateCommentRequest) => {
    await mainAPIClient.post(`/posts/${data.postID}/comment`, {"text": data.text})
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
  deletePost: async (params: DeletePostRequest) => {
    await mainAPIClient.delete("/posts", {params})
  },
  likePost: async (data: LikePostRequest) => {
    await mainAPIClient.post("/posts/like", data)
  },
  sharePost: async (data: SharePostRequest) => {
    await mainAPIClient.post("/posts/share", data)
  },
}

export type UploadPostImageRequest = {
  id: string
  img: Blob
}

export const assetsAPI = {
  uploadProfileCover: async (data: Blob) => {
    await assetsAPIClient.post("/profile/cover", data, {headers: {"Content-Type": data.type}})
  },
  uploadProfileThumbnail: async (data: Blob) => {
    await assetsAPIClient.post("/profile/thumbnail", data, {headers: {"Content-Type": data.type}})
  },
  uploadPostImage: async (data: UploadPostImageRequest) => {
    await assetsAPIClient.post(`/post/images/${data.id}`, data.img, {headers: {"Content-Type": data.img.type}})
  },
}

export function getImageURLFromId(imageID?: string): string {
  if (imageID === undefined)
    return ""

  return "https://test-facebook-public.s3.ap-southeast-1.amazonaws.com/" + imageID
}