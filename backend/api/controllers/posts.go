package controllers

import (
	"fb-clone/libs/middleware"
	"fb-clone/services/user"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type postsController struct {
	userService user.UserService
}

type PostsController interface {
	CreatePost(ctx *gin.Context)
}

func NewPostsController(userService user.UserService) PostsController {
	return &postsController{
		userService,
	}
}

type CreatePostRequest struct {
	Text string `json:"text" binding:"required"`
}

func (pc postsController) CreatePost(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("unauthorized access"))
		return
	}

	var req CreatePostRequest
	err := ctx.BindJSON(&req)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = pc.userService.CreateUserPost(ctx, *uid, req.Text)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ctx.Status(http.StatusOK)
}
