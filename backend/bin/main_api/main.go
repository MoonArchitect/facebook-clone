package main

import (
	"context"
	"fb-clone/api/controllers"
	"fb-clone/libs/config"
	"fb-clone/libs/middleware"
	"fb-clone/postgresql/repositories"
	"fb-clone/services/auth"
	"fb-clone/services/user"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	fmt.Println("Parsing config")
	err := config.ParseConfig()
	if err != nil {
		panic(err)
	}

	fmt.Println("Connecting to postgres")
	ctx := context.TODO()

	pgxCfg, err := pgxpool.ParseConfig(config.Cfg.DB.PostgresURL)
	if err != nil {
		panic(err)
	}
	pgxCfg.MaxConns = config.Cfg.DB.MaxConnections

	db, err := pgxpool.NewWithConfig(ctx, pgxCfg)
	if err != nil {
		panic(err)
	}

	// Repositories
	credentialsRepository := repositories.NewCredentialsRepository(db)
	userRepository := repositories.NewUserRepository(db)
	profileRepository := repositories.NewProfileRepository(db)
	friendshipRepository := repositories.NewFriendshipRepository(db)

	// Services
	userService := user.NewUserService(userRepository, profileRepository, friendshipRepository)
	authService, err := auth.NewAuthService(credentialsRepository) // TODO: auth service should be a separate binary
	if err != nil {
		panic(err)
	}

	// Controllers
	profileController := controllers.NewProfileController(userService)
	authController := controllers.NewAuthController(authService, userService)

	// middleware
	authRequired := middleware.BasicAuth(authService) // TODO: this should use authValidator locally instead of separate service

	// Router
	if config.Cfg.Env == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.New()

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	api := router.Group("/api/v1")

	// TODO better auth middleware
	api.GET("/auth/signin", authController.Signin)
	api.GET("/auth/signout", authRequired, authController.Signout)
	api.GET("/auth/signup", authController.Signup)

	// api.POST("/profiles/update/banner", authRequired, profileController.GetMe)
	// api.POST("/profiles/update/thumbnail", authRequired, profileController.GetMe)
	api.GET("/profiles/me", authRequired, profileController.GetMe)
	api.PATCH("/profiles/me", authRequired, profileController.UpdateMe)
	api.GET("/profiles/get", profileController.GetProfile)

	// api.GET("/posts", profileController.GetProfile)
	// api.POST("/posts", profileController.GetProfile)
	// api.POST("/comment", profileController.GetProfile)
	// api.POST("/reply", profileController.GetProfile)
	api.GET("/user/friends", profileController.GetProfile)
	// api.GET("/friends/requests", profileController.GetProfile)
	// api.GET("/feed", profileController.GetProfile)
	// api.GET("/user/feed", profileController.GetProfile)

	s := &http.Server{
		Addr:           fmt.Sprintf(":%d", config.Cfg.Server.Port),
		Handler:        router,
		ReadTimeout:    time.Duration(config.Cfg.Server.ReadTimeoutSeconds) * time.Second,
		WriteTimeout:   time.Duration(config.Cfg.Server.WriteTimeoutSeconds) * time.Second,
		MaxHeaderBytes: config.Cfg.Server.MaxHeaderBytes,
	}

	fmt.Println("Starting server")
	err = s.ListenAndServe()
	if err != nil {
		panic(fmt.Errorf("failed to start a server: %w", err))
	}
}

// if profile is private only friends can view that profile
// if public or areFriends(userID, friendID)
