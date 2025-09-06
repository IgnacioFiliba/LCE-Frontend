"use client"

import UserProfile from "@/features/profile/components/Profile"
import LayoutWrapper from "@/shared/Wrapper"
import React from "react"

const page = () => {
  return (
    <div>
      <LayoutWrapper>
        <UserProfile />
      </LayoutWrapper>
    </div>
  )
}

export default page
