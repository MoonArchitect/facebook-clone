package assets

import (
	"bytes"
	"context"
	"fb-clone/libs/config"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/davidbyttow/govips/v2/vips"
	"github.com/google/uuid"
)

type assetService struct {
	s3Uploader *manager.Uploader
}

type AssetService interface {
	ResizeImageToThumbnail(fullImage []byte) ([]byte, error)
	ResizeImageToCover(fullImage []byte) ([]byte, error)
	ResizePostImage(fullImage []byte) ([]byte, error)

	UploadImage(ctx context.Context, image []byte, mimeType string) (string, error)
	UploadImageWithID(ctx context.Context, image []byte, mimeType, imageID string) (string, error)
}

func NewAssetService(s3Uploader *manager.Uploader) AssetService {
	return assetService{
		s3Uploader,
	}
}

const thumbnailSize = 300

// temporary
// crops square center of image and resizes it to (thumbnailSize x thumbnailSize), compresses to 75quality jpeg
func (s assetService) ResizeImageToThumbnail(fullImage []byte) ([]byte, error) {
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
// crops section center of image and resizes it to (thumbnailSize x thumbnailSize), compresses to 75quality jpeg
func (s assetService) ResizeImageToCover(fullImage []byte) ([]byte, error) {
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

const maxPostImageSize = 540

// temporary
func (s assetService) ResizePostImage(fullImage []byte) ([]byte, error) {
	imgRef, err := vips.NewImageFromBuffer(fullImage)
	if err != nil {
		return nil, err
	}

	height := min(imgRef.Height(), imgRef.Width())
	if height > maxPostImageSize {
		err = imgRef.Resize(maxPostImageSize/float64(height), vips.KernelAuto)
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

func (s assetService) UploadImage(ctx context.Context, image []byte, mimeType string) (string, error) {
	imageID, err := uuid.NewRandom()
	if err != nil {
		// apierror.HandleGinError(ctx, ErrorInternal, )
		return "", fmt.Errorf("failed generate image uuid: %w", err)
	}

	return s.UploadImageWithID(ctx, image, mimeType, imageID.String())
}

func (s assetService) UploadImageWithID(ctx context.Context, image []byte, mimeType string, imageID string) (string, error) {
	bucket := config.Cfg.Aws.S3
	_, err := s.s3Uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      &bucket,
		Key:         &imageID,
		ContentType: &mimeType,
		Body:        bytes.NewReader(image),
	})
	if err != nil {
		// apierror.HandleGinError(ctx, ErrorInternal, fmt.Errorf("failed to upload image: %w", err))
		return "", fmt.Errorf("failed to upload image: %w", err)
	}

	return imageID, nil
}
