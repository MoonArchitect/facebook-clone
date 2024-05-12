import { chatConnectEndpoint } from "@facebook-clone/api_client/src"
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"


type ChatData = {
  messages: ChatMessage[]
}

type ChatMessage = {
  timestampMicro: number
  chatID: string
  text: string
  confirmationID: string
  origin: string
  status: ChatMessageEnum
}

enum ChatMessageEnum {
  Pending = 0,
  Confirmed = 1,
  Read = 2
}

type NewMessageType = {
  type: "message"
  payload: ChatMessage
}

type ChatHistoryType = {
  type: "chat-history"
  payload: {
    chatID: string
    messages: ChatMessage[]
  }
}

type NewNotificationType = {
  type: "message_notification"
  payload: {
      chatID: string
  }
}

type MessageConfirmationType = {
  type: "message-confirmation"
  payload: {
    confirmationID: string
    chatID: string
    timestampMicro: number
  }
}

type EventType = NewNotificationType | NewMessageType | ChatHistoryType | MessageConfirmationType

type WebsocketMessage = {
	event: string
	payload: string
}

type NewMessagePayload = {
	ChatID: string
	Msg: string
	ConfirmationID: string
}

type ChatHistoryPayload = {
	ChatID: string
	LastMessageTimestamp: string
}


const queryKeys = {
  chatDataKey: (id: string) => ["chat-data", id],
  chatWebsocketKey: ["chat-websocket"],
}

export const useChatMessages = (chatID: string) => {
  return useQuery<ChatData>({
    queryKey: queryKeys.chatDataKey(chatID),
    staleTime: Infinity
  })
}

// Ugly af, refactor all this WS management

export const useChatWebsocketConnection = () => {
  const queryClient = useQueryClient()
  console.log("using useChatWebsocketConnection")

  const query = useQuery({
    queryKey: queryKeys.chatWebsocketKey,
    queryFn: () => createNewChatWebsocket(queryClient),
    structuralSharing: (oldData, newData) => {
      if (newData instanceof WebSocket && oldData instanceof WebSocket){
        if (oldData === undefined)
          return newData

        console.log("Closing old websocket connection")
        oldData.close()
        return newData
      }

      return newData
    },
    retry: false,
    staleTime: Infinity,
  })

  return query.data
}

export const useRequestChatHistory = (ws?: WebSocket) => {
  return useMutation({
    mutationFn: (chatID: string) => getChatHistory(ws, chatID)
  })
}

export const useSendChatMessage = (ws: WebSocket, userID: string, chatID: string) => {
  const {mutate: sendMessage} = useSendChatMessageMutation(ws, userID, chatID)
  return useCallback((message: string, onSuccess: () => void) => {
    const confirmationID = crypto.randomUUID().toString()
    sendMessage({confirmationID, message}, {onSuccess: onSuccess})
  }, [sendMessage])
}

export const useSendChatMessageMutation = (ws: WebSocket, userID: string, chatID: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {message: string, confirmationID: string}) => {
      return sendChatMessage(ws, chatID, payload.message, payload.confirmationID)
    },
    onMutate: (payload) => {
      queryClient.setQueryData<ChatData>(queryKeys.chatDataKey(chatID), (oldValue) => {
        const newMessage: ChatMessage = {
          chatID: chatID,
          origin: userID,
          text: payload.message,
          confirmationID: payload.confirmationID,
          timestampMicro: Date.now() * 1000,
          status: ChatMessageEnum.Pending
        }
        if (oldValue?.messages)
          return {messages: [newMessage, ...oldValue.messages]}

        return {messages: [newMessage]}
      })
    }
  })
}

const onMessageEventHandler = (queryClient: QueryClient) => (event: MessageEvent) => {
  if (event.data === "received") {
    return
  }

  console.info("ws: onmessage", event.data)
  const data = JSON.parse(event.data) as EventType

  // TODO: validate json or use different format
  if (data.type === "message") {
    queryClient.setQueryData<ChatData>(queryKeys.chatDataKey(data.payload.chatID), (oldValue) => {
      if (oldValue?.messages)
        return {messages: [data.payload, ...oldValue.messages]}

      return {messages: [data.payload]}
    })
  } else if (data.type === "chat-history") {
    data.payload.messages.forEach((v, i, arr) => arr[i].status = ChatMessageEnum.Confirmed)
    queryClient.setQueryData<ChatData>(queryKeys.chatDataKey(data.payload.chatID), () => {
      return {messages: data.payload.messages}
    })
  } else if (data.type === "message-confirmation") {
    queryClient.setQueryData<ChatData>(queryKeys.chatDataKey(data.payload.chatID), (prev) => {
      if (prev === undefined) return undefined

      const msgs = [...prev.messages]
      const i = msgs.findIndex((val) => val.confirmationID === data.payload.confirmationID)
      if (i === -1) return undefined

      msgs[i] = {
        chatID: prev.messages[i].chatID,
        confirmationID: prev.messages[i].confirmationID,
        origin: prev.messages[i].origin,
        status: ChatMessageEnum.Confirmed,
        text: prev.messages[i].text,
        timestampMicro: prev.messages[i].timestampMicro,
      }
      console.log("asdasdasdasd", msgs === prev.messages)
      return {messages: msgs}
    })
  }
}

const createNewChatWebsocket = async (queryClient: QueryClient) => {
  console.info("creating new websocket")
  let timerID: NodeJS.Timeout
  const ws = new WebSocket(chatConnectEndpoint)

  ws.onerror = (ev) => {
    console.error("ws error:", ev)
  }

  ws.onclose = (ev) => {
    console.info("ws close:", ev)
    setTimeout(
      () => queryClient.invalidateQueries({exact: true, queryKey: queryKeys.chatWebsocketKey}),
      1000
    )
    clearTimeout(timerID)
  }

  ws.onopen = () => {
    console.info('ws: connected')
    timerID = setInterval(() => {
      ws.send("{\"event\": \"ping\"}")
    }, 10000)
  }

  ws.onmessage = onMessageEventHandler(queryClient)

  return ws
}

const getChatHistory = async (ws: WebSocket | undefined, chatID: string) => {
  if (ws === undefined) {
    console.log("requesting chat history: ", chatID)
    return
  }

  console.log("requesting chat history: ", chatID)

  const payload: ChatHistoryPayload = {
    ChatID: chatID,
    LastMessageTimestamp: ""
  }

  const data: WebsocketMessage = {
    event: "chat-history",
    payload: JSON.stringify(payload)
  }

  ws.send(JSON.stringify(data))
}

const sendChatMessage = async (ws: WebSocket, chatID: string, message: string, confirmationID: string) => {
  console.log("sending chat message: ", chatID, " : ", message, " : ", confirmationID)

  const payload: NewMessagePayload = {
    ChatID: chatID,
    Msg: message,
    ConfirmationID: confirmationID,
  }

  const data: WebsocketMessage = {
    event: "new-message",
    payload: JSON.stringify(payload)
  }

  ws.send(JSON.stringify(data))
}
