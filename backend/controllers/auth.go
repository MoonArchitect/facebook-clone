package controllers

import (
	"errors"
	"fb-clone/libs/apierror"
	"fb-clone/libs/config"
	"fb-clone/repositories"
	"fb-clone/services/auth"
	"fb-clone/services/user"

	"github.com/gin-gonic/gin"
)

type authController struct {
	authService auth.AuthService
	userService user.UserService
}

type AuthController interface {
	Signin(ctx *gin.Context)
	Signup(ctx *gin.Context)
	Signout(ctx *gin.Context)
}

func NewAuthController(authService auth.AuthService, userService user.UserService) AuthController {
	return &authController{
		authService,
		userService,
	}
}

type EmailPassword struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (c authController) Signin(ctx *gin.Context) {
	var ep EmailPassword
	if err := ctx.BindJSON(&ep); err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	token, err := c.authService.Signin(ctx, ep.Email, ep.Password)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	ctx.SetCookie(auth.AuthCookieName, token, config.Cfg.Auth.MaxAgeSeconds, "/", config.Cfg.Auth.CookieDomain, true, true)
}

type SignUpRequest struct {
	Email     string `json:"email" binding:"required"`
	Password  string `json:"password" binding:"required"`
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
}

func (c authController) Signup(ctx *gin.Context) {
	var ep SignUpRequest
	if err := ctx.BindJSON(&ep); err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorValidationFailed, err)
		return
	}

	uid, err := c.userService.CreateNewUser(ctx, ep.Email, ep.FirstName, ep.FirstName)
	if errors.Is(err, repositories.ErrorDuplicateUserEmail) {
		apierror.HandleGinError(ctx, apierror.ErrorUserEmailAlredyRegistered, err)
		return
	} else if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	token, err := c.authService.CreateCredentials(ctx, ep.Email, ep.Password, uid)
	if err != nil {
		apierror.HandleGinError(ctx, apierror.ErrorInternal, err)
		return
	}

	ctx.SetCookie(auth.AuthCookieName, token, config.Cfg.Auth.MaxAgeSeconds, "/", config.Cfg.Auth.CookieDomain, true, true)
}

func (c authController) Signout(ctx *gin.Context) {
	ctx.SetCookie(auth.AuthCookieName, "", -1, "/", config.Cfg.Auth.CookieDomain, true, true)
}
