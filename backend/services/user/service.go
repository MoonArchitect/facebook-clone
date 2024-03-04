package user

import (
	"context"
	"fb-clone/libs/apitypes"
	"fb-clone/postgresql/repositories"
	"fmt"
	"strings"
	"time"

	"github.com/go-errors/errors"
)

type userService struct {
	friendshipRepository         repositories.FriendshipRepository
	userRepository               repositories.UserRepository
	profileRepository            repositories.ProfileRepository
	postsRepository              repositories.PostsRepository
	postLikesRepository          repositories.PostLikesRepository
	commentsRepository           repositories.CommentsRepository
	friendshipRequestsRepository repositories.FriendshipRequestsRepository
}

type UserService interface {
	CreateNewUser(ctx context.Context, email, firstName, lastName string) (string, error)
	// UpdateProfile(ctx context.Context, name, username string, public bool) (string, error)
	GetUserProfileByID(ctx context.Context, uid string, requesterUID string) (*apitypes.UserProfile, error)
	GetUserProfileByUsername(ctx context.Context, username string, requesterUID *string) (*apitypes.UserProfile, error)
	EditProfileThumbnail(ctx context.Context, uid, thumbnailID string) error
	EditProfileCover(ctx context.Context, uid, coverID string) error

	GetUserFriends(ctx context.Context, userID string) ([]apitypes.MiniUserProfile, error)
	CreateFriendRequest(ctx context.Context, requesterID, userID string) error
	AcceptFriendRequest(ctx context.Context, requesterID, userID string) error

	CreateUserPost(ctx context.Context, uid, text string, imageID *string) error
	DeleteUserPost(ctx context.Context, uid, postID string) error
	CreateComment(ctx context.Context, uid, text, postID string) error
	GetPost(ctx context.Context, userID *string, postID string) (apitypes.Post, error)
	LikePost(ctx context.Context, userID, postID string) error
	SharePost(ctx context.Context, postID string) error
}

