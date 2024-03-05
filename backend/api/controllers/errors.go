package controllers

import (
	"fb-clone/libs/apierror"
	"net/http"
)

var (
	ErrorUnauthorizedAccess = apierror.DeclareAPIError("unauthorized access", http.StatusUnauthorized)
	ErrorValidationFailed   = apierror.DeclareAPIError("validation failed", http.StatusBadRequest)
	ErrorInternal           = apierror.DeclareAPIError("internal error", http.StatusInternalServerError)
)
