package controllers

import (
	"fb-clone/libs/apierror"
	"fb-clone/libs/apitypes"
	"fb-clone/libs/middleware"
	"fb-clone/services/feed"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type feedController struct {
	feedService feed.FeedService
}

type FeedController interface {
	GetHomeFeed(ctx *gin.Context)
	GetGroupsFeed(ctx *gin.Context)
	GetUserPosts(ctx *gin.Context)
}

func NewFeedController(feedService feed.FeedService) FeedController {
	return &feedController{
		feedService,
	}
}

type GetUserPostsRequest struct {
	UserID string `form:"userID" binding:"required"`
	Skip   uint64 `form:"skip"`
}

func (fc feedController) GetUserPosts(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	// if uid == nil {
	//  apierror.HandleGinError(ctx, UnauthorizedAccess)
	// 	return
	// }

	var req GetUserPostsRequest
	err := ctx.BindQuery(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	// check if user posts are private

	posts, err := fc.feedService.GetHistoricUserPosts(ctx, uid, req.UserID, req.Skip)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	ctx.JSON(http.StatusOK, posts)
}

type GetHomeFeedRequest struct {
	Skip uint64 `form:"skip"`
}

func (fc feedController) GetHomeFeed(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID

	var req GetHomeFeedRequest
	err := ctx.BindQuery(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	apiPosts := []apitypes.Post{}
	if uid == nil {
		apiPosts, err = fc.feedService.GetPublicHomeFeed(ctx, req.Skip)
	} else {
		apiPosts, err = fc.feedService.GetPersonalHomeFeed(ctx, *uid, req.Skip)
	}

	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, fmt.Errorf("failed to get home feed"))
		return
	}

	ctx.JSON(http.StatusOK, apiPosts)
}

type GetGroupsFeedRequest struct {
	Skip uint64 `form:"skip"`
}

func (fc feedController) GetGroupsFeed(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		apierror.HandleGinError(ctx, apierror.ErrorUnauthorizedAccess, nil)
		return
	}

	var req GetGroupsFeedRequest
	err := ctx.BindQuery(&req)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	apiPosts, err := fc.feedService.GetPersonalGroupFeed(ctx, *uid, req.Skip)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, fmt.Errorf("failed to get groups feed"))
		return
	}

	ctx.JSON(http.StatusOK, apiPosts)
}
