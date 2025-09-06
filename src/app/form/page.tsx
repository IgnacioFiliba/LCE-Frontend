
import { SidebarWrapper } from "@/features/dashboard/components/SidebarWrapper"
import AdminProtectedWrapper from "@/features/home/components/AdminWrapper"
import FormCreate from "@/features/home/components/FormCreateProduct"
import { Sidebar } from "lucide-react"
import React from "react"

const PageForm = () => {
  return (
    <SidebarWrapper>
    <div>
      <AdminProtectedWrapper>
        <FormCreate />
      </AdminProtectedWrapper>
    </div>
    </SidebarWrapper>
  )
}

export default PageForm
