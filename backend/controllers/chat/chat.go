package chat_controller

import (
	"context"
	"encoding/json"
	"fb-clone/libs/apierror"
	"fb-clone/libs/middleware"
	"fb-clone/services/chat"
	"fmt"
	"net/http"
	"slices"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-errors/errors"
	"github.com/lesismal/nbio/nbhttp"
	"github.com/lesismal/nbio/nbhttp/websocket"
)

// chat
//  - chatID
//  - admin
//  - name
//  - participants
//  - ordered message log

// message
//  - chatID
//  - userID
//  - date
//  - data/text

// API:
// initiate chat with a user
//  - check if chat already exists
// initiate group chat
// connect to chat
//   - allowed if user is in participants
// join chat, if has authorization from admin
// issue authorization link - allows a user with a link to join the chat
// invite user to the chat

// on chat connect
//  connection is upgraded to a websocket
//  check if chat session is already established
//   if not create one
//  subscribe to chat session (redis pub/sub)
//  clientMsg <- socket.Read()
//    redis.pub(msg)
//  groupMsg <- redis.sub()
//    socket.write(msg)

// TODO: have servers to handle all chat sessions, separate from general api
//  alg to choose the best server to handle chat session
//  or have inter-server communication to allow users to be connected to different servers

// Acess patterns:
// - get last X messages from chatID
// - get all chats of userID sorted by last activity
// -

// Update patterns
// - create chat
// - send message

// client A opens chat with user B -> connects to chat_api via websocket, chat session is created if needed, userID is subscribed to messages from that chat session
// A sends message -> msg is validated, written to db, event sent to chat session, anyone subscribed to it reads the event, sends data back to clients via websockets
// client B sees the message
// client C requests recent chats, sees new notification from client A

// Metadata:
//   chatID U#id1    haven't seen: 5 | lastMessageTimestamp:
//   chatID U#id2    haven't seen: 2 | lastMessageTimestamp:
//   chatID meta     CreatedAt: 161241212 | thumbnailID | Name
//

// Messages:
//  primary       sort								data
//  ChatID  Timestamp + msgID    msg: string | origin: userID | createdAt: timestamp

// Push
// 	      PR        SK
// Meta: UserID   ChatID              lastSeenMsg | newMsgCount | lastActivity
// Msgs: ChatID  Timestamp + msgID    msg: string | origin: userID | createdAt: timestamp
//
//  write msg: 1 msg write + usrCnt # of metadata updates
//  get chats' info: 1 read
//  read msg: 1 read

// Pull
// 	      PR        SK
// Meta: ChatID                       lastActivity | msgCount
// Usr:  UserID   ChatID              lastMsgCountSeen
// Msgs: ChatID  Timestamp + msgID    msg: string | origin: userID | createdAt: timestamp
//
//  write msg: 1 msg write + 1 metadata info update
//  get chats' info: 1 read + # of chats
//  read msg: 1 read

// chats X users, on average user will always have more chats than a chat will have users

// core # of states = # of chats
// 1 update to chat => 1 write
// # of notification states = # of chats per user = #users x #chats

// removing 1 write per msg read with this model:
//  last read message by user is not written to db directly everytime but instead is stored in RAM on server, and when session closes 1 write to db is performed

// or Timestamp, and if failed, check if failure due to duplicate key, then inc timestamp by 1ms and try again

// Meta: UserID     ChatID              lastSeenMsg | newMsgCount | lastActivity
// Msgs: ChatID  Timestamp + inc        msg: string | origin: userID | createdAt: timestamp

//
// ChatMetadata
//  - ChatID M:		    Name  LastActivityTime  MessageCount
//  - ChatID U:userID   LastSeenActivityTime    LastSeenMessageCount
//

// Modes of access
// - view: list chats -> get paginated list of user's chats{id, thumbnailURL, name, newMessageCount, lastActiveTime} sorted by DESC lastActiveTime
// - create chat: return chatID between users -> check if chat exists between this set of users if not create a new one
// - send message: write chat to db, update chat metadata in db, send notification to all other active users of that chat
//    - get all users of chat
//

// TODO:
// - websocket breaks when user logs out or logs in

type chatController struct {
	chatService       chat.ChatService
	websocketUpgrader *websocket.Upgrader
}

type ChatController interface {
	ListChats(ctx *gin.Context)
	CreateChat(ctx *gin.Context)
	Connect(ctx *gin.Context)
}

