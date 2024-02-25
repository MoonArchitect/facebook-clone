package middleware

import (
	"fb-clone/services/auth"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

const contextDataKey = "contextData"

type ContextData struct {
	UID *string
}

func BasicAuth(authService auth.AuthService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token, err := ctx.Cookie(auth.AuthCookieName)
		if err != nil {
			_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("did not find cookie: %w", err))
			return
		}

		uid, err := authService.ValidateToken(token)
		if err != nil {
			_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("unauthorized token: %w", err))
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
		return ContextData{}
	}

	data, ok := val.(ContextData)
	if !ok {
		// log
		return ContextData{}
	}

	return data
}
