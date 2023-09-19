package controllers

import (
	"fb-clone/libs/middleware"
	"fb-clone/services/user"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type profileController struct {
	userService user.UserService
}

type ProfileController interface {
	GetMe(ctx *gin.Context)
	UpdateMe(ctx *gin.Context)
	GetProfile(ctx *gin.Context)
}

func NewProfileController(userService user.UserService) ProfileController {
	return &profileController{
		userService,
	}
}

func (pc profileController) GetMe(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("unauthorized access"))
		return
	}

	apiProfile, err := pc.userService.GetUserProfileByID(ctx, *uid, uid)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ctx.JSON(http.StatusOK, apiProfile)
}

func (pc profileController) UpdateMe(ctx *gin.Context) {

}

type GetProfileRequest struct {
	Username string `json:"username"` // min length: 1, no spaces, alphanumeric
}

func (pc profileController) GetProfile(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	// if uid != nil {
	// TODO: user x saw your profile (ie. what Linkedin does)
	// }

	var req GetProfileRequest
	err := ctx.BindJSON(&req)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	apiProfile, err := pc.userService.GetUserProfileByUsername(ctx, req.Username, uid)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ctx.JSON(http.StatusOK, apiProfile)
}
