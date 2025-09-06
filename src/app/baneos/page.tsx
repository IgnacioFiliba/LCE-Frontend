import UsersBanTable from "@/features/baneos/components/TableBaneos"
import { SidebarWrapper } from "@/features/dashboard/components/SidebarWrapper"

const page = () => {
  return (
    <SidebarWrapper>
      <div>
        <div>
          <UsersBanTable />
        </div>
      </div>
    </SidebarWrapper>
  )
}

export default page
