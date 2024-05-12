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

	scan, err := dynamodbClient.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String("ChatMetadata"),
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("ChatMetadata: ")
	printItems(scan.Items)

	scan, err = dynamodbClient.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String("ChatMessages"),
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("ChatMessages: ")
	printItems(scan.Items)
}

func printItems(items []map[string]types.AttributeValue) {
	for _, item := range items {
		fmt.Print("item: ")
		for key, val := range item {
			fmt.Print(key, ": ")
			v, ok := val.(*types.AttributeValueMemberS)
			if ok {
				fmt.Print(v.Value)
				fmt.Print("| ")
				continue
			}
			v2, ok := val.(*types.AttributeValueMemberN)
			if ok {
				fmt.Print(v2.Value)
				fmt.Print("| ")
				continue
			}
			fmt.Print("UNDEFINED;  ")
		}
		fmt.Println()
	}
}
