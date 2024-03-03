package apitypes

import (
	"fmt"
	"time"
)

// TODO: come up with something better
type FriendshipStatus string

const (
	NoFriends           FriendshipStatus = "none"
	FriendshipRequested FriendshipStatus = "requested"
	FriendshipPending   FriendshipStatus = "pending"
	Friends             FriendshipStatus = "friends"
)

type UserProfile struct {
	Id          string   `json:"id"`
	Name        string   `json:"name"`
	Username    string   `json:"username"`
	FriendIDs   []string `json:"friendIDs"`
	ThumbnailID string   `json:"thumbnailID"`
	BannerID    string   `json:"bannerID"`

	// in decreasing order of precedence 'friends' | 'pending' | 'requested' | 'none'
	FriendshipStatus FriendshipStatus `json:"friendshipStatus"`
}

type MiniUserProfile struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Username    string `json:"username"`
	ThumbnailID string `json:"thumbnailID"`
	BannerID    string `json:"bannerID"`
}

// type MinUserInfo struct {
// 	Name        string `json:"name"`
// 	ThumbnailID string `json:"thumbnailID"`
// }

type Comment struct {
	Owner     MiniUserProfile `json:"owner"`
	Text      string          `json:"text"`
	Responds  []Comment       `json:"responds"`
	CreatedAt JSONTime        `json:"createdAt"`
}

type Post struct {
	Id                 string          `json:"id"`
	Owner              MiniUserProfile `json:"owner"`
	PostText           string          `json:"postText"`
	PostImages         []string        `json:"postImages"`
	LikedByCurrentUser bool            `json:"likedByCurrentUser"`
	LikeCount          int             `json:"likeCount"`
	ShareCount         int             `json:"shareCount"`
	Comments           []Comment       `json:"comments"`
	CreatedAt          JSONTime        `json:"createdAt"`
}

type JSONTime time.Time

func (t JSONTime) MarshalJSON() ([]byte, error) {
	//do your serializing here
	stamp := fmt.Sprintf("%v", time.Time(t).Unix())
	return []byte(stamp), nil
}
