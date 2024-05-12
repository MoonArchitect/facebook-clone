package repositories

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/go-errors/errors"
)

type ChatMessage struct {
	ChatID                string `dynamodbav:"ChatID"`
	MessageTimestampMicro int64  `dynamodbav:"MessageTimestampMicro"`
	Message               string `dynamodbav:"Message"`
	Origin                string `dynamodbav:"Origin"`
}

type chatMessagesRepository struct {
	db *dynamodb.Client
}

type ChatMessagesRepository interface {
	CreateMessage(ctx context.Context, chatID, userID, msg string, createdAtMicro int64) error
	GetMessages(ctx context.Context, chatID string, lastMessageTimestamp string) ([]ChatMessage, error)
}

func NewChatMessagesRepository(db *dynamodb.Client) ChatMessagesRepository {
	return &chatMessagesRepository{
		db,
	}
}

func (r chatMessagesRepository) CreateMessage(ctx context.Context, chatID, userID, msg string, createdAtMicro int64) error {
	item, err := attributevalue.MarshalMap(ChatMessage{
		ChatID:                chatID,
		MessageTimestampMicro: createdAtMicro,
		Message:               msg,
		Origin:                userID,
	})
	if err != nil {
		return errors.Errorf("failed to marshal item: %w", err)
	}

	_, err = r.db.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(ChatMessagesTable),
		Item:      item,
	})

	if err != nil {
		return errors.Errorf("could not create chat message: %w", err)
	}

	return nil
}

func (r chatMessagesRepository) GetMessages(ctx context.Context, chatID string, lastMessageTimestamp string) ([]ChatMessage, error) {
	keyCondition := expression.Key("ChatID").Equal(expression.Value(chatID))
	if lastMessageTimestamp != "" {
		keyCondition = keyCondition.And(expression.Key("MessageTimestampMicro").LessThan(expression.Value(lastMessageTimestamp)))
	}

	expr, err := expression.NewBuilder().WithKeyCondition(keyCondition).Build()
	if err != nil {
		return nil, errors.Errorf("failed to build dynamodb expression: %w", err)
	}

	out, err := r.db.Query(ctx, &dynamodb.QueryInput{
		TableName:                 aws.String(ChatMessagesTable),
		KeyConditionExpression:    expr.KeyCondition(),
		ProjectionExpression:      expr.Projection(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		Limit:                     aws.Int32(20),
		ScanIndexForward:          aws.Bool(false),
		// ExclusiveStartKey: , // TODO: test using this vs keyConditionExpression
	})

	if err != nil {
		return nil, errors.Errorf("could not query chat messages: %w", err)
	}

	var records []ChatMessage
	err = attributevalue.UnmarshalListOfMaps(out.Items, &records)
	if err != nil {
		return nil, errors.Errorf("failed to unmarshal chat messages: %w", err)
	}

	return records, nil
}
