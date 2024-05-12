package apierror

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-errors/errors"
)

var (
	ErrorUnauthorizedAccess        = DeclareAPIError("unauthorized access", http.StatusUnauthorized)
	ErrorValidationFailed          = DeclareAPIError("validation failed", http.StatusBadRequest)
	ErrorInternal                  = DeclareAPIError("internal error", http.StatusInternalServerError)
	ErrorUserEmailAlredyRegistered = DeclareAPIError("given email is already registered", http.StatusBadRequest)
	ErrorFailedWebsocketUpgrade    = DeclareAPIError("failed to upgrade to websocket", http.StatusInternalServerError)
)

type TemplateAPIError struct {
	StatusCode int
	Desc       string
}

func DeclareAPIError(desc string, code int) TemplateAPIError {
	return TemplateAPIError{
		StatusCode: code,
		Desc:       desc,
	}
}

func HandleGinError(ctx *gin.Context, template TemplateAPIError, cause error) {
	err := errors.Errorf("%s:%w", template.Desc, cause)

	code := template.StatusCode
	if code == 0 {
		code = http.StatusInternalServerError
		fmt.Println("received TemplateAPIError with no status code, defaulting to 500")
	}
	_ = ctx.AbortWithError(code, err)
}
