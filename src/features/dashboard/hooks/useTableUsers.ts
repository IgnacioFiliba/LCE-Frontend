// hooks/useUsers.ts

import { useState, useEffect, useCallback, useMemo } from "react"
import UserService from "../services/service-table"
import {
  User,
  GetUsersParams,
  CreateUserRequest,
  UpdateUserRequest,
  UserStatus,
} from "../types/table-users"

interface UseUsersState {
  users: User[]
  loading: boolean
  error: string | null
  totalUsers: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface UseUsersActions {
  fetchUsers: (params?: GetUsersParams) => Promise<void>
  createUser: (userData: CreateUserRequest) => Promise<boolean>
  updateUser: (id: number, userData: UpdateUserRequest) => Promise<boolean>
  deleteUser: (id: number) => Promise<boolean>
  toggleUserStatus: (id: number, status: UserStatus) => Promise<boolean>
  searchUsers: (searchTerm: string) => Promise<void>
  refreshUsers: () => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: Partial<GetUsersParams>) => void
  clearError: () => void
}

interface UseUsersOptions {
  initialParams?: GetUsersParams
  autoFetch?: boolean
}

export const useUsers = (
  options: UseUsersOptions = {}
): UseUsersState & UseUsersActions => {
  const { initialParams = {}, autoFetch = true } = options

  const [state, setState] = useState<UseUsersState>({
    users: [],
    loading: false,
    error: null,
    totalUsers: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const [filters, setFiltersState] = useState<GetUsersParams>(initialParams)

  // Función para actualizar el estado
  const updateState = useCallback((updates: Partial<UseUsersState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  // Función principal para obtener usuarios
  const fetchUsers = useCallback(
    async (params: GetUsersParams = {}) => {
      updateState({ loading: true, error: null })

      try {
        const finalParams = { ...filters, ...params }
        const response = await UserService.getUsers(finalParams)

        updateState({
          users: response.data,
          totalUsers: response.total, // ✅ Correcto
          currentPage: response.page, // ✅ Correcto
          totalPages: Math.ceil(response.total / (response.limit || 10)), // ✅ Calculado
          hasNextPage: response.page * response.limit < response.total, // ✅ Calculado
          hasPrevPage: response.page > 1, // ✅ Correcto
          loading: false,
        })
      } catch (error) {
        updateState({
          loading: false,
          error:
            error instanceof Error ? error.message : "Error al cargar usuarios",
        })
      }
    },
    [filters, updateState]
  )

  // Crear usuario
  const createUser = useCallback(
    async (userData: CreateUserRequest): Promise<boolean> => {
      updateState({ loading: true, error: null })

      try {
        await UserService.createUser(userData)
        await fetchUsers() // Refrescar la lista
        updateState({ loading: false })
        return true
      } catch (error) {
        updateState({
          loading: false,
          error:
            error instanceof Error ? error.message : "Error al crear usuario",
        })
        return false
      }
    },
    [fetchUsers, updateState]
  )

  // Actualizar usuario
  const updateUser = useCallback(
    async (id: number, userData: UpdateUserRequest): Promise<boolean> => {
      updateState({ error: null })

      try {
        await UserService.updateUser(id, userData)

        // Actualizar el usuario en el estado local
        setState((prev) => ({
          ...prev,
          users: prev.users.map((user) =>
            user.id === id ? { ...user, ...userData } : user
          ),
        }))

        return true
      } catch (error) {
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Error al actualizar usuario",
        })
        return false
      }
    },
    [updateState]
  )

  // Eliminar usuario
  const deleteUser = useCallback(
    async (id: number): Promise<boolean> => {
      updateState({ error: null })

      try {
        await UserService.deleteUser(id)

        // Remover el usuario del estado local
        setState((prev) => ({
          ...prev,
          users: prev.users.filter((user) => user.id !== id),
          totalUsers: prev.totalUsers - 1,
        }))

        return true
      } catch (error) {
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Error al eliminar usuario",
        })
        return false
      }
    },
    [updateState]
  )

  // Cambiar estado del usuario
  const toggleUserStatus = useCallback(
    async (id: number, status: UserStatus): Promise<boolean> => {
      updateState({ error: null })

      try {
        await UserService.toggleUserStatus(id, status as "active" | "inactive")

        // Actualizar el estado del usuario localmente
        setState((prev) => ({
          ...prev,
          users: prev.users.map((user) =>
            user.id === id ? { ...user, status } : user
          ),
        }))

        return true
      } catch (error) {
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Error al cambiar estado del usuario",
        })
        return false
      }
    },
    [updateState]
  )

  // Buscar usuarios
  const searchUsers = useCallback(
    async (searchTerm: string) => {
      await fetchUsers({ search: searchTerm, page: 1 })
    },
    [fetchUsers]
  )

  // Refrescar usuarios
  const refreshUsers = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  // Cambiar página
  const setPage = useCallback(
    (page: number) => {
      fetchUsers({ page })
    },
    [fetchUsers]
  )

  // Actualizar filtros
  const setFilters = useCallback(
    (newFilters: Partial<GetUsersParams>) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFiltersState(updatedFilters)
      fetchUsers(updatedFilters)
    },
    [filters, fetchUsers]
  )

  // Limpiar error
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  // Obtener usuarios automáticamente al montar el componente
  useEffect(() => {
    if (autoFetch) {
      fetchUsers()
    }
  }, []) // Solo se ejecuta una vez al montar

  // Datos derivados con useMemo para optimización
  const derivedData = useMemo(
    () => ({
      isEmpty: state.users.length === 0 && !state.loading,
      activeUsers: state.users.filter((user) => user.status === "active"),
      inactiveUsers: state.users.filter((user) => user.status === "inactive"),
      pendingUsers: state.users.filter((user) => user.status === "pending"),
      adminUsers: state.users.filter((user) => user.role === "Admin"),
    }),
    [state.users, state.loading]
  )

  return {
    // Estado
    ...state,
    ...derivedData,

    // Acciones
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    searchUsers,
    refreshUsers,
    setPage,
    setFilters,
    clearError,
  }
}

export default useUsers
