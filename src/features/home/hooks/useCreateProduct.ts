// hooks/useCreateProduct.ts
import { useState, useCallback } from "react"
// ← CAMBIO: Usar el servicio correcto
import {
  CreateProductResponse,
  CreateProductRequest,
} from "../types/product-form"
import { productService } from "../services/product-create-form"

interface UseCreateProductReturn {
  createProduct: (
    productData: CreateProductRequest
  ) => Promise<CreateProductResponse>
  loading: boolean
  error: string | null
  success: boolean
  clearStatus: () => void
}

const useCreateProduct = (): UseCreateProductReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)



  const createProduct = useCallback(
    async (
      productData: CreateProductRequest
    ): Promise<CreateProductResponse> => {
      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const result = await productService.createProduct(productData) // ← Y aquí también
        setSuccess(true)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al crear el producto"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const clearStatus = useCallback(() => {
    setError(null)
    setSuccess(false)
    setLoading(false)
  }, [])

  return {
    createProduct,
    loading,
    error,
    success,
    clearStatus,
  }
}

export default useCreateProduct
