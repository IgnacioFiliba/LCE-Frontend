/* eslint-disable @typescript-eslint/no-explicit-any */
// services/productSearchService.ts
import { authService } from "@/features/login/services/login-service"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

export interface ProductSearchResult {
  id: string
  name: string
  price: number
  stock: number
  imgUrl: string
  year: string
  brand: string
  model: string
  engine: string
  category: {
    id: string
    name: string
    products: string[]
  }
  description: string
  orderDetails: any[]
}

export interface AdvancedSearchFilters {
  search?: string
  brand?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  inStock?: boolean
  sortBy?: 'name' | 'price' | 'year' | 'brand' | 'relevance'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchSuggestion {
  type: 'product' | 'brand' | 'category' | 'model'
  value: string
  count?: number
}

// ✅ INTERFACES PARA RESPUESTAS DE API
export interface SearchResponse {
  products?: ProductSearchResult[]
  data?: ProductSearchResult[]
  results?: ProductSearchResult[]
}

export interface PaginatedSearchResponse {
  products: ProductSearchResult[]
  total: number
  page: number
  totalPages: number
  hasNext?: boolean
  hasPrev?: boolean
  data?: {
    products: ProductSearchResult[]
    total: number
    page: number
    totalPages: number
  }
}

class ProductSearchService {
  constructor() {
    // ✅ SOLO LOG EN CLIENTE
    if (typeof window !== 'undefined') {
      console.log("🌐 ProductSearchService initialized with baseURL:", getApiUrl())
    }
  }

  // ✅ HEADERS CON AUTH OPCIONAL
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (includeAuth) {
      const token = authService.getToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  // ✅ MÉTODO HELPER PARA REQUESTS
  private async makeRequest<T>(
    endpoint: string,
    requireAuth: boolean = false
  ): Promise<T> {
    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl(endpoint)
    
    if (typeof window !== 'undefined') {
      console.log("🔍 Search request:", url)
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(requireAuth),
        credentials: "include", // ✅ AGREGAR PARA COOKIES
      })

      console.log("📡 Search response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Search error:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar búsquedas.")
        }
        if (response.status === 400) {
          throw new Error(
            errorData.message || "Parámetros de búsqueda inválidos."
          )
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        )
      }

