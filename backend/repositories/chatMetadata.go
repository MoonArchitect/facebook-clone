package repositories

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/go-errors/errors"
	"github.com/google/uuid"
)

const (
	ChatMetadataTable              = "ChatMetadata"
	ChatMessagesTable              = "ChatMessages"
	ChatMetadataTableSwapPKSKIndex = "ChatMetadataIndex_PK.SortKey_SK.ChatID"
)

type ChatMetadata struct {
	ChatID           string // PK
	MetadataKey      string // SK: 'M' for metadata
	Name             string
	LastActivityTime int64
	MessageCount     int64
}

type ChatUserMetadata struct {
	ChatID               string // PK
	UserID               string // SK: 'U:userid' for users
	LastSeenActivityTime int64
	LastSeenMessageCount int64
}

type chatMetadataRepository struct {
	db *dynamodb.Client
}

type ChatMetadataRepository interface {
	CreateChat(ctx context.Context, users []string) (string, error)
	GetUserChats(ctx context.Context, userID string) (map[string]UserChatMetadata, error)
	GetChatUsers(ctx context.Context, chatID string) (map[string]struct{}, error)
	UpdateChatMetadata(ctx context.Context, chatID string, lastActivityTime int64) error
}

func NewChatMetadataRepository(db *dynamodb.Client) ChatMetadataRepository {
	return &chatMetadataRepository{
		db,
	}
}

type UserChatMetadata struct {
	ChatID               string
	LastSeenMessageCount int64
	LastSeenActivityTime int64
	Name                 string
	MessageCount         int64
	LastActivityTime     int64
}

