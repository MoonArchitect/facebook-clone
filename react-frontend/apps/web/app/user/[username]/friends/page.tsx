"use client"

import { ProfileFriendsSection } from "@facebook-clone/web/components/profile-page/friends-section/friends-section"
import { useProfileByUsernameQuery } from "@facebook-clone/web/query-hooks/profile-query-hooks"

export default function ProfileFriends({ params }: { params: { username: string } }) {
  const {username} = params
  const {data} = useProfileByUsernameQuery(username)

  if (data === undefined)
    return null

  return <ProfileFriendsSection profile={data}/>
}