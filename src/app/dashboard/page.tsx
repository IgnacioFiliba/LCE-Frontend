// Tu página
import { SidebarWrapper } from "@/features/dashboard/components/SidebarWrapper"
import UsersTable from "@/features/dashboard/components/TableDashboardUsers"

const PageDashboard = () => {
  return (
    <SidebarWrapper>
      <div>
        <div>
          <UsersTable/>
        </div>
      </div>
    </SidebarWrapper>
  )
}

export default PageDashboard
