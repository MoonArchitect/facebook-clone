package user

import (
	"context"
	"fb-clone/postgresql/repositories"
	"fmt"
)

type userService struct {
	friendshipRepository repositories.FriendshipRepository
	userRepository       repositories.UserRepository
	profileRepository    repositories.ProfileRepository
}

type UserService interface {
	CreateNewUser(ctx context.Context, email string) (string, error)
	// UpdateProfile(ctx context.Context, name, username string, public bool) (string, error)
	GetUserProfileByID(ctx context.Context, uid string, requesterUID *string) (*ApiUserProfile, error)
	GetUserProfileByUsername(ctx context.Context, username string, requesterUID *string) (*ApiUserProfile, error)
}

func NewUserService(userRepository repositories.UserRepository, profileRepository repositories.ProfileRepository, friendshipRepository repositories.FriendshipRepository) UserService {
	return &userService{
		friendshipRepository,
		userRepository,
		profileRepository,
	}
}

func (s userService) CreateNewUser(ctx context.Context, email string) (string, error) {
	uid, err := s.userRepository.CreateUser(ctx, email)
	if err != nil {
		return "", err
	}

	err = s.profileRepository.CreateProfile(ctx, repositories.Profile{
		Id:          uid,
		Name:        "",
		Username:    "",
		ThumbnailID: "",
		BannerID:    "",
		Public:      false,
	})
	if err != nil {
		// TODO delete user/auth? or retry. definetly log
		// or user/auth is created separately from profile, if user does not have a profile (ie. registration process is not complete) then prompt them with profile creation
		return "", err
	}

	return uid, nil
}

func (s userService) GetUserProfileByID(ctx context.Context, uid string, requesterUID *string) (*ApiUserProfile, error) {
	if uid != *requesterUID {
		return nil, fmt.Errorf("Only the owner may access their account")
	}

	profile, err := s.profileRepository.GetByID(ctx, uid)
	if err != nil {
		return nil, err
	}

	apiProfile := ApiUserProfile{
		Name: profile.Name,
	}

	return &apiProfile, nil
}

func (s userService) GetUserProfileByUsername(ctx context.Context, username string, requesterUID *string) (*ApiUserProfile, error) {
	profile, err := s.profileRepository.GetByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	if !profile.Public {
		if requesterUID == nil {
			return nil, fmt.Errorf("You cannot see this profile")
		}
		areFriends, err := s.friendshipRepository.AreFriends(ctx, profile.Id, *requesterUID)
		if err != nil {
			return nil, fmt.Errorf("failed to check if users are friends: %w", err)
		}

		if !areFriends {
			return nil, fmt.Errorf("You cannot see this profile")
		}
	}

	thumbnailURL := "cdn.domain.com/pu/" + profile.ThumbnailID
	if !profile.Public {
		thumbnailURL = "cdn.domain.com/pr/" + profile.ThumbnailID + "?signaure="
	}

	apiProfile := ApiUserProfile{
		Name:         profile.Name,
		ThumbnailURL: thumbnailURL,
	}

	return &apiProfile, nil
}

// func GetApiProfile(p repositories.Profile) ApiUserProfile {
// 	return ApiUserProfile{
// 		Name: p.Name,
// 	}
// }
