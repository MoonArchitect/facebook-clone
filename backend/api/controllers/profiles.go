package controllers

import (
	"fb-clone/libs/apierror"
	"fb-clone/libs/apitypes"
	"fb-clone/libs/middleware"
	"fb-clone/services/user"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type profileController struct {
	userService user.UserService
}

type ProfileController interface {
	GetMe(ctx *gin.Context)
	UpdateMe(ctx *gin.Context)
	GetProfile(ctx *gin.Context)
	CreateFriendRequest(ctx *gin.Context)
	AcceptFriendRequest(ctx *gin.Context)
	UnfriendRequest(ctx *gin.Context)
	GetUserFriends(ctx *gin.Context)
	GetUserFriendRequests(ctx *gin.Context)
}

func NewProfileController(userService user.UserService) ProfileController {
	return &profileController{
		userService,
	}
}

func (pc profileController) GetMe(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		apierror.HandleGinError(ctx, ErrorUnauthorizedAccess, nil)
		return
	}

	apiProfile, err := pc.userService.GetUserProfileByID(ctx, *uid, *uid)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, err)
		return
	}

	ctx.JSON(http.StatusOK, apiProfile)
}

func (pc profileController) UpdateMe(ctx *gin.Context) {

}

type GetProfileRequest struct {
	Username string `form:"username" binding:"required"` // min length: 1, no spaces, alphanumeric
}

func (pc profileController) GetProfile(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	// if uid != nil {
	// TODO: user x saw your profile (ie. what Linkedin does)
	// }

	var req GetProfileRequest
	err := ctx.BindQuery(&req)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorValidationFailed, err)
		return
	}

	apiProfile, err := pc.userService.GetUserProfileByUsername(ctx, req.Username, uid)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, err)
		return
	}

	ctx.JSON(http.StatusOK, apiProfile)
}

type GetUserFriendRequestsResponse struct {
	FriendshipsRequested []apitypes.MiniUserProfile `json:"friendshipsRequested"`
	FriendshipsPending   []apitypes.MiniUserProfile `json:"friendshipsPending"`
}

func (pc profileController) GetUserFriendRequests(ctx *gin.Context) {
	requesterID := middleware.GetContextData(ctx).UID
	if requesterID == nil {
		apierror.HandleGinError(ctx, ErrorUnauthorizedAccess, nil)
		return
	}

	friendshipRequests, friendshipPending, err := pc.userService.GetUserFriendRequests(ctx, *requesterID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, err)
		return
	}

	ctx.JSON(http.StatusOK, GetUserFriendRequestsResponse{
		FriendshipsRequested: friendshipRequests,
		FriendshipsPending:   friendshipPending,
	})
}

func (pc profileController) GetUserFriends(ctx *gin.Context) {
	// requesterID := middleware.GetContextData(ctx).UID
	// if requesterID == nil {
	// 	apierror.HandleGinError(ctx, UnauthorizedAccess)
	// 	return
	// }

	userID := ctx.Param("userID")
	err := uuid.Validate(userID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorValidationFailed, err)
		return
	}

	friends, err := pc.userService.GetUserFriends(ctx, userID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, err)
		return
	}

	ctx.JSON(http.StatusOK, friends)
}

func (pc profileController) CreateFriendRequest(ctx *gin.Context) {
	requesterID := middleware.GetContextData(ctx).UID
	if requesterID == nil {
		apierror.HandleGinError(ctx, ErrorUnauthorizedAccess, nil)
		return
	}

	userID := ctx.Param("userID")
	err := uuid.Validate(userID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorValidationFailed, err)
		return
	}

	err = pc.userService.CreateFriendRequest(ctx, *requesterID, userID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, err)
		return
	}

	ctx.Status(http.StatusOK)
}

func (pc profileController) AcceptFriendRequest(ctx *gin.Context) {
	requesterID := middleware.GetContextData(ctx).UID
	if requesterID == nil {
		apierror.HandleGinError(ctx, ErrorUnauthorizedAccess, nil)
		return
	}

	userID := ctx.Param("userID")
	err := uuid.Validate(userID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorValidationFailed, err)
		return
	}

	err = pc.userService.AcceptFriendRequest(ctx, *requesterID, userID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, err)
		return
	}

	ctx.Status(http.StatusOK)
}

func (pc profileController) UnfriendRequest(ctx *gin.Context) {
	requesterID := middleware.GetContextData(ctx).UID
	if requesterID == nil {
		apierror.HandleGinError(ctx, ErrorUnauthorizedAccess, nil)
		return
	}

	userID := ctx.Param("userID")
	err := uuid.Validate(userID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorValidationFailed, err)
		return
	}

	err = pc.userService.UnfriendRequest(ctx, *requesterID, userID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, err)
		return
	}

	ctx.Status(http.StatusOK)
}
