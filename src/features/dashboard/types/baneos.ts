// types/userActions.ts
export interface User {
  id: string
  name: string
  email: string
  password: string
  phone: string
  country: string
  address: string
  city: string
  imgUrl: string
  isAdmin: boolean
  isSuperAdmin: boolean
  isBanned: boolean
  isVerified: boolean
  verificationToken: string | null
}

export interface UserActionResponse {
  message: string
  user: User
}

export interface UserActionRequest {
  userId: string
}

export interface UserActionError {
  message: string
  error?: string
  statusCode?: number
}

// Tipos específicos para las acciones
export type UserAction = "ban" | "admin"

export interface ActionResult {
  success: boolean
  user?: User
  message?: string
  error?: string
}