/* eslint-disable @typescript-eslint/no-explicit-any */
// types/user.ts

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt?: string
  avatar?: string | null
  lastLoginAt?: string
  emailVerifiedAt?: string
}

export type UserRole = "Admin" | "Moderator" | "User"

export type UserStatus = "active" | "inactive" | "pending" | "suspended"

export interface CreateUserRequest {
  name: string
  email: string
  role: UserRole
  password: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: UserRole
  status?: UserStatus
}

export interface UsersResponse {
  total: number
  page: number
  limit: number
  data: User[]
}

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: UserStatus
  sortBy?: "name" | "email" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: Record<string, any>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: ApiError[]
}

