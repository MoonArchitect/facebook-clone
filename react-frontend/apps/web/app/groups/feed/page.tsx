"use client"

import { GroupsFeedTab } from "@facebook-clone/web/components/groups-feed-page/groups-feed-tab"
import { RequireAuthenticated } from "@facebook-clone/web/components/utils/require-auth"

export default function GroupsFeed() {
  return (
    <RequireAuthenticated redirectPath="/">
      <GroupsFeedTab />
    </RequireAuthenticated>
  )
}
