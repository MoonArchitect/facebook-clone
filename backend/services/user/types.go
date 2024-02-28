package user

import (
	"fb-clone/libs/apitypes"
	"fb-clone/postgresql/repositories"
)

func getApiProfile(p *repositories.Profile) apitypes.UserProfile {
	return apitypes.UserProfile{
		Id:          p.Id,
		Name:        p.Name,
		Username:    p.Username,
		BannerID:    p.BannerID,
		ThumbnailID: p.ThumbnailID,
	}
}
