export interface User {
  id: string
  name: string
  email: string
  password: string
  phone: string | null
  country: string | null
  address: string | null
  city: string | null
  imgUrl: string | null
  isAdmin: boolean
  isSuperAdmin: boolean
  isBanned: boolean
  isVerified: boolean
  verificationToken: string | null
}

export interface ToggleBanResponse {
  message: string
  user: User
}

export interface UsersResponse {
  total: number
  page: number
  limit: number
  data: User[]
}
