package controllers

import (
	"errors"
	"fb-clone/libs/config"
	"fb-clone/postgresql/repositories"
	"fb-clone/services/auth"
	"fb-clone/services/user"
	"net/http"

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
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	token, err := c.authService.Signin(ctx, ep.Email, ep.Password)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusUnauthorized, err)
		return
	}

	ctx.SetCookie(auth.AuthCookieName, token, config.Cfg.Auth.MaxAgeSeconds, "/", config.Cfg.Auth.CookieDomain, true, true)
}

func (c authController) Signup(ctx *gin.Context) {
	var ep EmailPassword
	if err := ctx.BindJSON(&ep); err != nil {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	uid, err := c.userService.CreateNewUser(ctx, ep.Email)
	if errors.Is(err, repositories.EmailAlreadyRegistered) {
		_ = ctx.AbortWithError(http.StatusBadRequest, err)
		return
	} else if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	token, err := c.authService.CreateCredentials(ctx, ep.Email, ep.Password, uid)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusUnauthorized, err)
		return
	}

	ctx.SetCookie(auth.AuthCookieName, token, config.Cfg.Auth.MaxAgeSeconds, "/", config.Cfg.Auth.CookieDomain, true, true)
}

func (c authController) Signout(ctx *gin.Context) {
	ctx.SetCookie(auth.AuthCookieName, "", -1, "/", config.Cfg.Auth.CookieDomain, true, true)
}
