/* eslint-disable @typescript-eslint/no-explicit-any */
// services/userService.ts



//importaciones del servicio

import {
  GetUsersParams,
  UsersResponse,
  ApiResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/table-users"

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pf-grupo5-8.onrender.com"

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    const token = localStorage.getItem("token")
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("API Request failed:", error)
      throw error
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : ""
    return this.request<T>(`${endpoint}${queryParams}`, {
      method: "GET",
    })
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }
}

const apiClient = new ApiClient(API_BASE_URL)

export class UserService {
  /**
   * Obtiene la lista de usuarios con filtros opcionales
   */
  static async getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
    const queryParams: Record<string, string> = {}

    if (params.page) queryParams.page = params.page.toString()
    if (params.limit) queryParams.limit = params.limit.toString()
    if (params.search) queryParams.search = params.search
    if (params.role) queryParams.role = params.role
    if (params.status) queryParams.status = params.status
    if (params.sortBy) queryParams.sortBy = params.sortBy
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder

    return apiClient.get<UsersResponse>("/users", queryParams)
  }

  /**
   * Obtiene un usuario por su ID
   */
  static async getUserById(id: number): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>(`/users/${id}`)
  }

  /**
   * Crea un nuevo usuario
   */
  static async createUser(
    userData: CreateUserRequest
  ): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>("/users", userData)
  }

  /**
   * Actualiza un usuario existente
   */
  static async updateUser(
    id: number,
    userData: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    return apiClient.put<ApiResponse<User>>(`/users/${id}`, userData)
  }

  /**
   * Elimina un usuario
   */
  static async deleteUser(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/users/${id}`)
  }

  /**
   * Cambia el estado de un usuario
   */
  static async toggleUserStatus(
    id: number,
    status: "active" | "inactive"
  ): Promise<ApiResponse<User>> {
    return apiClient.put<ApiResponse<User>>(`/users/${id}/status`, { status })
  }

  /**
   * Busca usuarios por término de búsqueda
   */
  static async searchUsers(searchTerm: string): Promise<UsersResponse> {
    return this.getUsers({
      search: searchTerm,
      limit: 50,
    })
  }
}

export default UserService