func NewUserService(
	userRepository repositories.UserRepository,
	profileRepository repositories.ProfileRepository,
	friendshipRepository repositories.FriendshipRepository,
	postsRepository repositories.PostsRepository,
	postLikesRepository repositories.PostLikesRepository,
	commentsRepository repositories.CommentsRepository,
	friendshipRequestsRepository repositories.FriendshipRequestsRepository,
) UserService {
	return &userService{
		friendshipRepository,
		userRepository,
		profileRepository,
		postsRepository,
		postLikesRepository,
		commentsRepository,
		friendshipRequestsRepository,
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

func (s userService) GetUserFriends(ctx context.Context, userID string) ([]apitypes.MiniUserProfile, error) {
	friends, err := s.friendshipRepository.GetAllFriends(ctx, userID)
	if err != nil {
		return nil, err
	}
	friendIDs := make([]string, len(friends))
	for i, f := range friends {
		friendIDs[i] = f.FriendID
	}

	profiles, err := s.profileRepository.GetManyByID(ctx, friendIDs)
	if err != nil {
		return nil, err
	}

	apiProfiles := make([]apitypes.MiniUserProfile, len(profiles))
	for i, p := range profiles {
		apiProfiles[i] = apitypes.GetMiniUserProfile(p)
	}

	return apiProfiles, nil
}

func (s userService) CreateFriendRequest(ctx context.Context, requesterID, userID string) error {
	areAlreadyFriends, err := s.friendshipRepository.AreFriends(ctx, requesterID, userID)
	if err != nil {
		return err
	} else if areAlreadyFriends {
		return errors.Errorf("users are already friends")
	}

	return s.friendshipRequestsRepository.CreateFriendRequest(ctx, requesterID, userID)
}

func (s userService) AcceptFriendRequest(ctx context.Context, requesterID, userID string) error {
	err := s.friendshipRequestsRepository.DeleteFriendRequest(ctx, requesterID, userID)
	if err != nil {
		return err
	}

	return s.friendshipRepository.AddFriendship(ctx, requesterID, userID)
}

func (s userService) CreateUserPost(ctx context.Context, uid, text string, imageID *string) error {
	// sanitize text, etc.
	text = strings.ToValidUTF8(text, "")
	text = strings.TrimSpace(text)
	text = strings.ReplaceAll(text, "\u00A0", "")

	return s.postsRepository.CreatePost(ctx, uid, text, imageID)
}

func (s userService) DeleteUserPost(ctx context.Context, uid, postID string) error {
	post, err := s.postsRepository.GetPostByID(ctx, postID)
	if err != nil {
		return err
	}

	if post.OwnerId != uid {
		return errors.Errorf("user does not own this post")
	}

	err = s.commentsRepository.DeletePostComments(ctx, postID)
	if err != nil {
		return err
	}

	err = s.postLikesRepository.DeletePostLikes(ctx, postID)
	if err != nil {
		return err
	}

	return s.postsRepository.DeletePost(ctx, postID)
}

func (s userService) CreateComment(ctx context.Context, uid, text, postID string) error {
	// sanitize text, etc.
	text = strings.ToValidUTF8(text, "")
	text = strings.TrimSpace(text)
	text = strings.ReplaceAll(text, "\u00A0", "")

	return s.commentsRepository.CreateComment(ctx, uid, text, postID)
}

func (s userService) GetUserProfileByID(ctx context.Context, uid, requesterUID string) (*apitypes.UserProfile, error) {
	if uid != requesterUID {
		return nil, fmt.Errorf("Only the owner may access their account")
	}

	profile, err := s.profileRepository.GetByID(ctx, uid)
	if err != nil {
		return nil, err
	}

	friends, err := s.friendshipRepository.GetAllFriends(ctx, profile.Id)
	if err != nil {
		return nil, err
	}

	friendIDs := make([]string, len(friends))
	for i, f := range friends {
		friendIDs[i] = f.FriendID
	}

	apiProfile := apitypes.GetUserProfile(*profile, friendIDs, "none") // "none" since this is used only by /me endpoint right now

	return &apiProfile, nil
}

func (s userService) GetPost(ctx context.Context, userID *string, postID string) (apitypes.Post, error) {
	dbPost, err := s.postsRepository.GetPostByID(ctx, postID)
	if err != nil {
		return apitypes.Post{}, err
	}

	apiPosts, err := s.getApiPosts(ctx, userID, []repositories.Post{dbPost}) // TODO: more robust system for translating structs from db to API data
	if err != nil {
		return apitypes.Post{}, err
	}

	return apiPosts[0], nil
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

func (s userService) GetUserProfileByUsername(ctx context.Context, username string, requesterUID *string) (*apitypes.UserProfile, error) {
	profile, err := s.profileRepository.GetByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	if !profile.Public {
		if requesterUID == nil {
			return nil, errors.Errorf("You cannot see this profile")
		}
		areFriends, err := s.friendshipRepository.AreFriends(ctx, profile.Id, *requesterUID)
		if err != nil {
			return nil, errors.Errorf("failed to check if users are friends: %w", err)
		}

		if !areFriends {
			return nil, errors.Errorf("You cannot see this profile")
		}
	}

	friends, err := s.friendshipRepository.GetAllFriends(ctx, profile.Id)
	if err != nil {
		return nil, err
	}

	friendIDs := make([]string, len(friends))
	for i, f := range friends {
		friendIDs[i] = f.FriendID
	}

	var friendshipStatus apitypes.FriendshipStatus
	friendshipStatus = apitypes.NoFriends

	if requesterUID != nil {
		friendshipStatus, err = s.getFriendshipStatus(ctx, *requesterUID, profile.Id)
		if err != nil {
			return nil, err
		}
	}

	apiProfile := apitypes.GetUserProfile(*profile, friendIDs, friendshipStatus)

	return &apiProfile, nil
}

func (s userService) getFriendshipStatus(ctx context.Context, requesterID, userID string) (apitypes.FriendshipStatus, error) {
	areFriends, err := s.friendshipRepository.AreFriends(ctx, userID, requesterID)
	if err != nil {
		return "", err
	}
	if areFriends {
		return apitypes.Friends, nil
	}

	isFriendshipPending, err := s.friendshipRequestsRepository.CheckRequestExists(ctx, userID, requesterID)
	if err != nil {
		return "", err
	}
	if isFriendshipPending {
		return apitypes.FriendshipPending, nil
	}

	isFriendshipRequested, err := s.friendshipRequestsRepository.CheckRequestExists(ctx, requesterID, userID)
	if err != nil {
		return "", err
	}
	if isFriendshipRequested {
		return apitypes.FriendshipRequested, nil
	}

	return apitypes.NoFriends, nil
}

func (s userService) EditProfileThumbnail(ctx context.Context, uid, thumbnailID string) error {
	err := s.profileRepository.EditProfileThumbnail(ctx, uid, thumbnailID)
	return err
}

func (s userService) EditProfileCover(ctx context.Context, uid, coverID string) error {
	err := s.profileRepository.EditProfileCover(ctx, uid, coverID)
	return err
}

// ugly 3 additional queries to build API response for a post
// dbPost ->
//   - isLiked + comment
//   - owner info
func (s userService) getApiPosts(ctx context.Context, userID *string, dbPosts []repositories.Post) ([]apitypes.Post, error) {
	postIDs := apitypes.GetPostIds(dbPosts)

	dbComments, err := s.commentsRepository.GetFromManyPosts(ctx, postIDs)
	if err != nil {
		return nil, err
	}

	uniqueUserIds := apitypes.GetOwnerIds(dbPosts, dbComments)

	profiles, err := s.profileRepository.GetManyByID(ctx, uniqueUserIds)
	if err != nil {
		return nil, err
	}

	postLikes := []repositories.PostLike{}
	if userID != nil {
		postLikes, err = s.postLikesRepository.GetUserLikesForPosts(ctx, *userID, postIDs)
		if err != nil {
			return nil, err
		}
	}

	return apitypes.BuildApiPosts(profiles, postLikes, dbPosts, dbComments)
}
