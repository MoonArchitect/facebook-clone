package controllers

import (
	"bytes"
	"fb-clone/libs/config"
	"fb-clone/libs/middleware"
	"fb-clone/services/user"
	"fmt"
	"io"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type assetsController struct {
	userService user.UserService
	s3Uploader  *manager.Uploader
}

type AssetsController interface {
	UploadProfileThumbnail(ctx *gin.Context)
	UploadProfileCover(ctx *gin.Context)
}

func NewAssetsController(userService user.UserService, s3Uploader *manager.Uploader) AssetsController {
	return &assetsController{
		userService,
		s3Uploader,
	}
}

const ImageSizeLimit = 10 * 1024 * 1024 // 10 MB

func (pc assetsController) UploadProfileThumbnail(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("unauthorized access"))
		return
	}

	if ctx.Request.ContentLength > ImageSizeLimit {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("image size exceeded"))
		return
	}

	ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, ImageSizeLimit)

	buff := make([]byte, 512)
	_, err := ctx.Request.Body.Read(buff)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to read 512 bytes: %w", err))
		return
	}

	mimeType := http.DetectContentType(buff)
	if mimeType != "image/jpeg" && mimeType != "image/png" && mimeType != "image/webp" {
		_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("image format is unsupported"))
		return
	}

	rest, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to read rest: %w", err))
		return
	}

	fullImage := append(buff, rest...) // TODO: find a better way to handle a file
	thumbnailID, err := uuid.NewRandom()
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed generate image uuid: %w", err))
		return
	}
	thumbnailIDString := thumbnailID.String()
	bucket := config.Cfg.Aws.S3

	_, err = pc.s3Uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      &bucket,
		Key:         &thumbnailIDString,
		ContentType: &mimeType,
		Body:        bytes.NewReader(fullImage),
	})
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to upload image: %w", err))
		return
	}

	err = pc.userService.EditProfileThumbnail(ctx, *uid, thumbnailIDString)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to update profile: %w", err))
		return
	}

	ctx.Status(http.StatusOK)
}

func (pc assetsController) UploadProfileCover(ctx *gin.Context) {
	uid := middleware.GetContextData(ctx).UID
	if uid == nil {
		_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("unauthorized access"))
		return
	}

	if ctx.Request.ContentLength > ImageSizeLimit {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("image size exceeded"))
		return
	}

	ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, ImageSizeLimit)

	buff := make([]byte, 512)
	_, err := ctx.Request.Body.Read(buff)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to read 512 bytes: %w", err))
		return
	}

	mimeType := http.DetectContentType(buff)
	if mimeType != "image/jpeg" && mimeType != "image/png" && mimeType != "image/webp" {
		_ = ctx.AbortWithError(http.StatusUnauthorized, fmt.Errorf("image format is unsupported"))
		return
	}

	rest, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to read rest: %w", err))
		return
	}

	fullImage := append(buff, rest...) // TODO: find a better way to handle a file
	thumbnailID, err := uuid.NewRandom()
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed generate image uuid: %w", err))
		return
	}
	thumbnailIDString := thumbnailID.String()
	bucket := config.Cfg.Aws.S3

	_, err = pc.s3Uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      &bucket,
		Key:         &thumbnailIDString,
		ContentType: &mimeType,
		Body:        bytes.NewReader(fullImage),
	})
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to upload image: %w", err))
		return
	}

	err = pc.userService.EditProfileCover(ctx, *uid, thumbnailIDString)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to update profile: %w", err))
		return
	}

	ctx.Status(http.StatusOK)
}