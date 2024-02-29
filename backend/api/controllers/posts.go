package controllers

import (
	"fb-clone/libs/middleware"
	"fb-clone/services/user"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type postsController struct {
	userService user.UserService
}

type PostsController interface {
	CreatePost(ctx *gin.Context)
	GetPost(ctx *gin.Context)
	LikePost(ctx *gin.Context)
	SharePost(ctx *gin.Context)
}

func NewPostsController(userService user.UserService) PostsController {
	return &postsController{
		userService,
	}
}

type CreatePostRequest struct {
	Text        string `json:"text" binding:"required"`
	AttachImage bool   `json:"attachImage"`
}

type CreatePostResponse struct {
	ImageID string `json:"imageID"`
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

	var imageID *string
	if req.AttachImage {
		uuid, err := uuid.NewRandom()
		if err != nil {
			_ = ctx.AbortWithError(http.StatusBadRequest, err)
			return
		}
		id := uuid.String()
		imageID = &id
	}

	err = pc.userService.CreateUserPost(ctx, *uid, req.Text, imageID)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	resp := CreatePostResponse{}
	if imageID != nil {
		resp.ImageID = *imageID
	}
	ctx.JSON(http.StatusOK, resp)
}

type GetPostRequest struct {
	PostID string `form:"postID" binding:"required"`
}

func (pc postsController) GetPost(ctx *gin.Context) {
	var req GetPostRequest
	err := ctx.BindQuery(&req)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	// check if user posts are private
	uid := middleware.GetContextData(ctx).UID

	posts, err := pc.userService.GetPost(ctx, uid, req.PostID)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ctx.JSON(http.StatusOK, posts)
}

type LikePostRequest struct {
	PostID string `json:"postID" binding:"required"`
}

func (pc postsController) LikePost(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("unauthorized access"))
		return
	}

	var req LikePostRequest
	err := ctx.BindJSON(&req)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = pc.userService.LikePost(ctx, *uid, req.PostID)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ctx.Status(http.StatusOK)
}

type SharePostRequest struct {
	PostID string `json:"postID" binding:"required"`
}

func (pc postsController) SharePost(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("unauthorized access"))
		return
	}

	var req SharePostRequest
	err := ctx.BindJSON(&req)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = pc.userService.SharePost(ctx, req.PostID)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ctx.Status(http.StatusOK)
}
