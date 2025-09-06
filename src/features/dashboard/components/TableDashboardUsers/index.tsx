/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { JSX, useState } from "react"
import {
  Search,
  User as UserIcon,
  Mail,
  Calendar,
  MoreHorizontal,
  Plus,
  RefreshCw,
  AlertCircle,
  Trash2,
  Power,
  Ban,
  Shield,
  ShieldCheck,
  ShieldX,
  UserX,
  UserCheck,
  Crown,
} from "lucide-react"
import { UserRole, UserStatus, User } from "../../types/table-users"
import useUsers from "../../hooks/useTableUsers"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useUserActions } from "../../hooks/useBaneos"

const UsersTable: React.FC = () => {
  const {
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    searchUsers,
    refreshUsers,
    deleteUser,
    toggleUserStatus,
    setPage,
    clearError,
  } = useUsers({
    initialParams: { limit: 10 },
    autoFetch: true,
  })

  // Hook de acciones de usuario (baneos y admin)
  const {
    toggleBan,
    toggleAdmin,
    isLoading: userActionsLoading,
    canManageUsers,
    canManageAdmins,
    isClient,
    getBanStatusDisplay,
    getAdminStatusDisplay,
    getBanActionMessage,
    getAdminActionMessage,
  } = useUserActions()

  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [banActionLoading, setBanActionLoading] = useState<string | null>(null)
  const [adminActionLoading, setAdminActionLoading] = useState<string | null>(
    null
  )
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [userFilter, setUserFilter] = useState<"all" | "users" | "admins">(
    "all"
  )

  // Estados para controlar diálogos
  const [banDialogOpen, setBanDialogOpen] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)

  // Manejar búsqueda con debounce
  const handleSearch = async (term: string): Promise<void> => {
    setSearchTerm(term)
    if (term.length > 2 || term.length === 0) {
      await searchUsers(term)
    }
  }

  // Manejar baneo/desbaneo con control de diálogo
  // Función handleBanToggle corregida
  const handleBanToggle = async (user: any): Promise<void> => {
    console.log("🚫 DEBUG: Iniciando toggle ban para:", {
      userId: user.id,
      userIdType: typeof user.id,
      currentBanStatus: user.isBanned,
      currentLoadingState: banActionLoading,
    })

    // Prevenir múltiples clicks
    if (banActionLoading === user.id) {
      console.log("⚠️ DEBUG: Acción ya en progreso, ignorando click")
      return
    }

    setBanActionLoading(user.id)
    setBanDialogOpen(null) // Cerrar diálogo

    try {
      console.log("🔄 DEBUG: Llamando toggleBan...")
      const result = await toggleBan(user.id, user.isBanned)
      console.log("✅ DEBUG: Resultado del toggle ban:", result)

      if (result) {
        console.log("🔄 DEBUG: Refrescando usuarios...")
        // Pequeño delay para asegurar que el backend haya procesado el cambio
        await new Promise((resolve) => setTimeout(resolve, 500))
        await refreshUsers()
        console.log("✅ DEBUG: Usuarios refrescados exitosamente")
      } else {
        console.error("❌ ERROR: toggleBan devolvió false")
        // Aquí puedes mostrar un mensaje de error al usuario
      }
    } catch (err) {
      console.error("❌ Error al cambiar estado de baneo:", err)
      // Aquí puedes mostrar una notificación de error al usuario
    } finally {
      console.log("🔄 DEBUG: Limpiando estado de loading")
      setBanActionLoading(null)
    }
  }

  // También asegúrate de que tu hook useUserActions maneje correctamente los errores
  // y que toggleBan no esté causando side effects inesperados

  // Manejar promoción/degradación de admin
  const handleAdminToggle = async (user: any): Promise<void> => {
    setAdminActionLoading(user.id)

    try {
      const result = await toggleAdmin(user.id, user.isAdmin)
      if (result) {
        // Actualizar la lista de usuarios después del cambio de admin exitoso
        await refreshUsers()
      }
    } catch (err) {
      console.error("❌ Error al cambiar permisos de admin:", err)
    } finally {
      setAdminActionLoading(null)
    }
  }

  // Manejar cambio de estado
  const handleToggleStatus = async (
    userId: number,
    currentStatus: UserStatus
  ): Promise<void> => {
    // Lógica más completa para manejar todos los estados
    let newStatus: UserStatus

    switch (currentStatus) {
      case "active":
        newStatus = "inactive"
        break
      case "inactive":
      case "suspended":
        newStatus = "active"
        break
      case "pending":
        newStatus = "active"
        break
      default:
        newStatus = "active"
    }

    setActionLoading(userId)

    try {
      const success = await toggleUserStatus(userId, newStatus)
      if (success) {
        console.log("✅ Estado actualizado exitosamente")
      }
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err)
    } finally {
      setActionLoading(null)
    }
  }

  // Define ApiUser type based on expected user properties
  type ApiUser = {
    id: string
    name: string
    email: string
    isAdmin?: boolean
    isSuperAdmin?: boolean
    isBanned?: boolean
    isVerified?: boolean
    status?: UserStatus
  }

  // Filtrar usuarios según el filtro seleccionado
  const getFilteredUsers = () => {
    if (userFilter === "users") {
      return users.filter((user: any) => !user.isAdmin && !user.isSuperAdmin)
    }
    if (userFilter === "admins") {
      return users.filter((user: any) => user.isAdmin || user.isSuperAdmin)
    }
    return users // "all"
  }

  const filteredUsers = getFilteredUsers()

  // Componente mejorado para el estado con información de baneo
  const getUserStatusBadge = (user: ApiUser): JSX.Element => {
    if (user.isBanned) {
      return (
        <Badge
          variant="destructive"
          className="flex items-center gap-1"
        >
          <UserX className="h-3 w-3" />
          Baneado
        </Badge>
      )
    }

    if (user.isSuperAdmin) {
      return (
        <Badge
          variant="default"
          className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1"
        >
          <Shield className="h-3 w-3" />
          Super Admin
        </Badge>
      )
    }

    if (user.isAdmin) {
      return (
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-1"
        >
          <ShieldCheck className="h-3 w-3" />
          Admin
        </Badge>
      )
    }

    if (user.isVerified) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
        >
          <UserCheck className="h-3 w-3" />
          Verificado
        </Badge>
      )
    }

    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1"
      >
        <UserIcon className="h-3 w-3" />
        Usuario
      </Badge>
    )
  }

  // Componente de badge para el rol basado en los datos reales del backend
  const getRoleBadge = (user: any): JSX.Element => {
    if (user.isSuperAdmin) {
      return (
        <Badge
          variant="default"
          className="bg-gradient-to-r from-red-500 to-pink-600 text-white"
        >
          Super Admin
        </Badge>
      )
    }

    if (user.isAdmin) {
      return (
        <Badge
          variant="default"
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
        >
          Admin
        </Badge>
      )
    }

    return <Badge variant="outline">Usuario</Badge>
  }

  // Props para el componente de error
  interface ErrorMessageProps {
    message: string
    onClose: () => void
  }

  // Componente de error
  const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Debug temporal - agregar más info
  React.useEffect(() => {
    console.log("🔍 Estado del componente:", {
      users: users.length,
      loading,
      error,
      totalUsers,
      currentPage,
      canManageUsers,
      canManageAdmins,
      isClient,
      banActionLoading, // ← Agregar esto
      adminActionLoading, // ← Y esto
    })
  }, [
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    canManageUsers,
    canManageAdmins,
    isClient,
    banActionLoading,
    adminActionLoading,
  ])

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Usuarios</h3>
          <p className="text-sm text-gray-500 mt-1">Cargando usuarios...</p>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Gestión de Usuarios
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Administra usuarios, roles y control de acceso del sistema
              </p>
            </div>
            {/* Solo mostrar el badge si estamos en el cliente */}
            {isClient && (canManageUsers || canManageAdmins) && (
              <div className="flex items-center gap-2">
                {canManageUsers && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {canManageAdmins && (
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Super Admin
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Barra de búsqueda, filtros y acciones */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSearch(e.target.value)
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Filtro de usuarios */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[120px]"
                >
                  {userFilter === "all" && (
                    <>
                      <UserIcon className="h-4 w-4 mr-2" />
                      Todos ({users.length})
                    </>
                  )}
                  {userFilter === "users" && (
                    <>
                      <UserIcon className="h-4 w-4 mr-2" />
                      Usuarios (
                      {
                        users.filter((u: any) => !u.isAdmin && !u.isSuperAdmin)
                          .length
                      }
                      )
                    </>
                  )}
                  {userFilter === "admins" && (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Admins (
                      {
                        users.filter((u: any) => u.isAdmin || u.isSuperAdmin)
                          .length
                      }
                      )
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setUserFilter("all")}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Todos los usuarios ({users.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUserFilter("users")}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Solo usuarios normales (
                  {
                    users.filter((u: any) => !u.isAdmin && !u.isSuperAdmin)
                      .length
                  }
                  )
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUserFilter("admins")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Solo administradores (
                  {users.filter((u: any) => u.isAdmin || u.isSuperAdmin).length}
                  )
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={refreshUsers}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <ErrorMessage
              message={error}
              onClose={clearError}
            />
          )}

          {/* Tabla de usuarios */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      {loading
                        ? "Buscando usuarios..."
                        : userFilter === "users"
                        ? "No se encontraron usuarios normales"
                        : userFilter === "admins"
                        ? "No se encontraron administradores"
                        : "No se encontraron usuarios"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: any) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        user.isBanned ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                user.isBanned
                                  ? "bg-red-100 border-2 border-red-300"
                                  : "bg-gray-200"
                              }`}
                            >
                              {user.isBanned ? (
                                <UserX className="h-5 w-5 text-red-600" />
                              ) : (
                                <UserIcon className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div
                              className={`text-sm font-medium ${
                                user.isBanned ? "text-red-900" : "text-gray-900"
                              }`}
                            >
                              {user.name}
                              {user.isBanned && (
                                <span className="ml-2 text-xs text-red-600 font-normal">
                                  (Baneado)
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUserStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Dropdown Menu con todas las acciones */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-56"
                            >
                              <DropdownMenuLabel>
                                Acciones de Usuario
                              </DropdownMenuLabel>

                              {/* Acción de Ban/Unban - Solo si tiene permisos */}
                              {isClient &&
                                canManageUsers &&
                                !user.isSuperAdmin && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          className={`cursor-pointer ${
                                            user.isBanned
                                              ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                              : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                          }`}
                                          onSelect={(e) => e.preventDefault()}
                                        >
                                          {user.isBanned ? (
                                            <>
                                              <UserCheck className="mr-2 h-4 w-4" />
                                              Desbanear usuario
                                            </>
                                          ) : (
                                            <>
                                              <Ban className="mr-2 h-4 w-4" />
                                              Banear usuario
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="flex items-center gap-2">
                                            {user.isBanned ? (
                                              <>
                                                <UserCheck className="h-5 w-5 text-green-600" />
                                                Desbanear Usuario
                                              </>
                                            ) : (
                                              <>
                                                <Ban className="h-5 w-5 text-red-600" />
                                                Banear Usuario
                                              </>
                                            )}
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            {user.isBanned
                                              ? `¿Estás seguro que deseas desbanear a "${user.name}"? El usuario podrá acceder nuevamente al sistema.`
                                              : `¿Estás seguro que deseas banear a "${user.name}"? El usuario no podrá acceder al sistema hasta que sea desbaneado.`}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancelar
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleBanToggle(user)
                                            }
                                            disabled={
                                              banActionLoading === user.id
                                            }
                                            className={
                                              user.isBanned
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-red-600 hover:bg-red-700"
                                            }
                                          >
                                            {banActionLoading === user.id ? (
                                              <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Procesando...
                                              </>
                                            ) : user.isBanned ? (
                                              "Sí, desbanear"
                                            ) : (
                                              "Sí, banear"
                                            )}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}

                              {/* Acción de Promover/Degradar Admin - Solo SuperAdmin */}
                              {isClient &&
                                canManageAdmins &&
                                !user.isSuperAdmin && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          className={`cursor-pointer ${
                                            user.isAdmin
                                              ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                              : "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                          }`}
                                          onSelect={(e) => e.preventDefault()}
                                        >
                                          {user.isAdmin ? (
                                            <>
                                              <ShieldX className="mr-2 h-4 w-4" />
                                              Quitar permisos de Admin
                                            </>
                                          ) : (
                                            <>
                                              <Crown className="mr-2 h-4 w-4" />
                                              Promover a Admin
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="flex items-center gap-2">
                                            {user.isAdmin ? (
                                              <>
                                                <ShieldX className="h-5 w-5 text-orange-600" />
                                                Quitar Permisos de Admin
                                              </>
                                            ) : (
                                              <>
                                                <Crown className="h-5 w-5 text-purple-600" />
                                                Promover a Admin
                                              </>
                                            )}
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="space-y-2">
                                            {user.isAdmin ? (
                                              <>
                                                <p>
                                                  ¿Estás seguro que deseas
                                                  quitar los permisos de
                                                  administrador a{" "}
                                                  <strong>{user.name}</strong>?
                                                </p>
                                                <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded border">
                                                  ⚠️ El usuario perderá acceso a
                                                  todas las funciones de
                                                  administración.
                                                </p>
                                              </>
                                            ) : (
                                              <>
                                                <p>
                                                  ¿Estás seguro que deseas
                                                  promover a{" "}
                                                  <strong>{user.name}</strong>{" "}
                                                  como administrador?
                                                </p>
                                                <p className="text-sm text-purple-600 bg-purple-50 p-2 rounded border">
                                                  👑 El usuario tendrá acceso a
                                                  funciones de administración,
                                                  incluyendo gestión de
                                                  usuarios.
                                                </p>
                                              </>
                                            )}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancelar
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleAdminToggle(user)
                                            }
                                            disabled={
                                              adminActionLoading === user.id
                                            }
                                            className={
                                              user.isAdmin
                                                ? "bg-orange-600 hover:bg-orange-700"
                                                : "bg-purple-600 hover:bg-purple-700"
                                            }
                                          >
                                            {adminActionLoading === user.id ? (
                                              <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Procesando...
                                              </>
                                            ) : user.isAdmin ? (
                                              "Sí, quitar permisos"
                                            ) : (
                                              "Sí, promover"
                                            )}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* AlertDialog para Ban/Unban - FUERA del DropdownMenu */}
                          <AlertDialog
                            open={banDialogOpen === user.id}
                            onOpenChange={(open) =>
                              !open && setBanDialogOpen(null)
                            }
                          >
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  {user.isBanned ? (
                                    <>
                                      <UserCheck className="h-5 w-5 text-green-600" />
                                      Desbanear Usuario
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="h-5 w-5 text-red-600" />
                                      Banear Usuario
                                    </>
                                  )}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {user.isBanned
                                    ? `¿Estás seguro que deseas desbanear a "${user.name}"? El usuario podrá acceder nuevamente al sistema.`
                                    : `¿Estás seguro que deseas banear a "${user.name}"? El usuario no podrá acceder al sistema hasta que sea desbaneado.`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleBanToggle(user)}
                                  disabled={banActionLoading === user.id}
                                  className={
                                    user.isBanned
                                      ? "bg-green-600 hover:bg-green-700"
                                      : "bg-red-600 hover:bg-red-700"
                                  }
                                >
                                  {banActionLoading === user.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Procesando...
                                    </>
                                  ) : user.isBanned ? (
                                    "Sí, desbanear"
                                  ) : (
                                    "Sí, banear"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* AlertDialog para Admin - FUERA del DropdownMenu */}
                          <AlertDialog
                            open={deleteDialogOpen === user.id}
                            onOpenChange={(open) =>
                              !open && setDeleteDialogOpen(null)
                            }
                          >
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  {user.isAdmin ? (
                                    <>
                                      <ShieldX className="h-5 w-5 text-orange-600" />
                                      Quitar Permisos de Admin
                                    </>
                                  ) : (
                                    <>
                                      <Crown className="h-5 w-5 text-purple-600" />
                                      Promover a Admin
                                    </>
                                  )}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                  {user.isAdmin ? (
                                    <>
                                      <p>
                                        ¿Estás seguro que deseas quitar los
                                        permisos de administrador a{" "}
                                        <strong>{user.name}</strong>?
                                      </p>
                                      <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded border">
                                        ⚠️ El usuario perderá acceso a todas las
                                        funciones de administración.
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p>
                                        ¿Estás seguro que deseas promover a{" "}
                                        <strong>{user.name}</strong> como
                                        administrador?
                                      </p>
                                      <p className="text-sm text-purple-600 bg-purple-50 p-2 rounded border">
                                        👑 El usuario tendrá acceso a funciones
                                        de administración, incluyendo gestión de
                                        usuarios.
                                      </p>
                                    </>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleAdminToggle(user)}
                                  disabled={adminActionLoading === user.id}
                                  className={
                                    user.isAdmin
                                      ? "bg-orange-600 hover:bg-orange-700"
                                      : "bg-purple-600 hover:bg-purple-700"
                                  }
                                >
                                  {adminActionLoading === user.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Procesando...
                                    </>
                                  ) : user.isAdmin ? (
                                    "Sí, quitar permisos"
                                  ) : (
                                    "Sí, promover"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500 flex items-center gap-4">
              <span>
                Mostrando {filteredUsers.length} de {totalUsers} usuarios
              </span>
              {userFilter !== "all" && (
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  Filtro:{" "}
                  {userFilter === "users"
                    ? "Solo usuarios"
                    : userFilter === "admins"
                    ? "Solo admins"
                    : ""}
                </Badge>
              )}
              {canManageUsers && isClient && (
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              {canManageAdmins && isClient && (
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setPage(currentPage - 1)}
                disabled={!hasPrevPage || loading}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                onClick={() => setPage(currentPage + 1)}
                disabled={!hasNextPage || loading}
                variant="outline"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersTable
