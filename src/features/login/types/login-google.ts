export interface GoogleAuthResponse {
  success: boolean
  user: {
    id: string
    email: string
    name: string
    picture?: string
    given_name?: string
    family_name?: string
  }
  token: string
  refreshToken?: string
}

export interface AuthError {
  message: string
  status: number
}

export interface AuthState {
  user: GoogleAuthResponse["user"] | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
