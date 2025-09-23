"use client"

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react"
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  UserCircle,
  Download,        // ✅ nuevo
  Info,            // ✅ nuevo
  Phone,           // ✅ nuevo
  Factory,         // opcional si usás lucide-react@latest (si no, podés quitarlo)
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  motion,
  useScroll,
  useTransform,
  Variants,
  AnimatePresence,
} from "framer-motion"
import useAuth from "@/features/login/hooks/useAuth"
import { useCartContext } from "../../../cart/context/index"

// ✅ URL del Excel para proveedores (ajustá según tu backend o archivo en /public)
const PROVIDERS_EXCEL_URL = "/downloads/proveedores.xlsx"

const LOGO_URL =
  "https://res.cloudinary.com/dfzmki6ew/image/upload/v1757308029/products/nvcqdlga7tdfacrr6sgw.png";

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 100], [0, -10])
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { user, logout, loading } = useAuth()
  const { itemCount, isLoading: cartLoading, total } = useCartContext()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: -100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  }

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.5 },
    },
  }

  const FloatingParticle = ({ delay }: { delay: number }) => (
    <motion.div
      className="absolute w-1 h-1 bg-red-400 rounded-full"
      initial={{ opacity: 0, y: 100 }}
      animate={{
        opacity: [0, 1, 0],
        y: [100, -20],
        x: [0, Math.random() * 100 - 50],
      }}
      transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: Math.random() * 2 }}
    />
  )

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
  }

  const handleLogout = async () => {
    try {
      setShowUserMenu(false)
      await logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <motion.header
      style={{ y: headerY, opacity: headerOpacity }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "backdrop-blur-md bg-black/90" : "bg-black"
      }`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Partículas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} />
        ))}
      </div>

      {/* Forma diagonal animada */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 w-full h-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <motion.path
              d="M0,0 L1200,0 L1200,70 Q600,100 0,70 Z"
              fill="url(#animatedGradient)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <motion.stop
                  offset="0%"
                  stopColor="#dc2626"
                  animate={{ stopColor: ["#dc2626", "#ef4444", "#dc2626"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.stop
                  offset="50%"
                  stopColor="#991b1b"
                  animate={{ stopColor: ["#991b1b", "#dc2626", "#991b1b"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <motion.stop
                  offset="100%"
                  stopColor="#7f1d1d"
                  animate={{ stopColor: ["#7f1d1d", "#991b1b", "#7f1d1d"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8 max-w-7xl mx-auto">
        {/* LOGO */}
        <motion.div variants={logoVariants} whileHover="">
          <Link href="/home" className="group relative inline-block" aria-label="Ir a Inicio">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 rounded-xl blur-lg"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative z-10 flex items-center gap-3 md:gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="shrink-0">
                <Image
                  src={LOGO_URL}
                  alt="Logo LCE"
                  width={40}
                  height={40}
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full ring-2 ring-white/60 transition group-hover:ring-red-200"
                  priority
                />
              </motion.div>
              <motion.span
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent"
                style={{ backgroundSize: "100% 100%" }}
                whileHover={{ backgroundSize: "200% 200%", backgroundPosition: "100% 0%" }}
              >
                La Casa del Embrague
              </motion.span>
            </div>
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </Link>
        </motion.div>

        {/* ---------- DESKTOP NAV ---------- */}
        <motion.nav className="hidden md:flex items-center gap-4" variants={containerVariants}>
          {/* ✅ Botones de texto pedidos */}
          <motion.div variants={itemVariants} whileHover="hover">
            <Link
              href="/home"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition"
            >
              Inicio
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover">
            <Link
              href="/about"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              Sobre nosotros
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover">
            <Link
              href="/contact"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Contacto
            </Link>
          </motion.div>

          {/* ✅ Proveedores + descarga Excel */}
          <motion.div className="flex items-center gap-2" variants={itemVariants} whileHover="hover">
            <Link
              href="/providers"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition"
            >
              Proveedores
            </Link>

            {/* Botón Descargar Excel (usa <a> para atributo download)
            <a
              href={PROVIDERS_EXCEL_URL}
              download
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border border-red-500/40 hover:border-red-400 bg-red-600/20 hover:bg-red-600/30 text-white transition"
              aria-label="Descargar Excel de proveedores"
              title="Descargar Excel de proveedores"
            >
              <Download className="w-4 h-4" />
              Excel
            </a> */}
          </motion.div>

          {/* ---------- Carrito ---------- */}
          <motion.div variants={itemVariants} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link href="/cart" className="relative group">
              <motion.div
                className="p-3 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-700/30 backdrop-blur-sm border border-red-500/30"
                whileHover={{ boxShadow: "0 0 30px rgba(220,38,38,0.5)", borderColor: "rgba(239,68,68,0.8)" }}
                animate={{ boxShadow: ["0 0 20px rgba(220,38,38,0.3)","0 0 30px rgba(220,38,38,0.5)","0 0 20px rgba(220,38,38,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div whileHover={{ rotate: [0, -10, 10, 0] }}>
                  <ShoppingCart className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>

              {itemCount > 0 && (
                <motion.div
                  className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center border-2 border-white px-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  whileHover={{ scale: 1.3 }}
                  key={`badge-${itemCount}-${Date.now()}`}
                >
                  <motion.span
                    className="text-xs font-bold text-white"
                    key={`number-${itemCount}-${Date.now()}`}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                </motion.div>
              )}

              {cartLoading && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}

              {itemCount > 0 && (
                <motion.div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  {itemCount} item{itemCount !== 1 ? "s" : ""} • ${total?.toFixed(2) || "0.00"}
                </motion.div>
              )}
            </Link>
          </motion.div>

          {/* ---------- Usuario ---------- */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.1 }} className="relative cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
                <motion.div
                  className="p-1 rounded-full bg-gradient-to-r from-red-500 to-red-700"
                  whileHover={{ boxShadow: "0 0 20px rgba(220,38,38,0.6)", scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Avatar className="w-10 h-10 cursor-pointer border-2 border-white">
                      <AvatarFallback className="bg-gradient-to-br from-white to-gray-100 text-black font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="absolute inset-0 border-2 border-red-400/30 rounded-full"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.name || "Usuario"}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <motion.button
                        whileHover={{ backgroundColor: "#f3f4f6", x: 4 }}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserCircle className="w-4 h-4 text-red-500" />
                        <Link href="/profile"><span className="text-sm font-medium">Mi Perfil</span></Link>
                      </motion.button>

                      <div className="border-t border-gray-100 my-1" />

                      <motion.button
                        whileHover={{ backgroundColor: "#fef2f2", x: 4 }}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors"
                        onClick={handleLogout}
                        disabled={loading}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">{loading ? "Cerrando..." : "Cerrar Sesión"}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/" className="relative group">
                <motion.div
                  className="px-4 py-2 rounded-xl bg-black text-white font-bold border-2 border-neutral-700 hover:border-neutral-500 transition-all duration-300 shadow-lg"
                  whileHover={{ boxShadow: "0 0 25px rgba(246, 59, 59, 0.6)" }}
                >
                  <motion.span className="flex items-center gap-2" whileHover={{ x: 2 }}>
                    <User className="w-4 h-4" />
                    Iniciar Sesión
                  </motion.span>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </motion.nav>

        {/* ---------- MOBILE NAV ---------- */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <motion.div className="md:hidden" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-red-600/30 relative overflow-hidden">
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-red-500/20 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 2, opacity: 0.5 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </SheetTrigger>

          <SheetContent side="left" className="w-[300px] bg-black border-r border-red-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black" />
            <SheetHeader className="border-b border-red-500/20 pb-4 relative z-10">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <SheetTitle className="text-white text-2xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text">
                  RepuStore
                </SheetTitle>
              </motion.div>
            </SheetHeader>

            <motion.div className="flex flex-col space-y-2 mt-6 relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {/* ✅ Inicio */}
              <Link
                href="/home"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 text-white font-medium p-3 rounded-xl hover:bg-white/10 transition"
              >
                🏠 <span className="text-lg">Inicio</span>
              </Link>

              {/* ✅ Sobre nosotros */}
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 text-white font-medium p-3 rounded-xl hover:bg-white/10 transition"
              >
                <Info className="w-5 h-5" />
                <span className="text-lg">Sobre nosotros</span>
              </Link>

              {/* ✅ Contacto */}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 text-white font-medium p-3 rounded-xl hover:bg-white/10 transition"
              >
                <Phone className="w-5 h-5" />
                <span className="text-lg">Contacto</span>
              </Link>

              {/* ✅ Proveedores + Descargar Excel */}
              <div className="mt-1 pt-3 border-t border-red-500/20 flex flex-col gap-2">
                <Link
                  href="/providers"
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 text-white font-medium p-3 rounded-xl hover:bg-white/10 transition"
                >
                  🧾 <span className="text-lg">Proveedores</span>
                </Link>

                <a
                  href={PROVIDERS_EXCEL_URL}
                  download
                  className="group flex items-center gap-3 text-white/90 font-medium p-3 rounded-xl border border-red-500/40 hover:border-red-400 bg-red-600/20 hover:bg-red-600/30 transition"
                  aria-label="Descargar Excel de proveedores"
                  title="Descargar Excel de proveedores"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-lg">Descargar Excel</span>
                </a>
              </div>

              {/* Carrito */}
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 text-white font-medium p-3 rounded-xl hover:bg-white/10 transition"
              >
                🛒 <span className="text-lg">Carrito {itemCount > 0 && `(${itemCount})`}</span>
                {itemCount > 0 && <span className="ml-auto text-sm opacity-80">${total?.toFixed(2) || "0.00"}</span>}
              </Link>

              {/* Usuario */}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 text-white font-medium p-3 rounded-xl hover:bg-white/10 transition"
                  >
                    👤 <span className="text-lg">Mi Perfil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="group flex items-center gap-3 text-white font-medium p-3 rounded-xl hover:bg-white/10 transition disabled:opacity-50 text-left"
                  >
                    🚪 <span className="text-lg">{loading ? "Cerrando..." : "Cerrar Sesión"}</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 text-white font-medium p-3 rounded-xl hover:bg-white/10 transition"
                >
                  🔐 <span className="text-lg">Iniciar Sesión</span>
                </Link>
              )}
            </motion.div>

            {/* Efectos de fondo en mobile */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-red-400/30 rounded-full"
                  animate={{ y: [0, -100], opacity: [0, 1, 0], x: Math.random() * 300 }}
                  transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Línea de energía inferior */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
        animate={{ opacity: [0.5, 1, 0.5], scaleX: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.header>
  )
}

export default Navbar
