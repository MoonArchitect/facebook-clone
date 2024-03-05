package middleware

import (
	"fb-clone/libs/apierror"
	"fb-clone/services/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

const contextDataKey = "contextData"

var (
	ErrorCookieNotFound = apierror.DeclareAPIError("cookie not found", http.StatusUnauthorized)
	ErrorInvalidToken   = apierror.DeclareAPIError("invalid token", http.StatusUnauthorized)
)

type ContextData struct {
	UID *string
}

func BasicAuth(authService auth.AuthService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token, err := ctx.Cookie(auth.AuthCookieName)
		if err != nil {
			apierror.HandleGinError(ctx, ErrorCookieNotFound, err)
			return
		}

		uid, err := authService.ValidateToken(token)
		if err != nil {
			apierror.HandleGinError(ctx, ErrorInvalidToken, err)
			return
		}

		contextData := GetContextData(ctx)
		contextData.UID = &uid

		ctx.Set(contextDataKey, contextData)
		ctx.Next()
	}
}

func GetContextData(ctx *gin.Context) ContextData {
	if ctx == nil {
		panic("Was given empty gin context in GetContextData")
	}

	val, exists := ctx.Get(contextDataKey)
	if !exists {
		// log
		// fmt.Println("contextDataKey does not exist")
		return ContextData{}
	}

	data, ok := val.(ContextData)
	if !ok {
		// log
		// fmt.Println("contextDataKey value is not of ContextData type")
		return ContextData{}
	}

	return data
}
