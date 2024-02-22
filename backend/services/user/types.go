package user

import "fb-clone/postgresql/repositories"

func getApiProfile(p *repositories.Profile) ApiUserProfile {
	thumbnailURL := ""
	if p.ThumbnailID != "" {
		thumbnailURL = "https://test-facebook-public.s3.ap-southeast-1.amazonaws.com/" + p.ThumbnailID
	}

	bannerURL := ""
	if p.BannerID != "" {
		bannerURL = "https://test-facebook-public.s3.ap-southeast-1.amazonaws.com/" + p.BannerID
	}

	// if !p.Public { // TODO: asset service?
	// 	thumbnailURL = "cdn.domain.com/pr/" + p.ThumbnailID + "?signaure="
	// }

	return ApiUserProfile{
		Name:         p.Name,
		Username:     p.Username,
		BannerURL:    bannerURL,
		ThumbnailURL: thumbnailURL,
	}
}

type ApiUserProfile struct {
	Name         string `json:"name"`
	Username     string `json:"username"`
	ThumbnailURL string `json:"thumbnailURL"`
	BannerURL    string `json:"bannerURL"`
}
