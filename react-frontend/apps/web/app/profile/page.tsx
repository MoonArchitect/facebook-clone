"use client"

import { ProfilePosts } from "@facebook-clone/web/components/profile-page/profile-posts-tab"
import { useSession } from "@facebook-clone/web/components/utils/session-context"

export default function Profile() {
  const {userData} = useSession()

  if (userData === undefined)
    return "user not logged in"

  return <ProfilePosts username={userData.username} />
}