import axios, { AxiosInstance } from 'axios'

const domain = 'localhost:8081'

const chatAPIAxiosClient = axios.create({
  baseURL: `http://${domain}/chatapi/v1`,
  timeout: 5000,
  withCredentials: true
})

export const chatConnectEndpoint = `ws://${domain}/chatapi/v1/ws`

export type CreateChatRequest = {
  userID: string
}
export type CreateChatResponse = {
  chatID: string
}

export type ListChatsResponseItem = {
  chatID: string
  name: string
  lastActivityTime: number
  lastSeenActivityTime: number
  unseenMessageCount: number
}

const createChatAPIClient = (client: AxiosInstance) => {
  return {
    list: async () => {
      const res = await client.get<ListChatsResponseItem[]>("/chats/list")
      return res.data
    },
    create: async (data: CreateChatRequest) => {
      const res = await client.post<CreateChatResponse>("/chats/create", data)
      return res.data
    },
  }
}

export const chatApiClient = createChatAPIClient(chatAPIAxiosClient)
