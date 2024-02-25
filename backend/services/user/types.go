package user

import (
	"fb-clone/postgresql/repositories"
	"fmt"
	"time"
)

func getApiProfile(p *repositories.Profile) ApiUserProfile {
	return ApiUserProfile{
		Id:          p.Id,
		Name:        p.Name,
		Username:    p.Username,
		BannerID:    p.BannerID,
		ThumbnailID: p.ThumbnailID,
	}
}

type ApiUserProfile struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Username    string `json:"username"`
	ThumbnailID string `json:"thumbnailID"`
	BannerID    string `json:"bannerID"`
}

type ApiComment struct {
	Owner     MinUserInfo  `json:"owner"`
	Text      string       `json:"text"`
	Responds  []ApiComment `json:"responds"`
	CreatedAt JSONTime     `json:"createdAt"`
}

type ApiPost struct {
	Id                 string       `json:"id"`
	Owner              MinUserInfo  `json:"owner"`
	PostText           string       `json:"postText"`
	PostImages         []string     `json:"postImages"`
	LikedByCurrentUser bool         `json:"likedByCurrentUser"`
	LikeCount          int          `json:"likeCount"`
	ShareCount         int          `json:"shareCount"`
	Comments           []ApiComment `json:"comments"`
	CreatedAt          JSONTime     `json:"createdAt"`
}

type MinUserInfo struct {
	Name        string `json:"name"`
	ThumbnailID string `json:"thumbnailID"`
}

type JSONTime time.Time

func (t JSONTime) MarshalJSON() ([]byte, error) {
	//do your serializing here
	stamp := fmt.Sprintf("%v", time.Time(t).Unix())
	return []byte(stamp), nil
}
