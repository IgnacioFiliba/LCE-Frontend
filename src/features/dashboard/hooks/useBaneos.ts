// hooks/useUserActions.ts
import { useState, useEffect } from "react"

import { toast } from "sonner" // o el sistema de toast que uses
import { UserActionResponse } from "../types/baneos"
import { userActionsService } from "../services/baneos-service"

interface UseUserActionsState {
  isLoading: boolean
  error: string | null
  canManageUsers: boolean
  canManageAdmins: boolean
  isClient: boolean
}

interface UseUserActionsReturn extends UseUserActionsState {
  toggleBan: (
    userId: string,
    currentBanStatus: boolean
  ) => Promise<UserActionResponse | null>
  toggleAdmin: (
    userId: string,
    currentAdminStatus: boolean
  ) => Promise<UserActionResponse | null>
  getBanStatusDisplay: (isBanned: boolean) => {
    status: string
    variant: "default" | "destructive" | "secondary"
    text: string
  }
  getAdminStatusDisplay: (isAdmin: boolean) => {
    status: string
    variant: "default" | "destructive" | "secondary"
    text: string
  }
  getBanActionMessage: (isBanned: boolean) => string
  getAdminActionMessage: (isAdmin: boolean) => string
  clearError: () => void
}

export function useUserActions(): UseUserActionsReturn {
  const [state, setState] = useState<UseUserActionsState>({
    isLoading: false,
    error: null,
    canManageUsers: false,
    canManageAdmins: false,
    isClient: false,
  })

  // useEffect para manejar la hidratación correctamente
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isClient: true,
      canManageUsers: userActionsService.canManageUsers(),
      canManageAdmins: userActionsService.canManageAdmins(),
    }))
  }, [])

  const toggleBan = async (
    userId: string,
    currentBanStatus: boolean
  ): Promise<UserActionResponse | null> => {
    console.log("🚫 useUserActions: Starting ban toggle", {
      userId,
      currentBanStatus,
    })

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }))

    try {
      const result = await userActionsService.toggleBan(userId)

      console.log("✅ useUserActions: Ban toggle successful", result)

      // Mostrar toast de éxito
      const actionText = currentBanStatus ? "desbaneado" : "baneado"
      toast.success(`Usuario ${actionText} exitosamente`, {
        description: result.message,
      })

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }))

      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido"

      console.error("❌ useUserActions: Ban toggle failed", errorMessage)

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))

      // Mostrar toast de error
      toast.error("Error al cambiar estado de baneo", {
        description: errorMessage,
      })

      return null
    }
  }

  const toggleAdmin = async (
    userId: string,
    currentAdminStatus: boolean
  ): Promise<UserActionResponse | null> => {
    console.log("👑 useUserActions: Starting admin toggle", {
      userId,
      currentAdminStatus,
    })

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }))

    try {
      const result = await userActionsService.toggleAdmin(userId)

      console.log("✅ useUserActions: Admin toggle successful", result)

      // Mostrar toast de éxito
      const actionText = currentAdminStatus
        ? "removidos los permisos de admin"
        : "promovido a admin"
      toast.success(`Usuario ${actionText} exitosamente`, {
        description: result.message,
      })

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }))

      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido"

      console.error("❌ useUserActions: Admin toggle failed", errorMessage)

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))

      // Mostrar toast de error
      toast.error("Error al cambiar permisos de admin", {
        description: errorMessage,
      })

      return null
    }
  }

  const clearError = () => {
    setState((prev) => ({
      ...prev,
      error: null,
    }))
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    canManageUsers: state.canManageUsers,
    canManageAdmins: state.canManageAdmins,
    isClient: state.isClient,
    toggleBan,
    toggleAdmin,
    getBanStatusDisplay: userActionsService.getBanStatusDisplay,
    getAdminStatusDisplay: userActionsService.getAdminStatusDisplay,
    getBanActionMessage: userActionsService.getBanActionMessage,
    getAdminActionMessage: userActionsService.getAdminActionMessage,
    clearError,
  }
}
