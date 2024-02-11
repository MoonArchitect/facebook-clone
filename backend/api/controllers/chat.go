package controllers

// TODO: https://sqlc.dev/

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

type chatController struct {
}

type ChatController interface {
}

func NewChatController() ChatController {
	return &chatController{}
}
