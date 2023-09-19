package apierror

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIError struct {
	ClientMessage string
	StatusCode    int
	Err           error
	Log           error
}

// func New(err error) APIError {
// 	richErr, ok := err.(APIError)
// 	if ok {
// 		return APIError{
// 			Err:           err,
// 			StatusCode:    richErr.StatusCode,
// 			ClientMessage: richErr.ClientMessage,
// 		}
// 	}

// 	return APIError{
// 		Err: err,
// 	}
// }

func NewRich(err error, code int, clientMsg string) APIError {
	richErr, ok := err.(APIError)
	if ok {
		if richErr.StatusCode != code {
			richErr.Log = fmt.Errorf("Overwriting status code, new: %v, old: %v, log: %w", code, richErr.StatusCode, richErr.Log)
		}

		return APIError{
			Err:           err,
			Log:           richErr.Log,
			StatusCode:    richErr.StatusCode,
			ClientMessage: richErr.ClientMessage, // overwrites previous client msg
		}
	}

	return APIError{
		Err:           err,
		StatusCode:    code,
		ClientMessage: clientMsg,
	}
}

func (err APIError) Error() string {
	return fmt.Sprintf("{msg: %v, code: %v, err: %v}", err.ClientMessage, err.StatusCode, err.Err.Error()) // TODO: only return client msg
}

func HandleGin(ctx *gin.Context, err error) {
	richErr, ok := err.(APIError)
	if ok {
		code := richErr.StatusCode
		if code == 0 {
			code = http.StatusInternalServerError
			richErr.Log = fmt.Errorf("Found invalid StatusCode, val: %v, log: %w", code, richErr.Log)
		}
		_ = ctx.AbortWithError(code, err)
		return
	}

	_ = ctx.AbortWithError(http.StatusInternalServerError, err)
}
