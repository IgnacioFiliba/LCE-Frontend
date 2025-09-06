import { toast } from "sonner" // o el toast que uses

interface UseUserBanReturn {
  toggleBan: (userId: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useUserBan(
  onSuccess?: (response: ToggleBanResponse) => void
): UseUserBanReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleBan = async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await userService.toggleUserBan(userId) // Instancia en lugar de método estático

      // Toast de éxito
      toast.success("Usuario baneado/activado exitosamente")

      // Callback opcional para actualizar la UI
      onSuccess?.(response)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      toast.error(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    toggleBan,
    isLoading,
    error,
  }
}

// hooks/useUsers.ts

import { ToggleBanResponse, User, UsersResponse } from "../types/baneos"
import { useEffect, useState } from "react"
import { userService } from "../services/baneos-service"

interface UseUsersReturn {
  users: User[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  pagination: {
    total: number
    page: number
    limit: number
  }
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response: UsersResponse = await userService.getUsers()

      // Extraer los usuarios del array 'data'
      setUsers(response.data)

      // Guardar info de paginación
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    pagination,
  }
}
