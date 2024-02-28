"use client"

import { ProfilePosts } from "@facebook-clone/web/components/profile-page/profile-posts-tab"

export default function Profile({ params }: { params: { username: string } }) {
  const {username} = params

  return <ProfilePosts username={username} />
}