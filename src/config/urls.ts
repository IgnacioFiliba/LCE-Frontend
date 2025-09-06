// config/urls.ts - Configuración para Next.js

interface URLConfig {
  API_URL: string
  BASE_URL: string
  isDevelopment: boolean
  isProduction: boolean
}

// ✅ CONFIGURACIÓN AUTOMÁTICA PARA NEXT.JS
const getURLConfig = (): URLConfig => {
  // En Next.js, process.env.NODE_ENV siempre está disponible
  const isDevelopment = process.env.NODE_ENV === "development"
  const isProduction = process.env.NODE_ENV === "production"

  // ✅ SOLO HACER LOG EN EL CLIENTE (evitar hidration issues)
  if (typeof window !== "undefined") {
    console.log("🔧 Environment detected:", process.env.NODE_ENV)
    console.log("🔧 Is Development:", isDevelopment)
    console.log("🔧 Is Production:", isProduction)
  }

  if (isDevelopment) {
    // ✅ DESARROLLO - URLs locales
    return {
      API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      isDevelopment: true,
      isProduction: false,
    }
  } else {
    // ✅ PRODUCCIÓN - URLs deployed
    return {
      API_URL:
        process.env.NEXT_PUBLIC_API_URL || "https://pf-grupo5-8.onrender.com",
      BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "https://pf-05.vercel.app/",
      isDevelopment: false,
      isProduction: true,
    }
  }
}

// ✅ CONFIGURACIÓN GLOBAL
export const config = getURLConfig()

// ✅ HELPER FUNCTIONS OPTIMIZADAS PARA NEXT.JS
export const getApiUrl = (endpoint: string = ""): string => {
  const baseUrl = config.API_URL
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const url = endpoint ? `${baseUrl}${cleanEndpoint}` : baseUrl

  // ✅ SOLO LOG EN CLIENTE
  if (typeof window !== "undefined") {
    console.log(`🌐 API URL: ${url}`)
  }

  return url
}

export const getBaseUrl = (path: string = ""): string => {
  const baseUrl = config.BASE_URL
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  const url = path ? `${baseUrl}${cleanPath}` : baseUrl

  // ✅ SOLO LOG EN CLIENTE
  if (typeof window !== "undefined") {
    console.log(`🏠 Base URL: ${url}`)
  }

  return url
}

// ✅ FUNCIÓN PARA VERIFICAR ENTORNO
export const isDev = () => config.isDevelopment
export const isProd = () => config.isProduction

// ✅ LOGGING PARA DEBUG (solo en cliente)
if (typeof window !== "undefined") {
  console.log("🎯 URL Configuration:", {
    environment: process.env.NODE_ENV,
    apiUrl: config.API_URL,
    baseUrl: config.BASE_URL,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
  })
}

export default config