func NewChatController(chatService chat.ChatService) ChatController {
	upgrader := websocket.NewUpgrader()
	upgrader.EnableCompression(false)
	upgrader.OnOpen(onWebsocketOpen)
	upgrader.OnMessage(onWebsocketMessageHandler(chatService))
	upgrader.OnClose(onWebsocketCloseHandler(chatService))

	upgrader.CheckOrigin = CheckWebsocketOrigin
	upgrader.KeepaliveTime = 2 * time.Minute
	upgrader.BlockingModAsyncWrite = false // TODO: test this
	upgrader.BlockingModHandleRead = true  // creates read goroutine, need nbio poller to handle reads without goroutines for each conn
	upgrader.Engine.IOMod = nbhttp.IOModNonBlocking

	return &chatController{
		chatService:       chatService,
		websocketUpgrader: upgrader,
	}
}

type ListChatsResponseItem struct {
	ChatID               string `json:"chatID"`
	Name                 string `json:"name"`
	LastActivityTime     int64  `json:"lastActivityTime"`
	LastSeenActivityTime int64  `json:"lastSeenActivityTime"`
	UnseenMessageCount   int64  `json:"unseenMessageCount"`
}

func (c chatController) ListChats(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		apierror.HandleGinError(ctx, apierror.ErrorUnauthorizedAccess, nil)
		return
	}

	chats, err := c.chatService.ListUserChats(ctx, *uid)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	resp := make([]ListChatsResponseItem, 0, len(chats))
	for chatID, metadata := range chats {
		resp = append(resp, ListChatsResponseItem{
			ChatID:               chatID,
			Name:                 metadata.Name,
			LastActivityTime:     metadata.LastActivityTime,
			LastSeenActivityTime: metadata.LastSeenActivityTime,
			UnseenMessageCount:   metadata.MessageCount - metadata.LastSeenMessageCount,
		})
	}

	slices.SortFunc(resp, func(a, b ListChatsResponseItem) int {
		return int(b.LastActivityTime) - int(a.LastActivityTime)
	})

	ctx.JSON(http.StatusOK, resp)
}

type CreateChatRequest struct {
	UserID string `json:"userID" binding:"required"`
}

type CreateChatResponse struct {
	ChatID string `json:"chatID"`
}

func (c chatController) CreateChat(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		apierror.HandleGinError(ctx, apierror.ErrorUnauthorizedAccess, nil)
		return
	}

	var req CreateChatRequest
	err := ctx.BindJSON(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	// check that req.UserID exists and allows incoming chat requests

	chatID, err := c.chatService.CreateChat(ctx, *uid, req.UserID)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	resp := CreateChatResponse{
		ChatID: chatID,
	}
	ctx.JSON(http.StatusOK, resp)
}

func (c chatController) Connect(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		apierror.HandleGinError(ctx, apierror.ErrorUnauthorizedAccess, nil)
		return
	}

	conn, err := c.websocketUpgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorFailedWebsocketUpgrade, nil)
		return
	}

	conn.SetSession(WsConnectionSession{
		userID: *uid,
	})
}

func CheckWebsocketOrigin(r *http.Request) bool {
	if r.Header.Get("origin") == "http://localhost:3000" {
		return true
	}

	return false
}

type WsConnectionSession struct {
	userID string
}

// userID connects
//  add userID->conn

// userID sends Message: chatID, text ->
//  read db to check if user has permission
//  write message to db
//  go through all participants in the chat and try to notify each if conn exists

type WebsocketEventType string

const (
	PingEventType           WebsocketEventType = "ping"
	NewMessageEventType     WebsocketEventType = "new-message"
	ChatHistoryEventType    WebsocketEventType = "chat-history"
	MessageConfirmEventType WebsocketEventType = "message-confirmation"
)

type WebsocketMessage struct {
	Event   WebsocketEventType `json:"event"`
	Payload string             `json:"payload"`
}

type NewMessagePayload struct {
	ChatID         string `json:"chatID"`
	Msg            string `json:"msg"`
	ConfirmationID string `json:"confirmationID"`
}

type MessageConfirmationPayload struct {
	ChatID         string `json:"chatID"`
	ConfirmationID string `json:"confirmationID"`
	TimestampMicro int64  `json:"timestampMicro"`
}

type ChatHistoryPayload struct {
	ChatID               string `json:"chatID"`
	LastMessageTimestamp string `json:"lastMessageTimestamp"`
}

func onWebsocketMessageHandler(chatService chat.ChatService) func(c *websocket.Conn, messageType websocket.MessageType, data []byte) {
	return func(c *websocket.Conn, messageType websocket.MessageType, data []byte) {
		session := c.Session()

		userSess, ok := session.(WsConnectionSession)
		if !ok {
			fmt.Println("onWebsocketMessageHandler: userSess is not found: ", ok)
			return // error
		}

		var req WebsocketMessage
		err := json.Unmarshal(data, &req)
		if err != nil {
			fmt.Println("onWebsocketMessageHandler: Unmarshal err:", err)
			return // error
		}

		switch req.Event {
		case PingEventType:
			err := handlePingEvent(c)
			if err != nil {
				fmt.Println("onWebsocketMessageHandler: PingEventType error:", err)
			}

		case NewMessageEventType:
			err := handleNewMessageEvent(c, chatService, userSess, []byte(req.Payload))
			if err != nil {
				fmt.Println("onWebsocketMessageHandler: NewMessageEventType error:", err)
			}

		case ChatHistoryEventType:
			err := handleChatHistoryEvent(c, chatService, userSess, []byte(req.Payload))
			if err != nil {
				fmt.Println("onWebsocketMessageHandler: ChatHistoryEventType error:", err)
			}
		default:
			fmt.Println("onWebsocketMessageHandler: unknown event type")
		}
	}
}

