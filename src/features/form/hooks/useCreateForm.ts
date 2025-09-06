/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useCreateProductClean.ts
import { useState } from "react"

import { CreateProductResponseClean } from "../types/productClean"
import { productServiceClean } from "../services/create"

interface UseCreateProductCleanReturn {
  loading: boolean
  error: string | null
  success: boolean
  createProduct: (
    data: FormData // ✅ CAMBIAR DE CreateProductClean A FormData
  ) => Promise<CreateProductResponseClean>
  clearStatus: () => void
}

export const useCreateProductClean = (): UseCreateProductCleanReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createProduct = async (
    data: FormData // ✅ CAMBIAR EL TIPO AQUÍ TAMBIÉN
  ): Promise<CreateProductResponseClean> => {
    console.log("🎯 Hook Clean - Starting creation with FormData")

    // ✅ DEBUG: Ver contenido del FormData que llega al hook
    console.log("🔍 FormData received in hook:")
    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        console.log(
          `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
        )
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // ✅ LLAMADA DIRECTA CON FORMDATA
      const result = await productServiceClean.createProduct(data)

      console.log("✅ Hook Clean - Product created:", result)
      setSuccess(true)
      return result
    } catch (err: any) {
      const errorMessage = err.message || "Error al crear producto"
      console.error("❌ Hook Clean - Error:", errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearStatus = () => {
    setError(null)
    setSuccess(false)
  }

  return {
    loading,
    error,
    success,
    createProduct,
    clearStatus,
  }
}
