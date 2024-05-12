package main

import (
	"context"
	"fb-clone/controllers"
	"fb-clone/libs/config"
	"fb-clone/libs/middleware"
	"fb-clone/repositories"
	"fb-clone/services/assets"
	"fb-clone/services/auth"
	"fb-clone/services/feed"
	"fb-clone/services/user"
	"fmt"
	"net/http"
	"time"

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/go-errors/errors"
	"github.com/jackc/pgx/v5/pgxpool"
)

// for local testing only
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
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
	fmt.Printf("\n\n--------------------- Starting at %v ---------------------\n", time.Now())
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

	// AWS setup
	awsCfg, err := awsConfig.LoadDefaultConfig(ctx, awsConfig.WithRegion("ap-southeast-1"))
	if err != nil {
		panic(err)
	}

	s3Clint := s3.NewFromConfig(awsCfg)        // TODO: setup config
	s3Uploader := manager.NewUploader(s3Clint) // TODO: setup config

	// Repositories
	credentialsRepository := repositories.NewCredentialsRepository(db)
	userRepository := repositories.NewUserRepository(db)
	profileRepository := repositories.NewProfileRepository(db)
	friendshipRepository := repositories.NewFriendshipRepository(db)
	postsRepository := repositories.NewPostsRepository(db)
	postLikesRepository := repositories.NewPostLikesRepository(db)
	commentsRepository := repositories.NewCommentsRepository(db)
	friendshipRequestsRepository := repositories.NewFriendshipRequestsRepository(db)

	// Services
	userService := user.NewUserService(
		userRepository,
		profileRepository,
		friendshipRepository,
		postsRepository,
		postLikesRepository,
		commentsRepository,
		friendshipRequestsRepository,
	)
	feedService := feed.NewFeedService(postsRepository, profileRepository, postLikesRepository, commentsRepository)
	assetService := assets.NewAssetService(s3Uploader)
	authService, err := auth.NewAuthService(credentialsRepository) // TODO: auth service should be a separate binary
	if err != nil {
		panic(err)
	}

	// Controllers
	postsController := controllers.NewPostsController(userService)
	profileController := controllers.NewProfileController(userService)
	assetsController := controllers.NewAssetsController(userService, assetService)
	authController := controllers.NewAuthController(authService, userService)
	feedController := controllers.NewFeedController(feedService)

	// middleware
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

	api := router.Group("/api/v1")

	// TODO better auth middleware
	api.POST("/auth/signin", authController.Signin)
	api.POST("/auth/signout", authRequired, authController.Signout)
	api.POST("/auth/signup", authController.Signup)

	// api.PATCH("/profiles/me", authRequired, profileController.UpdateMe)
	api.GET("/profiles/me", authRequired, profileController.GetMe)
	api.GET("/profiles/me/friend-requests", authRequired, profileController.GetUserFriendRequests)
	api.GET("/profiles/get", profileController.GetProfile)
	api.GET("/profiles/:userID/friends", profileController.GetUserFriends)
	api.POST("/profiles/:userID/accept-friendship", authRequired, profileController.AcceptFriendRequest)
	api.POST("/profiles/:userID/request-friendship", authRequired, profileController.CreateFriendRequest)
	api.POST("/profiles/:userID/unfriend", authRequired, profileController.UnfriendRequest)
	api.GET("/profiles/posts", feedController.GetUserPosts) // TODO: authRequired might not be required

	api.GET("/posts", postsController.GetPost)
	api.POST("/posts/:postid/comment", authRequired, postsController.CreateComment)
	api.POST("/posts", authRequired, postsController.CreatePost)
	api.DELETE("/posts", authRequired, postsController.DeletePost)
	api.POST("/posts/like", authRequired, postsController.LikePost)
	api.POST("/posts/share", authRequired, postsController.SharePost) // temp

	api.GET("/feed/groups", authRequired, feedController.GetGroupsFeed)
	api.GET("/feed/home", feedController.GetHomeFeed)

	assetAPI := router.Group("/asset_api/v1")
	assetAPI.POST("/profile/thumbnail", authRequired, assetsController.UploadProfileThumbnail)
	assetAPI.POST("/profile/cover", authRequired, assetsController.UploadProfileCover)
	assetAPI.POST("/post/images/:id", authRequired, assetsController.UploadPostImage) // TODO: attack vector since image is uploaded by client provided ID

	s := &http.Server{
		Addr:           fmt.Sprintf(":%d", config.Cfg.MainAPI.Port),
		Handler:        router,
		ReadTimeout:    time.Duration(config.Cfg.MainAPI.ReadTimeoutSeconds) * time.Second,
		WriteTimeout:   time.Duration(config.Cfg.MainAPI.WriteTimeoutSeconds) * time.Second,
		MaxHeaderBytes: config.Cfg.MainAPI.MaxHeaderBytes,
	}

	fmt.Println("Starting server")
	err = s.ListenAndServe()
	if err != nil {
		panic(fmt.Errorf("failed to start a server: %w", err))
	}
}