func handlePingEvent(c *websocket.Conn) error {
	err := c.WriteMessage(websocket.TextMessage, []byte("received"))
	if err != nil {
		return err
	}
	return nil
}

type MessageConfirmationResponseMessage struct {
	Type    WebsocketEventType         `json:"type"`
	Payload MessageConfirmationPayload `json:"payload"`
}

func handleNewMessageEvent(c *websocket.Conn, chatService chat.ChatService, userSess WsConnectionSession, rawPayload []byte) error {
	var payload NewMessagePayload
	err := json.Unmarshal(rawPayload, &payload)
	if err != nil {
		return errors.Errorf("Unmarshal err: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second) // pull out this constant into config
	defer cancel()
	createdAtMicro, err := chatService.SendMessage(ctx, payload.ChatID, userSess.userID, payload.Msg)
	if err != nil {
		return errors.Errorf("SendMessage err: %w", err)
	}

	// return confirmation id with timestamp
	res := MessageConfirmationResponseMessage{
		Type: MessageConfirmEventType,
		Payload: MessageConfirmationPayload{
			ChatID:         payload.ChatID,
			ConfirmationID: payload.ConfirmationID,
			TimestampMicro: createdAtMicro,
		},
	}

	resRaw, err := json.Marshal(res)
	if err != nil {
		return errors.Errorf("failed to marshal confirmation response: %w", err)
	}

	err = c.WriteMessage(websocket.TextMessage, resRaw)
	if err != nil {
		return errors.Errorf("failed to send confirmation response: %w", err)
	}

	return nil
}

type ChatMessage struct {
	ChatID         string `json:"chatID"`
	TimestampMicro int64  `json:"timestampMicro"`
	Text           string `json:"text"`
	Origin         string `json:"origin"`
}

type ChatHistoryResponsePayload struct {
	ChatID   string        `json:"chatID"`
	Messages []ChatMessage `json:"messages"`
}

type ChatHistoryResponseMessage struct {
	Type    WebsocketEventType         `json:"type"`
	Payload ChatHistoryResponsePayload `json:"payload"`
}

func handleChatHistoryEvent(c *websocket.Conn, chatService chat.ChatService, userSess WsConnectionSession, rawPayload []byte) error {
	var payload ChatHistoryPayload
	err := json.Unmarshal(rawPayload, &payload)
	if err != nil {
		return errors.Errorf("Unmarshal err: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second) // pull out this constant into config
	defer cancel()
	history, err := chatService.GetChatHistory(ctx, payload.ChatID, userSess.userID, payload.LastMessageTimestamp)
	if err != nil {
		return errors.Errorf("SendMessage err: %w", err)
	}

	msgs := []ChatMessage{}
	for _, msg := range history {
		msgs = append(msgs, ChatMessage{
			ChatID:         msg.ChatID,
			TimestampMicro: msg.MessageTimestampMicro,
			Text:           msg.Message,
			Origin:         msg.Origin,
		})
	}

	res := ChatHistoryResponseMessage{
		Type: ChatHistoryEventType,
		Payload: ChatHistoryResponsePayload{
			ChatID:   payload.ChatID,
			Messages: msgs,
		},
	}

	raw, err := json.Marshal(res)
	if err != nil {
		return errors.Errorf("Failed to marshal return value: %w", err)
	}

	err = c.WriteMessage(websocket.TextMessage, raw)
	if err != nil {
		return errors.Errorf("Failed to write to ws conn: %w", err)
	}

	return nil
}

func onWebsocketOpen(c *websocket.Conn) {
	fmt.Println("OnOpen:", c.RemoteAddr().String())
}

func onWebsocketCloseHandler(chatService chat.ChatService) func(c *websocket.Conn, err error) {
	return func(c *websocket.Conn, err error) {
		fmt.Println("OnClose:", c.RemoteAddr().String(), err)

		session := c.Session()
		userSess, ok := session.(WsConnectionSession)
		if !ok {
			return // error
		}
		chatService.RemoveUserConnection(userSess.userID)
	}
}

// sub to ChatID
// pub to ChatID, each listener
