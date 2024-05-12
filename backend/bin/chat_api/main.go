package main

import (
	"context"
	chat_controller "fb-clone/controllers/chat"
	"fb-clone/libs/config"
	"fb-clone/libs/middleware"
	"fb-clone/repositories"
	"fb-clone/services/auth"
	"fb-clone/services/chat"
	"fmt"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/gin-gonic/gin"
	"github.com/go-errors/errors"
	"github.com/jackc/pgx/v5/pgxpool"
)

// for local testing only
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, Sec-WebSocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Version")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func ErrorStackLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if c.Writer.Status() >= 500 {
			for _, err := range c.Errors {
				var sErr *errors.Error
				if ok := errors.As(err.Err, &sErr); ok {
					fmt.Println(sErr.ErrorStack())
				} else {
					fmt.Printf("Error without stack: %v", err)
				}
			}
		}
	}
}

func main() {
	fmt.Printf("\n\n--------------------- Starting Chat API at %v ---------------------\n", time.Now())
	fmt.Println("Parsing config")
	err := config.ParseConfig()
	if err != nil {
		panic(err)
	}

	fmt.Println("Connecting to postgres")
	ctx := context.TODO()

	pgxCfg, err := pgxpool.ParseConfig(config.Cfg.PostgresDB.PostgresURL)
	if err != nil {
		panic(err)
	}
	pgxCfg.MaxConns = config.Cfg.PostgresDB.MaxConnections

	db, err := pgxpool.NewWithConfig(ctx, pgxCfg)
	if err != nil {
		panic(err)
	}

	// check connection
	err = db.Ping(ctx)
	if err != nil {
		// TODO: some retry logice maybe?
		panic(fmt.Errorf("couldn't ping db %w", err))
	}

	localAWSCfg, err := awsConfig.LoadDefaultConfig(
		ctx,
		// awsConfig.WithRegion("ap-southeast-1"),
		awsConfig.WithEndpointResolverWithOptions(aws.EndpointResolverWithOptionsFunc(
			func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{URL: config.Cfg.DynamoDB.DynamodbURL}, nil
			}),
		),
	)
	if err != nil {
		panic(err)
	}

	localDynamodb := dynamodb.NewFromConfig(localAWSCfg) // TODO: setup config

	// repositories
	credentialsRepository := repositories.NewCredentialsRepository(db)
	chatMetadataRepository := repositories.NewChatMetadataRepository(localDynamodb)
	chatMesssagesRepository := repositories.NewChatMessagesRepository(localDynamodb)

	// Services
	chatService := chat.NewChatService(chatMetadataRepository, chatMesssagesRepository)

	// Controllers
	chatController := chat_controller.NewChatController(chatService)

	// middleware
	authService, err := auth.NewAuthService(credentialsRepository) // TODO: auth service should be a separate binary
	if err != nil {
		panic(err)
	}

	authRequired := middleware.BasicAuth(authService) // TODO: this should use authValidator locally instead of separate service
	getUserInfo := middleware.GetUserInfo(authService)

	// Router
	if config.Cfg.Env == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.New()

	router.Use(ErrorStackLogger())
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(CORSMiddleware())
	router.Use(getUserInfo)

	api := router.Group("/chatapi/v1")

	// TODO: might need to separate single time requests (listChats) with websocket upgradable requests (connect)
	api.GET("/chats/list", authRequired, chatController.ListChats)     // return user's chat info (unseen message counts, chat metadata, etc.)
	api.POST("/chats/create", authRequired, chatController.CreateChat) // return user's chat info (unseen message counts, chat metadata, etc.)
	api.GET("/ws", authRequired, chatController.Connect)               // connect user to a chat session, establish websocket connection

	s := &http.Server{
		Addr:           fmt.Sprintf(":%d", config.Cfg.ChatAPI.Port),
		Handler:        router,
		ReadTimeout:    time.Duration(config.Cfg.ChatAPI.ReadTimeoutSeconds) * time.Second,
		WriteTimeout:   time.Duration(config.Cfg.ChatAPI.WriteTimeoutSeconds) * time.Second,
		MaxHeaderBytes: config.Cfg.ChatAPI.MaxHeaderBytes,
	}

	fmt.Println("Starting chat server")
	err = s.ListenAndServe()
	if err != nil {
		panic(fmt.Errorf("failed to start a server: %w", err))
	}
}
