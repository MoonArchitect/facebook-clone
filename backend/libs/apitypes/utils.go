package apitypes

import (
	"fb-clone/postgresql/repositories"

	"github.com/go-errors/errors"
)

func GetPostAndOwnerIds(dbPosts []repositories.Post) ([]string, []string) {
	seenIds := map[string]struct{}{}
	uniqueUserIds := []string{}
	postIds := []string{}
	for _, p := range dbPosts {
		postIds = append(postIds, p.Id)

		_, ok := seenIds[p.OwnerId]
		if !ok {
			uniqueUserIds = append(uniqueUserIds, p.OwnerId)
		}
		seenIds[p.OwnerId] = struct{}{}
	}

	return postIds, uniqueUserIds
}

func BuildApiPosts(profiles []repositories.Profile, postLikes []repositories.PostLike, dbPosts []repositories.Post) ([]Post, error) {
	profilesMap := map[string]repositories.Profile{}
	for _, p := range profiles {
		profilesMap[p.Id] = p
	}

	postLikesMap := map[string]struct{}{}
	for _, p := range postLikes {
		postLikesMap[p.PostID] = struct{}{}
	}

	apiPosts := make([]Post, len(dbPosts))
	for i, p := range dbPosts {
		ownerProfile, ok := profilesMap[p.OwnerId]
		if !ok {
			return nil, errors.Errorf("failed to find associated profile with post's owner")
		}

		_, isLikedByUser := postLikesMap[p.Id]

		apiPosts[i] = Post{
			Id: p.Id,
			Owner: MinUserInfo{
				Name:        ownerProfile.Name,
				ThumbnailID: ownerProfile.ThumbnailID,
			},
			PostText:           p.PostText,
			PostImages:         p.PostImages,
			Comments:           []Comment{},
			LikedByCurrentUser: isLikedByUser,
			LikeCount:          p.LikeCount,
			ShareCount:         p.ShareCount,
			CreatedAt:          JSONTime(p.CreatedAt),
		}
	}

	return apiPosts, nil
}
