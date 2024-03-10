package feed

import (
	"context"
	"fb-clone/libs/apitypes"
	"fb-clone/repositories"
)

type feedService struct {
	postsRepository     repositories.PostsRepository
	profileRepository   repositories.ProfileRepository
	postLikesRepository repositories.PostLikesRepository
	commentsRepository  repositories.CommentsRepository
}

type FeedService interface {
	GetPublicHomeFeed(ctx context.Context, skip uint64) ([]apitypes.Post, error)
	GetPersonalHomeFeed(ctx context.Context, uid string, skip uint64) ([]apitypes.Post, error)
	GetPersonalGroupFeed(ctx context.Context, uid string, skip uint64) ([]apitypes.Post, error)
	GetHistoricUserPosts(ctx context.Context, requesterID *string, uid string, skip uint64) ([]apitypes.Post, error)
}

func NewFeedService(
	postsRepository repositories.PostsRepository,
	profileRepository repositories.ProfileRepository,
	postLikesRepository repositories.PostLikesRepository,
	commentsRepository repositories.CommentsRepository,
) FeedService {
	return &feedService{
		postsRepository,
		profileRepository,
		postLikesRepository,
		commentsRepository,
	}
}

const MaxPostsPerRequest = 5 // TODO: move this hardcoded limit into config or something...

// should be called only for no-auth users
func (s feedService) GetPublicHomeFeed(ctx context.Context, skip uint64) ([]apitypes.Post, error) {
	dbPosts, err := s.postsRepository.GetMostPopularPosts(ctx, skip, MaxPostsPerRequest)
	if err != nil {
		return nil, err
	}

	apiPosts, err := s.getApiPosts(ctx, nil, dbPosts)
	if err != nil {
		return nil, err
	}

	return apiPosts, nil
}

func (s feedService) GetPersonalGroupFeed(ctx context.Context, uid string, skip uint64) ([]apitypes.Post, error) {
	return []apitypes.Post{}, nil
}

func (s feedService) GetPersonalHomeFeed(ctx context.Context, uid string, skip uint64) ([]apitypes.Post, error) {
	dbPosts, err := s.postsRepository.GetMostPopularPosts(ctx, skip, MaxPostsPerRequest)
	if err != nil {
		return nil, err
	}

	apiPosts, err := s.getApiPosts(ctx, &uid, dbPosts)
	if err != nil {
		return nil, err
	}

	return apiPosts, nil
}

func (s feedService) GetHistoricUserPosts(ctx context.Context, requesterID *string, uid string, skip uint64) ([]apitypes.Post, error) {
	// if uid != *requesterUID {
	// 	return nil, fmt.Errorf("Only the owner may access their account")
	// }

	dbPosts, err := s.postsRepository.GetUserPostsByDate(ctx, uid, skip, MaxPostsPerRequest)
	if err != nil {
		return nil, err
	}

	apiPosts, err := s.getApiPosts(ctx, requesterID, dbPosts)
	if err != nil {
		return nil, err
	}

	return apiPosts, nil
}

// ugly 3 additional queries to build API response for a post
// dbPost ->
//   - isLiked + comment
//   - owner info
func (s feedService) getApiPosts(ctx context.Context, userID *string, dbPosts []repositories.Post) ([]apitypes.Post, error) {
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
