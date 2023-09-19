"use client"

import { ReactComponent as FacebookPeopleIcon } from "@facebook-clone/assets/icons/null_states_people_gray_wash.svg"
import { ContentPlaceHolder } from "@facebook-clone/web/components/friends-page/friends-content"

export default function Friends() {
  return (
    <ContentPlaceHolder
      title="No Custom List to Show"
      description="When you create a custom list on Facebook, they'll appear here."
      icon={<FacebookPeopleIcon />}
    />
  )
}