      const results = await response.json()
      return results as T
    } catch (error) {
      console.error("❌ Search request failed:", error)
      throw error
    }
  }

  // ✅ MEJORADO: Búsqueda simple sin paginación
  async searchProducts(searchTerm: string): Promise<ProductSearchResult[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      console.log("⚠️ Empty search term, returning empty results")
      return []
    }

    console.log("🔍 Searching products with term:", searchTerm)

    // Construir URL con query params
    const params = new URLSearchParams()
    params.append("search", searchTerm.trim())

    const endpoint = `/products?${params.toString()}`
    
    try {
      const response = await this.makeRequest<SearchResponse | ProductSearchResult[]>(endpoint)
      console.log("✅ Search results:", response)
      
      // ✅ MANEJAR DIFERENTES FORMATOS DE RESPUESTA
      if (Array.isArray(response)) {
        return response
      }
      
      // Si es un objeto, extraer products de diferentes posibles propiedades
      const results = response.products || response.data || response.results || []
      console.log("✅ Extracted products:", results.length, "products found")
      return results
    } catch (error) {
      console.error("❌ Search products error:", error)
      return []
    }
  }

  // ✅ MEJORADO: Búsqueda avanzada con filtros
  async searchProductsAdvanced(filters: AdvancedSearchFilters): Promise<ProductSearchResult[]> {
    console.log("🔍 Advanced search with filters:", filters)

    const params = new URLSearchParams()

    // ✅ VALIDAR Y AGREGAR PARÁMETROS
    if (filters.search?.trim()) {
      params.append("search", filters.search.trim())
    }
    if (filters.brand?.trim()) {
      params.append("brands", filters.brand.trim())
    }
    if (filters.category?.trim()) {
      params.append("categoryId", filters.category.trim())
    }
    if (filters.minPrice !== undefined && filters.minPrice >= 0) {
      params.append("priceMin", filters.minPrice.toString())
    }
    if (filters.maxPrice !== undefined && filters.maxPrice >= 0) {
      params.append("priceMax", filters.maxPrice.toString())
    }
    if (filters.minYear !== undefined && filters.minYear > 0) {
      params.append("yearMin", filters.minYear.toString())
    }
    if (filters.maxYear !== undefined && filters.maxYear > 0) {
      params.append("yearMax", filters.maxYear.toString())
    }
    if (filters.inStock !== undefined) {
      params.append("inStock", filters.inStock.toString())
    }
    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy)
    }
    if (filters.sortOrder) {
      params.append("sortOrder", filters.sortOrder)
    }

    const endpoint = `/products?${params.toString()}`

    try {
      const response = await this.makeRequest<SearchResponse | ProductSearchResult[]>(endpoint)
      
      // ✅ MANEJAR DIFERENTES FORMATOS DE RESPUESTA
      if (Array.isArray(response)) {
        console.log("✅ Advanced search results:", response.length, "products found")
        return response
      }
      
      const results = response.products || response.data || response.results || []
      console.log("✅ Advanced search results:", results.length, "products found")
      return results
    } catch (error) {
      console.error("❌ Advanced search error:", error)
      return []
    }
  }

  // ✅ MEJORADO: Búsqueda con paginación
  async searchProductsPaginated(
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    products: ProductSearchResult[]
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }> {
    // ✅ VALIDACIONES
    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 20

    console.log("🔍 Paginated search:", { searchTerm, page, limit })

    const params = new URLSearchParams()
    if (searchTerm?.trim()) {
      params.append("search", searchTerm.trim())
    }
    params.append("page", page.toString())
    params.append("limit", limit.toString())

    const endpoint = `/products?${params.toString()}`

    try {
      const response = await this.makeRequest<PaginatedSearchResponse>(endpoint)
      console.log("✅ Paginated search response:", response)

      // ✅ MANEJAR DIFERENTES FORMATOS DE RESPUESTA
      let products: ProductSearchResult[] = []
      let total = 0
      let totalPages = 0
      let currentPage = page

      if (response.data) {
        // Formato: { data: { products: [...], total: 100, ... } }
        products = response.data.products || []
        total = response.data.total || 0
        totalPages = response.data.totalPages || 0
        currentPage = response.data.page || page
      } else {
        // Formato directo: { products: [...], total: 100, ... }
        products = response.products || []
        total = response.total || 0
        totalPages = response.totalPages || 0
        currentPage = response.page || page
      }

      console.log("✅ Paginated search results:", products.length, "products found")

      return {
        products,
        total,
        page: currentPage,
        totalPages,
        hasNext: response.hasNext || currentPage < totalPages,
        hasPrev: response.hasPrev || currentPage > 1,
      }
    } catch (error) {
      console.error("❌ Paginated search error:", error)
      return {
        products: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      }
    }
  }

  // ✅ BONUS: Búsqueda instantánea (autocomplete)
  async getSearchSuggestions(query: string, limit: number = 5): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return []
    }

    console.log("🔍 Getting search suggestions for:", query)

    const params = new URLSearchParams({
      q: query.trim(),
      limit: limit.toString()
    })

    const endpoint = `/products/suggestions?${params.toString()}`

    try {
      const suggestions = await this.makeRequest<SearchSuggestion[]>(endpoint)
      console.log("✅ Search suggestions:", suggestions.length || 0)
      return Array.isArray(suggestions) ? suggestions : []
    } catch (error) {
      console.error("❌ Get suggestions error:", error)
      return []
    }
  }

  // ✅ BONUS: Búsqueda por categoría con filtros
  async searchByCategory(
    categoryId: string,
    filters: Omit<AdvancedSearchFilters, 'category'> = {}
  ): Promise<ProductSearchResult[]> {
    console.log("🔍 Searching by category:", categoryId, "with filters:", filters)

    const params = new URLSearchParams()
    params.append("categoryId", categoryId)

    if (filters.search?.trim()) {
      params.append("search", filters.search.trim())
    }
    if (filters.brand?.trim()) {
      params.append("brands", filters.brand.trim())
    }
    if (filters.minPrice !== undefined && filters.minPrice >= 0) {
      params.append("priceMin", filters.minPrice.toString())
    }
    if (filters.maxPrice !== undefined && filters.maxPrice >= 0) {
      params.append("priceMax", filters.maxPrice.toString())
    }
    if (filters.inStock !== undefined) {
      params.append("inStock", filters.inStock.toString())
    }
    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy)
    }
    if (filters.sortOrder) {
      params.append("sortOrder", filters.sortOrder)
    }

    const endpoint = `/products?${params.toString()}`

    try {
      const results = await this.makeRequest<ProductSearchResult[]>(endpoint)
      console.log("✅ Category search results:", results.length || 0)
      if (Array.isArray(results)) {
        return results
      } else if (results && typeof results === "object" && "products" in results && Array.isArray((results as any).products)) {
        return (results as any).products
      } else {
        return []
      }
    } catch (error) {
      console.error("❌ Category search error:", error)
      return []
    }
  }

  // ✅ BONUS: Obtener filtros disponibles
  async getAvailableFilters(): Promise<{
    brands: string[]
    categories: Array<{ id: string; name: string }>
    priceRange: { min: number; max: number }
    yearRange: { min: number; max: number }
  }> {
    console.log("🔍 Getting available filters")

    const endpoint = "/products/filters"

    try {
      const filters = await this.makeRequest<{
        brands: string[]
        categories: Array<{ id: string; name: string }>
        priceRange: { min: number; max: number }
        yearRange: { min: number; max: number }
      }>(endpoint)

      console.log("✅ Available filters retrieved")
      return filters
    } catch (error) {
      console.error("❌ Get filters error:", error)
      return {
        brands: [],
        categories: [],
        priceRange: { min: 0, max: 0 },
        yearRange: { min: 0, max: 0 },
      }
    }
  }

  // ✅ BONUS: Búsquedas populares
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    console.log("🔍 Getting popular searches")

    const params = new URLSearchParams({
      limit: limit.toString()
    })

    const endpoint = `/products/popular-searches?${params.toString()}`

    try {
      const searches = await this.makeRequest<string[]>(endpoint)
      console.log("✅ Popular searches retrieved:", searches.length || 0)
      return Array.isArray(searches) ? searches : []
    } catch (error) {
      console.error("❌ Get popular searches error:", error)
      return []
    }
  }

  // ✅ BONUS: Guardar búsqueda del usuario (con auth)
  async saveUserSearch(searchTerm: string): Promise<void> {
    if (!searchTerm || searchTerm.trim().length === 0) return

    console.log("💾 Saving user search:", searchTerm)

    const endpoint = "/users/searches"

    try {
      await fetch(getApiUrl(endpoint), {
        method: "POST",
        headers: this.getHeaders(true), // ✅ REQUIERE AUTH
        credentials: "include",
        body: JSON.stringify({ searchTerm: searchTerm.trim() }),
      })

      console.log("✅ User search saved")
    } catch (error) {
      console.error("❌ Save search error:", error)
      // No lanzar error, es opcional
    }
  }

  // ✅ BONUS: Obtener historial de búsquedas del usuario (con auth)
  async getUserSearchHistory(limit: number = 10): Promise<string[]> {
    console.log("📋 Getting user search history")

    const params = new URLSearchParams({
      limit: limit.toString()
    })

    const endpoint = `/users/searches?${params.toString()}`

    try {
      const history = await this.makeRequest<string[]>(endpoint, true) // ✅ REQUIERE AUTH
      console.log("✅ Search history retrieved:", history.length || 0)
      return Array.isArray(history) ? history : []
    } catch (error) {
      console.error("❌ Get search history error:", error)
      return []
    }
  }
}

export const productSearchService = new ProductSearchService()