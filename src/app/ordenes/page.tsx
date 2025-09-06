import { SidebarWrapper } from "@/features/dashboard/components/SidebarWrapper"
import OrdersTable from "@/features/ordenes/components/TableOrders"
import React from "react"

const page = () => {
  return (
    <SidebarWrapper>
      <div>
        <div className="">
            <OrdersTable/>
        </div>
      </div>
    </SidebarWrapper>
  )
}

export default page
