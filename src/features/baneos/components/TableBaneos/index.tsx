"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Ban,
  UserCheck,
  Shield,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react"
import { useUserBan, useUsers } from "../../hooks/useBaneos"

interface BanDialogData {
  userId: string
  userName: string
  currentStatus: boolean
}

export default function UsersBanTable() {
  const { users, isLoading, error, refetch, pagination } = useUsers()
  const { toggleBan, isLoading: isBanning } = useUserBan(() => {
    refetch()
  })

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "banned" | "active">(
    "all"
  )
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all")

  // Estado para el diálogo de confirmación
  const [banDialog, setBanDialog] = useState<BanDialogData | null>(null)

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "banned" && user.isBanned) ||
      (statusFilter === "active" && !user.isBanned)

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && (user.isAdmin || user.isSuperAdmin)) ||
      (roleFilter === "user" && !user.isAdmin && !user.isSuperAdmin)

    return matchesSearch && matchesStatus && matchesRole
  })

  const handleBanClick = (user: any) => {
    setBanDialog({
      userId: user.id,
      userName: user.name,
      currentStatus: user.isBanned,
    })
  }

  const handleBanConfirm = async () => {
    if (!banDialog) return

    await toggleBan(banDialog.userId)
    setBanDialog(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (user: any) => {
    if (user.isSuperAdmin) {
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">
          <Shield className="w-3 h-3 mr-1" />
          Super Admin
        </Badge>
      )
    }
    if (user.isAdmin) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
          <ShieldAlert className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      )
    }
    return (
      <Badge
        variant="secondary"
        className="bg-gray-100 text-gray-700"
      >
        Usuario
      </Badge>
    )
  }

  const getStatusBadge = (isBanned: boolean) => {
    if (isBanned) {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 border-red-200"
        >
          <Ban className="w-3 h-3 mr-1" />
          Baneado
        </Badge>
      )
    }
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
        <UserCheck className="w-3 h-3 mr-1" />
        Activo
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Cargando usuarios...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="text-red-600 font-medium">
                Error al cargar usuarios
              </div>
              <div className="text-gray-600 text-sm">{error}</div>
              <Button
                onClick={refetch}
                variant="outline"
              >
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Gestión de Usuarios
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg mt-1">
                Administra los baneos y permisos de usuarios del sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email, país o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={roleFilter}
                onValueChange={(value: any) => setRoleFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="user">Usuarios</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contador de filtros */}
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            Mostrando{" "}
            <span className="font-semibold text-blue-600">
              {filteredUsers.length}
            </span>{" "}
            de <span className="font-semibold">{users.length}</span> usuarios
          </div>
        </CardContent>
      </Card>

      {/* Vista de tarjetas */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                  ? "No se encontraron usuarios que coincidan con los filtros"
                  : "No hay usuarios disponibles"}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-1">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    {/* Usuario info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-16 w-16 ring-2 ring-blue-100">
                        <AvatarImage
                          src={user.imgUrl || undefined}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-lg">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {user.name}
                          </h3>
                          <p className="text-gray-600">{user.email}</p>
                          {user.phone && (
                            <p className="text-sm text-gray-500">
                              {user.phone}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {getRoleBadge(user)}
                          {getStatusBadge(user.isBanned)}
                          {user.isVerified ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Verificado
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800 border-yellow-200"
                            >
                              Pendiente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div className="lg:text-center lg:mx-8 lg:min-w-[150px]">
                      <div className="text-sm font-medium text-gray-900">
                        {user.city || "Ciudad N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.country || "País N/A"}
                      </div>
                      {user.address && (
                        <div
                          className="text-xs text-gray-400 mt-1 max-w-[150px] truncate"
                          title={user.address}
                        >
                          {user.address}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end lg:justify-center">
                      <Button
                        variant={user.isBanned ? "default" : "destructive"}
                        size="sm"
                        onClick={() => handleBanClick(user)}
                        disabled={isBanning || user.isSuperAdmin}
                        className={`min-w-[120px] h-10 font-medium ${
                          user.isBanned
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        } ${
                          user.isSuperAdmin
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {isBanning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.isBanned ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activar
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-2" />
                            Banear
                          </>
                        )}
                      </Button>
                      {user.isSuperAdmin && (
                        <div className="ml-2 text-xs text-gray-400 self-center">
                          Protegido
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      <Card className="shadow-md">
        <CardContent className="flex items-center justify-between pt-6">
          <div className="text-sm text-gray-600">
            Página {pagination.page} de{" "}
            {Math.ceil(pagination.total / pagination.limit)}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-50"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded">
              {pagination.page}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-50"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <AlertDialog
        open={!!banDialog}
        onOpenChange={() => setBanDialog(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              {banDialog?.currentStatus ? (
                <>
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span>Activar Usuario</span>
                </>
              ) : (
                <>
                  <Ban className="h-5 w-5 text-red-600" />
                  <span>Banear Usuario</span>
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {banDialog?.currentStatus
                ? `¿Estás seguro de que quieres activar a "${banDialog?.userName}"? El usuario podrá acceder nuevamente al sistema y realizar todas las acciones permitidas.`
                : `¿Estás seguro de que quieres banear a "${banDialog?.userName}"? El usuario no podrá acceder al sistema hasta que sea reactivado.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-100">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanConfirm}
              className={`${
                banDialog?.currentStatus
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              } text-white font-medium`}
            >
              {banDialog?.currentStatus ? (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activar Usuario
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Banear Usuario
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