func (r chatMetadataRepository) GetUserChats(ctx context.Context, userID string) (map[string]UserChatMetadata, error) {
	out, err := r.db.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String(ChatMetadataTable),
		IndexName:              aws.String(ChatMetadataTableSwapPKSKIndex),
		KeyConditionExpression: aws.String("SortKey = :userid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":userid": &types.AttributeValueMemberS{
				Value: fmt.Sprintf("U:%s", userID),
			},
		},
		ProjectionExpression:   aws.String("ChatID,LastSeenMessageCount,LastSeenActivityTime"),
		ReturnConsumedCapacity: types.ReturnConsumedCapacityTotal,
	})
	if err != nil {
		return nil, errors.Errorf("failed to get user chats: %w", err)
	}

	// fmt.Println("GetUserChats consumed capcity: ")
	// fmt.Println("total: ", *out.ConsumedCapacity.CapacityUnits)
	// fmt.Println("global secondary indexes: ", out.ConsumedCapacity.GlobalSecondaryIndexes)
	// fmt.Println("read: ", out.ConsumedCapacity.ReadCapacityUnits)

	res := map[string]UserChatMetadata{}
	for _, item := range out.Items {
		fmt.Println("Item:", item)
		attribute, ok1 := item["ChatID"]
		chatID, ok2 := attribute.(*types.AttributeValueMemberS)
		if !ok1 || !ok2 {
			fmt.Println("ERROR: chatID as a string attribute was not found:", ok1, ok2)
			continue
		}

		attribute, ok1 = item["LastSeenMessageCount"]
		lastSeenMessageCountStr, ok2 := attribute.(*types.AttributeValueMemberN)
		if !ok1 || !ok2 {
			fmt.Println("ERROR: LastSeenMessageCount as a number attribute was not found:", ok1, ok2)
			continue
		}

		attribute, ok1 = item["LastSeenActivityTime"]
		lastSeenActivityTimeStr, ok2 := attribute.(*types.AttributeValueMemberN)
		if !ok1 || !ok2 {
			fmt.Println("ERROR: LastSeenActivityTime as a number attribute was not found:", ok1, ok2)
			continue
		}

		lastSeenMessageCount, err := strconv.ParseInt(lastSeenMessageCountStr.Value, 10, 64)
		if err != nil {
			fmt.Println("Error converting string to int64: ", err)
		}
		lastSeenActivityTime, err := strconv.ParseInt(lastSeenActivityTimeStr.Value, 10, 64)
		if err != nil {
			fmt.Println("Error converting string to int64: ", err)
		}

		res[chatID.Value] = UserChatMetadata{
			ChatID:               chatID.Value,
			LastSeenMessageCount: lastSeenMessageCount,
			LastSeenActivityTime: lastSeenActivityTime,
		}
	}

	if len(res) == 0 {
		return res, nil
	}

	keys := []map[string]types.AttributeValue{}
	for chatID := range res {
		keys = append(keys, map[string]types.AttributeValue{
			"ChatID": &types.AttributeValueMemberS{
				Value: chatID,
			},
			"SortKey": &types.AttributeValueMemberS{
				Value: "M:",
			},
		})
	}
	// fmt.Println("keys: ", keys)

	batchOut, err := r.db.BatchGetItem(ctx, &dynamodb.BatchGetItemInput{
		RequestItems: map[string]types.KeysAndAttributes{
			ChatMetadataTable: {
				Keys:                 keys,
				ProjectionExpression: aws.String("ChatID,#name,LastActivityTime,MessageCount"),
				ExpressionAttributeNames: map[string]string{
					"#name": *aws.String("Name"),
				},
			},
		},
		ReturnConsumedCapacity: types.ReturnConsumedCapacityTotal,
	})
	if err != nil {
		return nil, errors.Errorf("failed to batch get chats metadata: %w", err)
	}

	// fmt.Println("BatchGetItem consumed capcity: ", batchOut.ConsumedCapacity)
	if batchOut.ConsumedCapacity != nil {
		for _, v := range batchOut.ConsumedCapacity {
			if v.CapacityUnits != nil {
				fmt.Println("total: ", *v.CapacityUnits)
			}
			if v.ReadCapacityUnits != nil {
				fmt.Println("read total: ", *v.ReadCapacityUnits)
			}
		}
	}

	resp, ok := batchOut.Responses[ChatMetadataTable]
	if !ok {
		return nil, errors.Errorf("could not get metadata for each room")
	}

	for _, item := range resp {
		attribute, ok1 := item["Name"]
		name, ok2 := attribute.(*types.AttributeValueMemberS)
		if !ok1 || !ok2 {
			fmt.Println("ERROR: Name as a string attribute was not found:", ok1, ok2)
			continue
		}

		attribute, ok1 = item["ChatID"]
		chatID, ok2 := attribute.(*types.AttributeValueMemberS)
		if !ok1 || !ok2 {
			fmt.Println("ERROR: ChatID as a string attribute was not found:", ok1, ok2)
			continue
		}

		attribute, ok1 = item["LastActivityTime"]
		lastActivityTimeStr, ok2 := attribute.(*types.AttributeValueMemberN)
		if !ok1 || !ok2 {
			fmt.Println("ERROR: LastActivityTime as a number attribute was not found:", ok1, ok2)
			continue
		}

		attribute, ok1 = item["MessageCount"]
		messageCountStr, ok2 := attribute.(*types.AttributeValueMemberN)
		if !ok1 || !ok2 {
			fmt.Println("ERROR: MessageCount as a number attribute was not found:", ok1, ok2)
			continue
		}

		messageCount, err := strconv.ParseInt(messageCountStr.Value, 10, 64)
		if err != nil {
			fmt.Println("Error converting string to int64: ", err)
		}
		lastActivityTime, err := strconv.ParseInt(lastActivityTimeStr.Value, 10, 64)
		if err != nil {
			fmt.Println("Error converting string to int64: ", err)
		}

		val, ok := res[chatID.Value]
		if !ok {
			fmt.Println("ERROR: ChatID was not found in user's chats: ", chatID.Value)
			continue
		}

		val.Name = name.Value
		val.LastActivityTime = lastActivityTime
		val.MessageCount = messageCount
		res[chatID.Value] = val
	}

	return res, nil
}

