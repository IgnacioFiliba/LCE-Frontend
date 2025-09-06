// app/productos/page.tsx
import { SidebarWrapper } from "@/features/dashboard/components/SidebarWrapper"
import ProductsTable from "@/features/productos/components/ProductsTable"
import React from "react"
// ✅ Usa el import que corresponda a tu alias "@"
//    Si NO tienes alias "@", usa el import relativo de abajo.

// import ProductsTable from "../../productos/components/ProductsTable"

export const metadata = {
  title: "Gestión de Productos",
}

export default function ProductosPage() {
  return (
    <SidebarWrapper>
    <div className="p-6">
      <ProductsTable />
    </div>
    </SidebarWrapper>
  )
}
