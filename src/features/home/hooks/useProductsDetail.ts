import { useState, useCallback } from "react"
import { productService } from "../services/products-detail"
import { ProductDetailResponse } from "../types/detail"

interface UseProductDetailReturn {
  productDetail: ProductDetailResponse | null
  loading: boolean
  error: string | null
  fetchProductDetail: (id: string) => Promise<void>
  clearDetail: () => void
}

const useProductDetail = (): UseProductDetailReturn => {
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProductDetail = useCallback(async (id: string) => {
    if (!id) {
      setError("ID de producto requerido")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await productService.getProductDetail(id)
      setProductDetail(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el detalle del producto")
      setProductDetail(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearDetail = useCallback(() => {
    setProductDetail(null)
    setError(null)
    setLoading(false)
  }, [])

  return { productDetail, loading, error, fetchProductDetail, clearDetail }
}

export default useProductDetail
