"use client"

import { ProfileFriendsSection } from "@facebook-clone/web/components/profile-page/friends-section/friends-section"
import { useSession } from "@facebook-clone/web/components/utils/session-context"

export default function ProfileFriends() {
  const {userData} = useSession()

  if(userData === undefined)
    return "idk, userData is undefined"

  return <ProfileFriendsSection profile={userData} />
}