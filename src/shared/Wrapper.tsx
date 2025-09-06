"use client"

import Navbar from "@/features/home/components/Navbar"
import { usePathname } from "next/navigation"
import RepuStoreFooter from "./Footer"

interface LayoutWrapperProps {
  children: React.ReactNode
}

const authRoutes = ["/", "/register"]

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname()
  const isAuthRoute = authRoutes.includes(pathname)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar - Solo se muestra si NO es una ruta de autenticación */}
      {!isAuthRoute && <Navbar />}

      {/* Contenido principal */}
      <main className={`flex-1 ${!isAuthRoute ? "pt-0" : ""}`}>{children}</main>

      {/* Footer - Solo se muestra si NO es una ruta de autenticación */}
      {!isAuthRoute && <RepuStoreFooter />}
    </div>
  )
}

export default LayoutWrapper
