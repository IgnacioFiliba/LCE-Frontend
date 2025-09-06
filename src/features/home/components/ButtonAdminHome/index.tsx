"use client"

import React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Shield, ArrowRight, LayoutDashboard } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

interface Props {
  user?: User
  className?: string
}

const ButtonAdmin: React.FC<Props> = ({ user, className }) => {
  const router = useRouter()

  if (!user?.isAdmin) return null

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    router.push("/ventas")
  }

  return (
    <div className={`flex justify-center items-center my-8 ${className ?? ""}`}>
      <motion.button
        onClick={handleClick}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0, scale: 0.98 }}
        className="
          group relative inline-flex items-center gap-3
          rounded-2xl px-6 py-3
          bg-gradient-to-r from-gray-900 via-black to-gray-900
          text-white font-semibold
          shadow-lg shadow-red-500/10
          ring-1 ring-red-500/40
          transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
        "
        aria-label="Abrir dashboard de administración"
      >
        {/* Borde luminoso suave */}
        <span
          aria-hidden
          className="
            pointer-events-none absolute inset-0 rounded-2xl
            bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20
            opacity-0 transition-opacity duration-300
            group-hover:opacity-100
          "
        />

        {/* Icono escudo (estado admin) */}
        <span
          aria-hidden
          className="
            flex h-9 w-9 items-center justify-center rounded-xl
            bg-red-500/10 ring-1 ring-red-500/30
          "
        >
          <Shield className="h-5 w-5 text-red-400" />
        </span>

        {/* Texto + subtexto */}
        <span className="flex flex-col items-start leading-tight">
          <span className="inline-flex items-center gap-2 text-sm text-gray-300">
            <LayoutDashboard className="h-4 w-4 text-gray-400" />
            Panel
          </span>
          <span className="text-base font-bold tracking-wide">
            DASHBOARD
          </span>
        </span>

        {/* Flecha animada */}
        <motion.span
          aria-hidden
          initial={{ x: 0, opacity: 0.7 }}
          whileHover={{ x: 4, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="
            ml-2 flex h-8 w-8 items-center justify-center rounded-xl
            bg-white/5 ring-1 ring-white/10
          "
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </motion.span>

        {/* Brillo inferior sutil */}
        <span
          aria-hidden
          className="
            pointer-events-none absolute -bottom-4 left-1/2 h-8 w-2/3 -translate-x-1/2
            bg-red-500/25 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity
          "
        />
      </motion.button>
    </div>
  )
}

export default ButtonAdmin
