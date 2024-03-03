import axios, { AxiosInstance } from 'axios'
import { APIPostData, APIUserProfile } from './types'

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

export type FriendRequestData = {
  userID: string
}

export type CreateCommentRequest = {
  postID: string
  text: string
}

// TODO: check if this is shared between all users on server side
const mainApiAxiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 5000,
  withCredentials: true
})

const createMainApiClient = (client: AxiosInstance) => {
  return {
    signIn: async (data: SignInRequestData) => {
      await client.post("/auth/signin", data)
    },
    signOut: async () => {
      await client.post("/auth/signout")
    },
    signUp: async (data: SignUpRequestData) => {
      await client.post("/auth/signup", data)
    },
    getMe: async () => {
      const resp = await client.get<APIUserProfile>("/profiles/me")
      return resp.data
    },
    getProfileByUsername: async (username: string) => {
      const resp = await client.get<APIUserProfile>("/profiles/get", {params: {username}})
      return resp.data
    },
    createPost: async (data: CreatePostRequestData) => {
      const resp = await client.post<CreatePostResponse>("/posts", data)
      return resp.data
    },
    createComment: async (data: CreateCommentRequest) => {
      await client.post(`/posts/${data.postID}/comment`, {"text": data.text})
    },
    getHistoricUserPosts: async (params: GetHistricUserPostsData) => {
      const resp = await client.get<APIPostData[]>("/profiles/posts", {params})
      return resp.data
    },
    getHomePageFeed: async (skip: number) => {
      const resp = await client.get<APIPostData[]>("/feed/home", {params: {skip}})
      return resp.data
    },
    getGroupsPageFeed: async (skip: number) => {
      const resp = await client.get<APIPostData[]>("/feed/groups", {params: {skip}})
      return resp.data
    },
    getPost: async (params: GetPostRequest) => {
      const resp = await client.get<APIPostData>("/posts", {params})
      return resp.data
    },
    deletePost: async (params: DeletePostRequest) => {
      await client.delete("/posts", {params})
    },
    likePost: async (data: LikePostRequest) => {
      await client.post("/posts/like", data)
    },
    sharePost: async (data: SharePostRequest) => {
      await client.post("/posts/share", data)
    },
    sendFriendRequest: async (data: FriendRequestData) => {
      await client.post(`/profiles/${data.userID}/request-friendship`)
    },
    acceptFriendRequest: async (data: FriendRequestData) => {
      await client.post(`/profiles/${data.userID}/accept-friendship`)
    },
  }
}

export const mainApiClient = createMainApiClient(mainApiAxiosClient)

export function getImageURLFromId(imageID?: string): string {
  if (imageID === undefined)
    return ""

  return "https://test-facebook-public.s3.ap-southeast-1.amazonaws.com/" + imageID
}