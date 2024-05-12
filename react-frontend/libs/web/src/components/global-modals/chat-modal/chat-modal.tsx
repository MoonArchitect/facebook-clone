"use client"

import clsx from "clsx"

import { ListChatsResponseItem } from "@facebook-clone/api_client/src"
import { ReactComponent as ArrowIcon } from "@facebook-clone/assets/icons/arrow.svg"
import { useListChatsQuery } from "../../../query-hooks/chat-query-hooks"
import {
  useChatMessages,
  useChatWebsocketConnection,
  useRequestChatHistory,
  useSendChatMessage
} from "../../../query-hooks/chat-websocket-hooks"
import { getDateString } from "../../utils/date"

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "../../utils/session-context"
import styles from "./chat-modal.module.scss"

export type ChatModalProps = {
  isChatOpen: boolean
  close: () => void
  open: () => void
}

export const ChatModal = (props: ChatModalProps) => {
  const {isChatOpen, close, open} = props
  const ws = useChatWebsocketConnection()
  const {data} = useListChatsQuery()
  const {mutate: requestChatHistory} = useRequestChatHistory(ws)
  const [chatMetadata, setChatMetadata] = useState<ListChatsResponseItem | undefined>(undefined)

  useEffect(() => {
    if(chatMetadata) requestChatHistory(chatMetadata?.chatID)
  }, [chatMetadata, requestChatHistory])

  // loading screen on ws === undefined

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader} onClick={() => isChatOpen ? close() : open()}>
        Chats
      </div>
      <div className={clsx(styles.chatContentsContainer, isChatOpen && styles.chatOpen)}>
        <div className={clsx(styles.chatBodyContainer, chatMetadata && styles.showChatBody)}>
          {chatMetadata && ws && <ChatBody metadata={chatMetadata} goBack={() => setChatMetadata(undefined)} ws={ws} />}
        </div>
        <div className={clsx(styles.chatList, chatMetadata && styles.hideChatList)}>
          {data && data.map(
            (metadata) =>
              <ChatTile
                key={metadata.chatID}
                metadata={metadata}
                onClick={() => setChatMetadata(metadata)}
              />
          )}
        </div>
      </div>
    </div>
  )
}

type ChatTileProps = {
  metadata: ListChatsResponseItem
  onClick: () => void
}

const ChatTile = (props: ChatTileProps) => {
  const {metadata, onClick} = props

  return (
    <div className={styles.chatTileContainer} onClick={onClick}>
      <div>{metadata.name}</div>
      <div>{getDateString(metadata.lastActivityTime / 1000000)}</div>
      <div>{metadata.unseenMessageCount}</div>
    </div>
  )
}

type ChatBodyProps = {
  metadata: ListChatsResponseItem
  ws: WebSocket
  goBack: () => void
}

const ChatBody = (props: ChatBodyProps) => {
  const {metadata, ws, goBack} = props
  const {data} = useChatMessages(metadata.chatID)
  const chatBottomAnchor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatBottomAnchor.current?.scrollIntoView({behavior: "instant"})
  }, [data])
  useEffect(() => console.log("data: ", data), [data])

  return (
    <div className={styles.chatBody}>
      <button onClick={goBack}>Go Back</button>
      <div>{metadata.name}</div>
      <div>{getDateString(metadata.lastActivityTime / 1000000)}</div>
      <div>{metadata.unseenMessageCount}</div>
      <div className={styles.chatMessagesContainer}>
        {data?.messages && data.messages.map((chatMessage) =>
          <div key={chatMessage.timestampMicro} className={styles.chatBubble}>
            {chatMessage.text} | {chatMessage.status} | {getDateString(chatMessage.timestampMicro / 1000000)}
          </div>
        ).reverse()}
        <div ref={chatBottomAnchor} className={styles.scrollAnchor}></div>
      </div>
      <MessageInputSection chatID={metadata.chatID} ws={ws} />
    </div>
  )
}

type MessageInputSection = {
  chatID: string
  ws: WebSocket
}

const MessageInputSection = (props: MessageInputSection) => {
  const {ws, chatID} = props
  const [isEmptyText, setIsEmptyText] = useState(true)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const {userData} = useSession()
  // TODO: create useSession hook that guruantees userData is defined
  const sendMessage = useSendChatMessage(ws, userData?.id ?? "", chatID)

  const editableDivRef = useRef<HTMLDivElement>(null)

  const updateIsEmptyText = useCallback((e: FormEvent<HTMLDivElement>) => {
    if (e.currentTarget.innerText === "" || e.currentTarget.innerText === "\n") {
      setIsEmptyText(true)
    } else if (isEmptyText) {
      setIsEmptyText(false)
    }
  }, [isEmptyText, setIsEmptyText])

  const createCommentCallback = useCallback(() => {
    // if (isPending) {
    //   console.warn("pending request")
    //   return
    // }

    if (editableDivRef.current === null || editableDivRef.current.innerText.trim() === "") {
      console.error("message is empty") // TODO: client side validation, error if attempted.
      return
    }

    sendMessage(editableDivRef.current.innerText.trim(), () => {
      if (editableDivRef.current) {
        editableDivRef.current.innerText = ""
        setIsEmptyText(true)
      }
    })
  }, [sendMessage])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      createCommentCallback()
    }
  }

  return (
    <div className={styles.createComment}>
      {/* <div className={clsx(styles.loadingCover, isPending && styles.loading)} /> */}
      <div
        className={clsx(styles.inputContainer, isInputFocused && styles.expandedInput)}
        onFocus={() => setIsInputFocused(true)}
      >
        {isEmptyText && <div className={styles.inputPlaceholder}>Aa</div>}
        <div
          ref={editableDivRef}
          className={styles.input}
          contentEditable
          onInput={updateIsEmptyText}
          onKeyDown={handleKeyDown}></div>
        <ArrowIcon
          className={clsx(styles.arrowIcon, isInputFocused && styles.visible)}
          onClick={createCommentCallback} />
      </div>
    </div>
  )
}
