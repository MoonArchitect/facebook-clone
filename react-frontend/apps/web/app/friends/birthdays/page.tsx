"use client"

import { ReactComponent as BirthdayCakePicture } from "@facebook-clone/assets/icons/birthday-cake.svg"
import { ContentPlaceHolder } from "@facebook-clone/web/components/friends-page/friends-content"

export default function Friends() {
  return (
    <ContentPlaceHolder
      title="When your friends have birthdays, they will appear here."
      icon={<BirthdayCakePicture />}
    />
  )
}
