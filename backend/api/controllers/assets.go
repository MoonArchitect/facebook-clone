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
	"github.com/davidbyttow/govips/v2/vips"
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
	fullImage, err = resizeImageToThumbnail(fullImage)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed edit image: %w", err))
		return
	}

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
	fullImage, err = resizeImageToCover(fullImage)
	if err != nil {
		_ = ctx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed edit image: %w", err))
		return
	}

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

const thumbnailSize = 300

// temporary
// crops square center of image and resizes it to (thumbnailSize x thumbnailSize), compresses to 75quality jpeg
func resizeImageToThumbnail(fullImage []byte) ([]byte, error) {
	imgRef, err := vips.NewImageFromBuffer(fullImage)
	if err != nil {
		return nil, err
	}

	xSize, ySize := imgRef.Width(), imgRef.Height()
	if xSize < ySize {
		err = imgRef.ExtractArea(0, int((ySize-xSize)/2), int(xSize), int(xSize))
	} else if xSize >= ySize {
		err = imgRef.ExtractArea(int((xSize-ySize)/2), 0, int(ySize), int(ySize))
	}
	if err != nil {
		return nil, err
	}

	minSize := min(xSize, ySize)
	if minSize > thumbnailSize {
		err = imgRef.Resize(thumbnailSize/float64(minSize), vips.KernelAuto)
	}
	if err != nil {
		return nil, err
	}

	fullImage, _, err = imgRef.Export(&vips.ExportParams{
		Format:     vips.ImageTypeJPEG,
		Quality:    75,
		Interlaced: true,
	})
	if err != nil {
		return nil, err
	}

	return fullImage, nil
}

const coverImageAspectRation = 4 // width / height
const coverHeightSize = 360

// temporary
// crops square center of image and resizes it to (thumbnailSize x thumbnailSize), compresses to 75quality jpeg
func resizeImageToCover(fullImage []byte) ([]byte, error) {
	imgRef, err := vips.NewImageFromBuffer(fullImage)
	if err != nil {
		return nil, err
	}

	xSize, ySize := imgRef.Width(), imgRef.Height()
	if xSize < ySize*coverImageAspectRation {
		err = imgRef.ExtractArea(0, int((ySize-xSize/coverImageAspectRation)/2), int(xSize), int(xSize/coverImageAspectRation))
	} else if xSize >= ySize*coverImageAspectRation {
		err = imgRef.ExtractArea(int((xSize-ySize*coverImageAspectRation)/2), 0, int(ySize*coverImageAspectRation), int(ySize))
	}
	if err != nil {
		return nil, err
	}

	height := imgRef.Height()
	if height > coverHeightSize {
		err = imgRef.Resize(coverHeightSize/float64(height), vips.KernelAuto)
	}
	if err != nil {
		return nil, err
	}

	fullImage, _, err = imgRef.Export(&vips.ExportParams{
		Format:     vips.ImageTypeJPEG,
		Quality:    75,
		Interlaced: true,
	})
	if err != nil {
		return nil, err
	}

	return fullImage, nil
}
