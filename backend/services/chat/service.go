package chat

import (
	"context"
	"encoding/json"
	"fb-clone/repositories"
	"fmt"
	"time"

	"github.com/cornelk/hashmap"
	"github.com/go-errors/errors"
	"github.com/lesismal/nbio/nbhttp/websocket"
)

type chatService struct {
	chatMetadataRepository repositories.ChatMetadataRepository
	chatMessagesRepository repositories.ChatMessagesRepository
	connections            *hashmap.Map[string, *websocket.Conn]
}

type ChatService interface {
	ListUserChats(ctx context.Context, userID string) (map[string]repositories.UserChatMetadata, error)
	CreateChat(ctx context.Context, reqUID, otherUID string) (string, error)

	AddUserConnection(userID string, conn *websocket.Conn)
	RemoveUserConnection(userID string)
	SendMessage(ctx context.Context, chatID, userID, msg string) (int64, error)
	GetChatHistory(ctx context.Context, chatID, userID, lastMessageTimestamp string) ([]repositories.ChatMessage, error)
}

func NewChatService(
	chatMetadataRepository repositories.ChatMetadataRepository,
	chatMessagesRepository repositories.ChatMessagesRepository,
) ChatService {
	connections := hashmap.New[string, *websocket.Conn]()

	return &chatService{
		chatMetadataRepository: chatMetadataRepository,
		chatMessagesRepository: chatMessagesRepository,
		connections:            connections,
	}
}

func (s chatService) ListUserChats(ctx context.Context, userID string) (map[string]repositories.UserChatMetadata, error) {
	return s.chatMetadataRepository.GetUserChats(ctx, userID)
}

func (s chatService) CreateChat(ctx context.Context, reqUID, otherUID string) (string, error) {
	return s.chatMetadataRepository.CreateChat(ctx, []string{reqUID, otherUID})
}

func (s chatService) GetChatHistory(ctx context.Context, chatID, userID string, lastMessageTimestamp string) ([]repositories.ChatMessage, error) {
	// verify userID permissions in chatID
	users, err := s.chatMetadataRepository.GetChatUsers(ctx, chatID)
	if err != nil {
		return nil, errors.Errorf("failed to get chat users: %w", err)
	}

	if _, ok := users[userID]; !ok {
		return nil, errors.Errorf("user %s is not in chat %s", userID, chatID)
	}

	return s.chatMessagesRepository.GetMessages(ctx, chatID, lastMessageTimestamp)
}

func (s chatService) AddUserConnection(userID string, conn *websocket.Conn) {
	_, ok := s.connections.Get(userID)
	if !ok {
		_ = s.connections.Insert(userID, conn)
		return
	}

	_ = s.connections.Del(userID)
	_ = s.connections.Insert(userID, conn)
}

func (s chatService) RemoveUserConnection(userID string) {
	_ = s.connections.Del(userID)
}

func (s chatService) SendMessage(ctx context.Context, chatID, userID, msg string) (int64, error) {
	// verify userID permissions in chatID
	users, err := s.chatMetadataRepository.GetChatUsers(ctx, chatID)
	if err != nil {
		return 0, errors.Errorf("failed to get chat users: %w", err)
	}

	if _, ok := users[userID]; !ok {
		return 0, errors.Errorf("user %s is not in chat %s", userID, chatID)
	}

	// write msg to chatID in dynamodb
	createdAtMicro := time.Now().UnixMicro()
	err = s.chatMessagesRepository.CreateMessage(ctx, chatID, userID, msg, createdAtMicro)
	if err != nil {
		return 0, errors.Errorf("failed to write chat message: %w", err)
	}

	// update chat metadata
	err = s.chatMetadataRepository.UpdateChatMetadata(ctx, chatID, createdAtMicro)
	if err != nil {
		return 0, errors.Errorf("failed to update chat metadata: %w", err)
	}

	// notify other users
	for recvUID := range users {
		recvConn, ok := s.connections.Get(recvUID)
		if ok {
			err = sendNewChatMessageToClient(recvConn, chatID, userID, msg, createdAtMicro)
			if err != nil {
				fmt.Println("Failed to write to websocket: ", err)
				// log
			}
		}
	}

	return createdAtMicro, nil
}

type NewChatMessage struct {
	ChatID         string `json:"chatID"`
	FromUserID     string `json:"fromUserID"`
	Msg            string `json:"msg"`
	TimestampMicro int64  `json:"timestampMicro"`
}

func sendNewChatMessageToClient(conn *websocket.Conn, chatID, userID, msg string, timestampMicro int64) error {
	resp := NewChatMessage{
		ChatID:         chatID,
		FromUserID:     userID,
		Msg:            msg,
		TimestampMicro: timestampMicro,
	}

	respRaw, err := json.Marshal(resp)
	if err != nil {
		return errors.Errorf("failed to marshal response: %w", err)
	}

	err = conn.WriteMessage(websocket.BinaryMessage, respRaw)
	if err != nil {
		return errors.Errorf("failed to send message: %w", err)
	}

	return nil
}
