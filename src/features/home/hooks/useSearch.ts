/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useProductSearch.ts
import { useState,  useCallback } from 'react'
import { ProductSearchResult, productSearchService } from '../services/productSearch'


interface UseProductSearchReturn {
  results: ProductSearchResult[]
  loading: boolean
  error: string | null
  searchProducts: (term: string) => Promise<void>
  clearResults: () => void
}

export const useProductSearch = (): UseProductSearchReturn => {
  const [results, setResults] = useState<ProductSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = useCallback(async (searchTerm: string) => {
    // Si el término está vacío, limpiar resultados
    if (!searchTerm.trim()) {
      setResults([])
      setError(null)
      return
    }

    console.log("🎯 Hook - Starting search for:", searchTerm)
    setLoading(true)
    setError(null)

    try {
      const searchResults = await productSearchService.searchProducts(searchTerm)
      console.log("✅ Hook - Search successful:", searchResults.length, "results")
      setResults(searchResults)
    } catch (err: any) {
      const errorMessage = err.message || 'Error al buscar productos'
      console.error("❌ Hook - Search error:", errorMessage)
      setError(errorMessage)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    searchProducts,
    clearResults,
  }
}