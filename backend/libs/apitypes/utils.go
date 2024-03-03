package apitypes

import (
	"fb-clone/postgresql/repositories"

	"github.com/go-errors/errors"
)

func GetOwnerIds(dbPosts []repositories.Post, dbComments []repositories.Comment) []string {
	seenIds := map[string]struct{}{}
	uniqueUserIds := []string{}
	for _, p := range dbPosts {
		_, ok := seenIds[p.OwnerId]
		if !ok {
			uniqueUserIds = append(uniqueUserIds, p.OwnerId)
		}
		seenIds[p.OwnerId] = struct{}{}
	}

	for _, c := range dbComments {
		_, ok := seenIds[c.OwnerId]
		if !ok {
			uniqueUserIds = append(uniqueUserIds, c.OwnerId)
		}
		seenIds[c.OwnerId] = struct{}{}
	}

	return uniqueUserIds
}

func GetPostIds(dbPosts []repositories.Post) []string {
	postIds := []string{}
	for _, p := range dbPosts {
		postIds = append(postIds, p.Id)
	}

	return postIds
}

func GetPostAndOwnerIds(dbPosts []repositories.Post, dbComments []repositories.Comment) ([]string, []string) {
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

	for _, c := range dbComments {
		_, ok := seenIds[c.OwnerId]
		if !ok {
			uniqueUserIds = append(uniqueUserIds, c.OwnerId)
		}
		seenIds[c.OwnerId] = struct{}{}
	}

	return postIds, uniqueUserIds
}

func BuildApiComments(dbComments []repositories.Comment, profiles map[string]repositories.Profile) (map[string][]Comment, error) {
	apiComments := map[string][]Comment{}
	for _, c := range dbComments {
		ownerProfile, ok := profiles[c.OwnerId]
		if !ok {
			return nil, errors.Errorf("could not find profile of comment owner")
		}

		apiComments[c.PostId] = append(apiComments[c.PostId], Comment{
			Owner:     GetMiniUserProfile(&ownerProfile),
			Text:      c.Text,
			Responds:  []Comment{},
			CreatedAt: JSONTime(c.CreatedAt),
		})
	}
	return apiComments, nil
}

func BuildApiPosts(profiles []repositories.Profile, postLikes []repositories.PostLike, dbPosts []repositories.Post, dbComments []repositories.Comment) ([]Post, error) {
	profilesMap := map[string]repositories.Profile{}
	for _, p := range profiles {
		profilesMap[p.Id] = p
	}

	postLikesMap := map[string]struct{}{}
	for _, p := range postLikes {
		postLikesMap[p.PostID] = struct{}{}
	}

	commentsMap, err := BuildApiComments(dbComments, profilesMap)
	if err != nil {
		return nil, err
	}

	apiPosts := make([]Post, len(dbPosts))
	for i, p := range dbPosts {
		ownerProfile, ok := profilesMap[p.OwnerId]
		if !ok {
			return nil, errors.Errorf("failed to find associated profile with post's owner")
		}

		comments, ok := commentsMap[p.Id]
		if !ok {
			comments = []Comment{}
		}

		_, isLikedByUser := postLikesMap[p.Id]

		apiPosts[i] = Post{
			Id:                 p.Id,
			Owner:              GetMiniUserProfile(&ownerProfile),
			PostText:           p.PostText,
			PostImages:         p.PostImages,
			Comments:           comments,
			LikedByCurrentUser: isLikedByUser,
			LikeCount:          p.LikeCount,
			ShareCount:         p.ShareCount,
			CreatedAt:          JSONTime(p.CreatedAt),
		}
	}

	return apiPosts, nil
}

func GetMiniUserProfile(p *repositories.Profile) MiniUserProfile {
	return MiniUserProfile{
		Id:          p.Id,
		Name:        p.Name,
		Username:    p.Username,
		BannerID:    p.BannerID,
		ThumbnailID: p.ThumbnailID,
	}
}

func GetUserProfile(p *repositories.Profile, friendIDs []string, friendshipStatus FriendshipStatus) UserProfile {
	return UserProfile{
		Id:               p.Id,
		Name:             p.Name,
		Username:         p.Username,
		FriendIDs:        friendIDs,
		FriendshipStatus: friendshipStatus,
		BannerID:         p.BannerID,
		ThumbnailID:      p.ThumbnailID,
	}
}
