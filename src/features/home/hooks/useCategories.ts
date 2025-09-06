// hooks/useCategories.ts
import { useState, useEffect } from 'react'
import { Category } from '../types/product-form'
import { productService } from '../services/product-create-form'


interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await productService.getCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}

export default useCategories