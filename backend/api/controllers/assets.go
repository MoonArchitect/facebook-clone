package controllers

import (
	"fb-clone/libs/apierror"
	"fb-clone/libs/middleware"
	"fb-clone/services/assets"
	"fb-clone/services/user"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

type assetsController struct {
	userService  user.UserService
	assetService assets.AssetService
}

type AssetsController interface {
	UploadProfileThumbnail(ctx *gin.Context)
	UploadProfileCover(ctx *gin.Context)
	UploadPostImage(ctx *gin.Context)
}

func NewAssetsController(userService user.UserService, assetService assets.AssetService) AssetsController {
	return &assetsController{
		userService,
		assetService,
	}
}

const ImageSizeLimit = 10 * 1024 * 1024 // 10 MB

func (pc assetsController) UploadProfileThumbnail(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		apierror.HandleGinError(ctx, ErrorUnauthorizedAccess, nil)
		return
	}

	if ctx.Request.ContentLength > ImageSizeLimit {
		apierror.HandleGinError(ctx, ErrorValidationFailed, fmt.Errorf("image size exceeded"))
		return
	}

	ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, ImageSizeLimit)

	buff := make([]byte, 512)
	_, err := ctx.Request.Body.Read(buff)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to read 512 bytes: %w", err))
		return
	}

	mimeType := http.DetectContentType(buff)
	if mimeType != "image/jpeg" && mimeType != "image/png" && mimeType != "image/webp" {
		apierror.HandleGinError(ctx, ErrorValidationFailed, fmt.Errorf("image format is unsupported"))
		return
	}

	rest, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to read rest: %w", err))
		return
	}

	fullImage := append(buff, rest...) // TODO: find a better way to handle a file
	fullImage, err = pc.assetService.ResizeImageToThumbnail(fullImage)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed edit image: %w", err))
		return
	}

	imageID, err := pc.assetService.UploadImage(ctx, fullImage, mimeType)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to upload image: %w", err))
		return
	}

	err = pc.userService.EditProfileThumbnail(ctx, *uid, imageID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to update profile: %w", err))
		return
	}

	ctx.Status(http.StatusOK)
}

func (pc assetsController) UploadProfileCover(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		apierror.HandleGinError(ctx, ErrorUnauthorizedAccess, nil)
		return
	}

	if ctx.Request.ContentLength > ImageSizeLimit {
		apierror.HandleGinError(ctx, ErrorValidationFailed, fmt.Errorf("image size exceeded"))
		return
	}

	ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, ImageSizeLimit)

	buff := make([]byte, 512)
	_, err := ctx.Request.Body.Read(buff)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to read 512 bytes: %w", err))
		return
	}

	mimeType := http.DetectContentType(buff)
	if mimeType != "image/jpeg" && mimeType != "image/png" && mimeType != "image/webp" {
		apierror.HandleGinError(ctx, ErrorValidationFailed, fmt.Errorf("image format is unsupported"))
		return
	}

	rest, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to read rest: %w", err))
		return
	}

	fullImage := append(buff, rest...) // TODO: find a better way to handle a file
	fullImage, err = pc.assetService.ResizeImageToCover(fullImage)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed edit image: %w", err))
		return
	}

	imageID, err := pc.assetService.UploadImage(ctx, fullImage, mimeType)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to upload image: %w", err))
		return
	}

	err = pc.userService.EditProfileCover(ctx, *uid, imageID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to update profile: %w", err))
		return
	}

	ctx.Status(http.StatusOK)
}

func (pc assetsController) UploadPostImage(ctx *gin.Context) {
	imageID := ctx.Param("id")

	if ctx.Request.ContentLength > ImageSizeLimit {
		apierror.HandleGinError(ctx, ErrorValidationFailed, fmt.Errorf("image size exceeded"))
		return
	}

	ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, ImageSizeLimit)

	buff := make([]byte, 512)
	_, err := ctx.Request.Body.Read(buff)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to read 512 bytes: %w", err))
		return
	}

	mimeType := http.DetectContentType(buff)
	if mimeType != "image/jpeg" && mimeType != "image/png" && mimeType != "image/webp" {
		apierror.HandleGinError(ctx, ErrorValidationFailed, fmt.Errorf("image format is unsupported"))
		return
	}

	rest, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to read rest: %w", err))
		return
	}

	fullImage := append(buff, rest...) // TODO: find a better way to handle a file
	fullImage, err = pc.assetService.ResizePostImage(fullImage)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed edit image: %w", err))
		return
	}

	_, err = pc.assetService.UploadImageWithID(ctx, fullImage, mimeType, imageID)
	if err != nil {
		apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to upload image: %w", err))
		return
	}

	ctx.Status(http.StatusOK)
}
