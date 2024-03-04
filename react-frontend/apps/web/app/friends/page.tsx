"use client"

import { ProfileFriendsPage } from "@facebook-clone/web/components/profile-page/friends-section/friends-section"
import { useSession } from "@facebook-clone/web/components/utils/session-context"

// import { ReactComponent as FacebookPeopleIcon } from "@facebook-clone/assets/icons/null_states_people_gray_wash.svg"
// import { ContentPlaceHolder } from "@facebook-clone/web/components/friends-page/friends-content"

export default function Friends() {
  const {userData} = useSession()

  if(userData === undefined)
    return "idk, userData is undefined"

  return <ProfileFriendsPage profile={userData} />
  // return (
  //   <ContentPlaceHolder
  //     title="When you have friend requests or suggestions, you'll see them here."
  //     icon={<FacebookPeopleIcon />}
  //   />
  // )
}
