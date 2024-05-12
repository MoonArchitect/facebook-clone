package controllers

import (
	"fb-clone/libs/apierror"
	"fb-clone/libs/middleware"
	"fb-clone/services/user"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type postsController struct {
	userService user.UserService
}

type PostsController interface {
	CreateComment(ctx *gin.Context)
	CreatePost(ctx *gin.Context)
	DeletePost(ctx *gin.Context)
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
		apierror.HandleGinError(ctx, apierror.ErrorUnauthorizedAccess, nil)
		return
	}

	var req CreatePostRequest
	err := ctx.BindJSON(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	var imageID *string
	if req.AttachImage {
		uuid, err := uuid.NewRandom()
		if err != nil {
			apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
			return
		}
		id := uuid.String()
		imageID = &id
	}

	err = pc.userService.CreateUserPost(ctx, *uid, req.Text, imageID)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	resp := CreatePostResponse{}
	if imageID != nil {
		resp.ImageID = *imageID
	}
	ctx.JSON(http.StatusOK, resp)
}

type DeletePostRequest struct {
	PostID string `form:"postID" binding:"required"`
}

func (pc postsController) DeletePost(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		apierror.HandleGinError(ctx, apierror.ErrorUnauthorizedAccess, nil)
		return
	}

	var req DeletePostRequest
	err := ctx.BindQuery(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	err = pc.userService.DeleteUserPost(ctx, *uid, req.PostID)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	ctx.Status(http.StatusOK)
}

type CreateCommentRequest struct {
	Text string `json:"text" binding:"required"`
}

func (pc postsController) CreateComment(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		apierror.HandleGinError(ctx, apierror.ErrorUnauthorizedAccess, nil)
		return
	}

	// TODO: check that comment exists, etc.
	postID := ctx.Param("postid")
	err := uuid.Validate(postID)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	var req CreateCommentRequest
	err = ctx.BindJSON(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	err = pc.userService.CreateComment(ctx, *uid, req.Text, postID)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	ctx.Status(http.StatusOK)
}

type GetPostRequest struct {
	PostID string `form:"postID" binding:"required"`
}

func (pc postsController) GetPost(ctx *gin.Context) {
	var req GetPostRequest
	err := ctx.BindQuery(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	// check if user posts are private
	uid := middleware.GetContextData(ctx).UID

	posts, err := pc.userService.GetPost(ctx, uid, req.PostID)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
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
		apierror.HandleGinError(ctx, apierror.ErrorUnauthorizedAccess, nil)
		return
	}

	var req LikePostRequest
	err := ctx.BindJSON(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	err = pc.userService.LikePost(ctx, *uid, req.PostID)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
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
		apierror.HandleGinError(ctx, apierror.ErrorUnauthorizedAccess, nil)
		return
	}

	var req SharePostRequest
	err := ctx.BindJSON(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	err = pc.userService.SharePost(ctx, req.PostID)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	ctx.Status(http.StatusOK)
}
