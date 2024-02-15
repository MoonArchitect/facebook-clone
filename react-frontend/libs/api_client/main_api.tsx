import axios from 'axios'

const mainAPIClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 1000,
  // headers: {'X-Custom-Header': 'foobar'}
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
