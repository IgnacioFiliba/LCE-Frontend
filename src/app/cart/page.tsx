"use client"

import ShoppingCart from "@/features/cart/components/CartView"
import LayoutWrapper from "@/shared/Wrapper"
import React from "react"

const PageCart = () => {
  return (
    <div>
      <LayoutWrapper>
        <ShoppingCart />
      </LayoutWrapper>
    </div>
  )
}

export default PageCart
