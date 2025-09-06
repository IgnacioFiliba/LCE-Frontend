export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  birthDate?: string
  joinDate: string
  avatar?: string
  isAdmin: boolean
  isSuperAdmin?: boolean
  avatarResolved?: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
  birthDate?: string
  avatar?: string
}

export interface UserStats {
  orderCount: number
  favoriteCount: number
  points: number
}

export interface GetUserResponse {
  success: boolean
  data: UserProfile
  message?: string
}

export interface UpdateUserResponse {
  success: boolean
  data: UserProfile
  message?: string
}
