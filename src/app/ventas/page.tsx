import { SidebarWrapper } from "@/features/dashboard/components/SidebarWrapper"
import { DashboardCharts } from "@/features/ventas/components/GraphicAdminVentas"
import React from "react"

const page = () => {
  return (
    <SidebarWrapper>
      <div>
        <div>
          <DashboardCharts />
        </div>
      </div>
    </SidebarWrapper>
  )
}

export default page
