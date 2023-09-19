"use client"

import { ReactComponent as FacebookPeopleIcon } from "@facebook-clone/assets/icons/null_states_people_gray_wash.svg"
import { ContentPlaceHolder } from "@facebook-clone/web/components/friends-page/friends-content"

export default function Friends() {
  return (
    <ContentPlaceHolder
      title="When you have friend requests or suggestions, you'll see them here."
      icon={<FacebookPeopleIcon />}
    />
  )
}
