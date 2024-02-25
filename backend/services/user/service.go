package user

import (
	"context"
	"fb-clone/postgresql/repositories"
	"fmt"
	"strings"
	"time"

	"github.com/go-errors/errors"
)

type userService struct {
	friendshipRepository repositories.FriendshipRepository
	userRepository       repositories.UserRepository
	profileRepository    repositories.ProfileRepository
	postsRepository      repositories.PostsRepository
	postLikesRepository  repositories.PostLikesRepository
}

type UserService interface {
	CreateNewUser(ctx context.Context, email, firstName, lastName string) (string, error)
	// UpdateProfile(ctx context.Context, name, username string, public bool) (string, error)
	GetUserProfileByID(ctx context.Context, uid string, requesterUID *string) (*ApiUserProfile, error)
	GetUserProfileByUsername(ctx context.Context, username string, requesterUID *string) (*ApiUserProfile, error)
	EditProfileThumbnail(ctx context.Context, uid, thumbnailID string) error
	EditProfileCover(ctx context.Context, uid, coverID string) error

	CreateUserPost(ctx context.Context, uid, text string) error
	GetHistoricUserPosts(ctx context.Context, uid string) ([]ApiPost, error)
	LikePost(ctx context.Context, userID, postID string) error
	SharePost(ctx context.Context, postID string) error
}

func NewUserService(
	userRepository repositories.UserRepository,
	profileRepository repositories.ProfileRepository,
	friendshipRepository repositories.FriendshipRepository,
	postsRepository repositories.PostsRepository,
	postLikesRepository repositories.PostLikesRepository,
) UserService {
	return &userService{
		friendshipRepository,
		userRepository,
		profileRepository,
		postsRepository,
		postLikesRepository,
	}
}

func (s userService) CreateNewUser(ctx context.Context, email, firstName, lastName string) (string, error) {
	uid, err := s.userRepository.CreateUser(ctx, email)
	if err != nil {
		return "", err
	}

	err = s.profileRepository.CreateProfile(ctx, repositories.Profile{
		Id:          uid,
		Name:        fmt.Sprintf("%v %v", firstName, lastName),
		Username:    fmt.Sprintf("%v_%v_%v", firstName, lastName, time.Now().Unix()),
		ThumbnailID: "default-profile-pic.webp",
		BannerID:    "",
		Public:      true,
	})
	if err != nil {
		// TODO: could use the same transaction for both repos
		// TODO delete user/auth? or retry. definetly log
		// or user/auth is created separately from profile, if user does not have a profile (ie. registration process is not complete) then prompt them with profile creation
		return "", err
	}

	return uid, nil
}

func (s userService) CreateUserPost(ctx context.Context, uid, text string) error {
	// sanitize text, etc.
	text = strings.ToValidUTF8(text, "")
	text = strings.TrimSpace(text)
	text = strings.ReplaceAll(text, "\u00A0", "")

	return s.postsRepository.CreatePost(ctx, uid, text)
}

func (s userService) GetUserProfileByID(ctx context.Context, uid string, requesterUID *string) (*ApiUserProfile, error) {
	if uid != *requesterUID {
		return nil, fmt.Errorf("Only the owner may access their account")
	}

	profile, err := s.profileRepository.GetByID(ctx, uid)
	if err != nil {
		return nil, err
	}

	apiProfile := getApiProfile(profile)

	return &apiProfile, nil
}

func (s userService) GetHistoricUserPosts(ctx context.Context, uid string) ([]ApiPost, error) {
	// if uid != *requesterUID {
	// 	return nil, fmt.Errorf("Only the owner may access their account")
	// }

	dbPosts, err := s.postsRepository.GetUserPostsByDate(ctx, uid)
	if err != nil {
		return nil, err
	}

	apiPosts, err := s.getApiPosts(ctx, dbPosts...)
	if err != nil {
		return nil, err
	}

	return apiPosts, nil
}

// TODO: ugly triple querying of db, name != functionality (should be toggleLike or smth), maybe have like/unlike endpoints
func (s userService) LikePost(ctx context.Context, userID, postID string) error {
	// validate that user can do this
	isLiked, err := s.postLikesRepository.IsPostLikedByUser(ctx, userID, postID)
	if err != nil {
		return err
	}

	if isLiked {
		err = s.postsRepository.DecrementPostLikeCount(ctx, postID)
		if err != nil {
			return err
		}
		err = s.postLikesRepository.UnlikePost(ctx, userID, postID)
		if err != nil {
			return err
		}
	} else {
		err = s.postsRepository.IncrementPostLikeCount(ctx, postID)
		if err != nil {
			return err
		}
		err = s.postLikesRepository.LikePost(ctx, userID, postID)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s userService) SharePost(ctx context.Context, postID string) error {
	// validate that user can do this

	err := s.postsRepository.IncrementPostShareCount(ctx, postID)
	if err != nil {
		return err
	}
	return nil
}

func (s userService) getApiPosts(ctx context.Context, dbPosts ...repositories.Post) ([]ApiPost, error) {
	seenIds := map[string]struct{}{}
	uniqueIds := []string{}
	for _, p := range dbPosts {
		_, ok := seenIds[p.OwnerId]
		if !ok {
			uniqueIds = append(uniqueIds, p.OwnerId)
		}
		seenIds[p.OwnerId] = struct{}{}
	}

	profiles, err := s.profileRepository.GetManyByID(ctx, uniqueIds)
	if err != nil {
		return nil, err
	}

	profilesMap := map[string]repositories.Profile{}
	for _, p := range profiles {
		profilesMap[p.Id] = p
	}

	apiPosts := make([]ApiPost, len(dbPosts))
	for i, p := range dbPosts {
		ownerProfile, ok := profilesMap[p.OwnerId]
		if !ok {
			return nil, errors.Errorf("failed to find associated profile with post's owner")
		}

		apiPosts[i] = ApiPost{
			Id: p.Id,
			Owner: MinUserInfo{
				Name:        ownerProfile.Name,
				ThumbnailID: ownerProfile.ThumbnailID,
			},
			PostText:   p.PostText,
			PostImages: p.PostImages,
			Comments:   []ApiComment{},
			LikeCount:  p.LikeCount,
			ShareCount: p.ShareCount,
			CreatedAt:  JSONTime(p.CreatedAt),
		}
	}

	return apiPosts, nil
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

	apiProfile := getApiProfile(profile)

	return &apiProfile, nil
}

func (s userService) EditProfileThumbnail(ctx context.Context, uid, thumbnailID string) error {
	err := s.profileRepository.EditProfileThumbnail(ctx, uid, thumbnailID)
	return err
}

func (s userService) EditProfileCover(ctx context.Context, uid, coverID string) error {
	err := s.profileRepository.EditProfileCover(ctx, uid, coverID)
	return err
}