func (r chatMetadataRepository) CreateChat(ctx context.Context, userIDs []string) (string, error) {
	chatID, err := uuid.NewRandom()
	if err != nil {
		return "", errors.Errorf("failed to create chat uuid: %w", err)
	}

	createdAt := time.Now().UnixMicro()

	_, err = r.db.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(ChatMetadataTable),
		Item: map[string]types.AttributeValue{
			"ChatID": &types.AttributeValueMemberS{
				Value: chatID.String(),
			},
			"SortKey": &types.AttributeValueMemberS{
				Value: "M:",
			},
			"Name": &types.AttributeValueMemberS{
				Value: "name: " + chatID.String(),
			},
			"LastActivityTime": &types.AttributeValueMemberN{
				Value: fmt.Sprint(createdAt),
			},
			"MessageCount": &types.AttributeValueMemberN{
				Value: "0",
			},
		},
	})
	if err != nil {
		return "", errors.Errorf("failed to create new chat: %w", err)
	}

	// TODO: do batch putitem
	for _, uid := range userIDs {
		_, err = r.db.PutItem(ctx, &dynamodb.PutItemInput{
			TableName: aws.String(ChatMetadataTable),
			Item: map[string]types.AttributeValue{
				"ChatID": &types.AttributeValueMemberS{
					Value: chatID.String(),
				},
				"SortKey": &types.AttributeValueMemberS{
					Value: fmt.Sprintf("U:%s", uid),
				},
				"LastSeenActivityTime": &types.AttributeValueMemberN{
					Value: fmt.Sprint(createdAt),
				},
				"LastSeenMessageCount": &types.AttributeValueMemberN{
					Value: "0",
				},
			},
		})
		if err != nil {
			return "", errors.Errorf("failed to create chat user doc: %w", err)
		}
	}

	return chatID.String(), nil
}

func (r chatMetadataRepository) UpdateChatMetadata(ctx context.Context, chatID string, lastActivityTime int64) error {
	// inc messageCount
	_, err := r.db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(ChatMetadataTable),
		Key: map[string]types.AttributeValue{
			"ChatID": &types.AttributeValueMemberS{
				Value: chatID,
			},
			"SortKey": &types.AttributeValueMemberS{
				Value: "M:",
			},
		},
		AttributeUpdates: map[string]types.AttributeValueUpdate{
			"MessageCount": {
				Action: types.AttributeActionAdd,
				Value: &types.AttributeValueMemberN{
					Value: "1",
				},
			},
			"LastActivityTime": {
				Action: types.AttributeActionPut,
				Value: &types.AttributeValueMemberN{
					Value: fmt.Sprint(lastActivityTime),
				},
			},
		},
	})
	if err != nil {
		return errors.Errorf("failed to update chat metadata: %w", err)
	}

	return nil
}

func (r chatMetadataRepository) GetChatUsers(ctx context.Context, chatID string) (map[string]struct{}, error) {
	out, err := r.db.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String(ChatMetadataTable),
		KeyConditionExpression: aws.String("ChatID = :chatID AND begins_with(SortKey, :sortKey)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":chatID":  &types.AttributeValueMemberS{Value: chatID},
			":sortKey": &types.AttributeValueMemberS{Value: "U:"},
		},
	})
	if err != nil {
		return nil, errors.Errorf("could not query chat users: %w", err)
	}
	users := map[string]struct{}{}
	for _, item := range out.Items {
		sortKey, ok := item["SortKey"]
		if !ok {
			continue
		}

		key, ok := sortKey.(*types.AttributeValueMemberS)
		if !ok {
			continue
		}

		uid, found := strings.CutPrefix(key.Value, "U:")
		if !found {
			continue
		}

		users[uid] = struct{}{}
	}

	return users, nil
}
