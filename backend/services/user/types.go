package user

type ApiUserProfile struct {
	Name         string `json:"name"`
	Username     string `json:"username"`
	ThumbnailURL string `json:"thumbnailURL"`
	BannerURL    string `json:"bannerURL"`
}
