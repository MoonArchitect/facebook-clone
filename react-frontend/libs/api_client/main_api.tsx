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
}

export type APIUserProfileResponse = {
  name:         string
  username:     string
  thumbnailURL: string
  bannerURL:    string
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
  }
}

export const assetsAPI = {
  uploadProfileCover: async (data: Blob) => {
    await assetsAPIClient.post("/profile/cover", data, {headers: {"Content-Type": data.type}})
  },
  uploadProfileThumbnail: async (data: Blob) => {
    await assetsAPIClient.post("/profile/thumbnail", data, {headers: {"Content-Type": data.type}})
  },
}
