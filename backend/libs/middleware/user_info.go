package middleware

import (
	"fb-clone/services/auth"

	"github.com/gin-gonic/gin"
)

func GetUserInfo(authService auth.AuthService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var uid *string = nil

		token, err := ctx.Cookie(auth.AuthCookieName)
		if err == nil {
			validatedUID, err := authService.ValidateToken(token)
			if err == nil {
				uid = &validatedUID
			}
		}

		contextData := GetContextData(ctx)
		contextData.UID = uid
		ctx.Set(contextDataKey, contextData)

		ctx.Next()
	}
}
