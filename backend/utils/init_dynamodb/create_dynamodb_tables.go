package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

//         PK         SK
// Meta: UserID     ChatID              lastSeenMsg | newMsgCount | lastActivity
// Msgs: ChatID  Timestamp + inc        msg: string | origin: userID | createdAt: timestamp

func main() {
	ctx := context.TODO()
	awsCfg, err := awsConfig.LoadDefaultConfig(
		ctx,
		awsConfig.WithRegion("ap-southeast-1"),
		awsConfig.WithEndpointResolverWithOptions(aws.EndpointResolverWithOptionsFunc(
			func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{URL: "http://localhost:8000"}, nil
			}),
		),
	)
	if err != nil {
		panic(err)
	}

	dynamodbClient := dynamodb.NewFromConfig(awsCfg)

	metadataTable := struct {
		name string
		pk   string
		sk   string
	}{
		name: "ChatMetadata",
		pk:   "ChatID",
		sk:   "SortKey",
	}

	_, err = dynamodbClient.DeleteTable(ctx, &dynamodb.DeleteTableInput{
		TableName: &metadataTable.name,
	})
	if err != nil {
		fmt.Println("Failed to delete metadata table:", err)
	}

	out, err := dynamodbClient.CreateTable(ctx, &dynamodb.CreateTableInput{
		TableName: &metadataTable.name,
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: &metadataTable.pk,
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: &metadataTable.sk,
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: &metadataTable.pk,
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: &metadataTable.sk,
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModeProvisioned,
		ProvisionedThroughput: &types.ProvisionedThroughput{
			ReadCapacityUnits:  aws.Int64(1),
			WriteCapacityUnits: aws.Int64(1),
		},
		TableClass: types.TableClassStandard,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("ChatMetadataIndex_PK.SortKey_SK.ChatID"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: &metadataTable.sk,
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: &metadataTable.pk,
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					NonKeyAttributes: []string{"LastSeenActivityTime", "LastSeenMessageCount"},
					ProjectionType:   types.ProjectionTypeInclude,
				},
				ProvisionedThroughput: &types.ProvisionedThroughput{
					ReadCapacityUnits:  aws.Int64(1),
					WriteCapacityUnits: aws.Int64(1),
				},
			},
		},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("Created metadata table, result:", out.ResultMetadata, "; desc: ", out.TableDescription)

	msgTable := struct {
		name string
		pk   string
		sk   string
	}{
		name: "ChatMessages",
		pk:   "ChatID",
		sk:   "MessageTimestampMicro",
	}

	_, err = dynamodbClient.DeleteTable(ctx, &dynamodb.DeleteTableInput{
		TableName: &msgTable.name,
	})
	if err != nil {
		fmt.Println("Failed to delete messages table:", err)
	}

	out, err = dynamodbClient.CreateTable(ctx, &dynamodb.CreateTableInput{
		TableName: &msgTable.name,
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: &msgTable.pk,
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: &msgTable.sk,
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: &msgTable.pk,
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: &msgTable.sk,
				AttributeType: types.ScalarAttributeTypeN,
			},
		},
		BillingMode: types.BillingModeProvisioned,
		ProvisionedThroughput: &types.ProvisionedThroughput{
			ReadCapacityUnits:  aws.Int64(1),
			WriteCapacityUnits: aws.Int64(1),
		},
		TableClass: types.TableClassStandard,
	})

	if err != nil {
		panic(err)
	}

	fmt.Println("Created message table, result:", out.ResultMetadata, "; desc: ", out.TableDescription)

}
