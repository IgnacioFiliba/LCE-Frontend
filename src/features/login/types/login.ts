// types/auth.ts
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone: number
  country: string
  address: string
  city: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    phone: number
    country: string
    address: string
    city: string
    isAdmin: boolean
    isSuperAdmin: boolean
  }
}

export interface User {
  id: string
  name: string
  email: string
  phone: number
  country: string
  address: string
  city: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  country: string
  address: string
  city: string
}
