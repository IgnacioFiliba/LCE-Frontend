"use client"

import Link from "next/link"
import { Zap } from "lucide-react"
import { motion, Variants } from "framer-motion"

interface CreateProductButtonProps {
  // Props para customizar el comportamiento
  href?: string
  onClick?: () => void
  className?: string
  variant?: "desktop" | "mobile"
  // Para el mobile menu
  onMobileMenuClose?: () => void
}

const CreateProductButton: React.FC<CreateProductButtonProps> = ({
  href = "/form",
  onClick,
  className = "",
  variant = "desktop",
  onMobileMenuClose,
}) => {
  // Animaciones del botón
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    if (onMobileMenuClose && variant === "mobile") {
      onMobileMenuClose()
    }
  }

  // Versión Desktop
  if (variant === "desktop") {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={className}
      >
        <Link
          href={href}
          className="relative group"
          onClick={handleClick}
        >
          <motion.div
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold border-2 border-red-500 hover:border-red-400 transition-all duration-300 shadow-lg"
            whileHover={{
              boxShadow: "0 0 25px rgba(220,38,38,0.6)",
              background: "linear-gradient(90deg, #dc2626, #b91c1c)",
            }}
            animate={{
              boxShadow: [
                "0 0 15px rgba(220,38,38,0.4)",
                "0 0 25px rgba(220,38,38,0.6)",
                "0 0 15px rgba(220,38,38,0.4)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <motion.span
              className="flex items-center gap-2"
              whileHover={{ x: 2 }}
            >
              <Zap className="w-4 h-4" />
              Crear Repuesto
            </motion.span>

            {/* Efecto de brillo */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl w-5"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          </motion.div>
        </Link>
      </motion.div>
    )
  }

  // Versión Mobile
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 }}
      whileHover={{ x: 10 }}
      className={className}
    >
      <Link
        href={href}
        className="group flex items-center space-x-4 text-white font-medium p-4 rounded-xl bg-gradient-to-r from-red-600/30 to-red-700/20 border border-red-500/30 hover:from-red-600/50 hover:to-red-700/40 transition-all duration-300 mb-2"
        onClick={handleClick}
      >
        <motion.span
          className="text-2xl"
          whileHover={{ scale: 1.3, rotate: 15 }}
        >
          ⚡
        </motion.span>
        <span className="text-lg font-bold">Crear Repuesto</span>
        <motion.div
          className="ml-auto w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.5 }}
        />
      </Link>
    </motion.div>
  )
}

export default CreateProductButton
