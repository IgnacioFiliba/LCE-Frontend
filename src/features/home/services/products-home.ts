// services/productsService.ts
import Product, {
  ProductWithId,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/products"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

class ProductsService {
  constructor() {
    // ✅ SOLO LOG EN CLIENTE
    if (typeof window !== "undefined") {
      console.log("🌐 ProductsService initialized with baseURL:", getApiUrl())
    }
  }

  // ✅ HELPER PARA OBTENER HEADERS CON AUTH OPCIONAL
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (includeAuth && typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  // ✅ MÉTODO REQUEST MEJORADO CON URLs DINÁMICAS
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl(endpoint)
    console.log("🔗 ProductsService request:", url)

    try {
      const response = await fetch(url, {
        headers: {
          ...this.getHeaders(requireAuth),
          ...options.headers,
        },
        credentials: "include", // ✅ AGREGAR PARA COOKIES
        ...options,
      })

      console.log("📡 ProductsService response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(
          "❌ ProductsService error:",
          response.status,
          response.statusText,
          errorData
        )

        // ✅ MANEJO ESPECÍFICO DE ERRORES
        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción.")
        }
        if (response.status === 404) {
          throw new Error("Recurso no encontrado.")
        }
        if (response.status === 409) {
          throw new Error(
            "Conflicto: El recurso ya existe o hay un problema de concurrencia."
          )
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      // ✅ MANEJAR RESPUESTAS DELETE (pueden estar vacías)
      if (options.method === "DELETE" && response.status === 204) {
        console.log("✅ ProductsService DELETE success:", endpoint)
        return undefined as T
      }

      const data = await response.json()
      console.log("✅ ProductsService success:", endpoint)
      return data
    } catch (error) {
      console.error("❌ ProductsService API Error:", error)
      throw error
    }
  }

  // ✅ MEJORADO: Obtener todos los productos con filtros opcionales
  getAllProducts(
    options: {
      category?: string
      search?: string
      sortBy?: "name" | "price" | "createdAt"
      sortOrder?: "asc" | "desc"
      inStock?: boolean
    } = {}
  ): Promise<Product[]> {
    const params = new URLSearchParams()

    if (options.category) params.append("category", options.category)
    if (options.search) params.append("search", options.search)
    if (options.sortBy) params.append("sortBy", options.sortBy)
    if (options.sortOrder) params.append("sortOrder", options.sortOrder)
    if (options.inStock !== undefined)
      params.append("inStock", options.inStock.toString())

    const endpoint = params.toString()
      ? `/products?${params.toString()}`
      : "/products"
    return this.request<Product[]>(endpoint)
  }

  // Obtener producto por ID
  getProductById(id: string): Promise<ProductWithId> {
    return this.request<ProductWithId>(`/products/${id}`)
  }

  // ✅ MEJORADO: Crear producto con auth
  createProduct(productData: CreateProductRequest): Promise<ProductWithId> {
    // ✅ VALIDACIONES BÁSICAS
    if (!productData.name || productData.name.trim().length === 0) {
      throw new Error("El nombre del producto es requerido.")
    }

    if (!productData.price || productData.price <= 0) {
      throw new Error("El precio debe ser mayor a 0.")
    }

    return this.request<ProductWithId>(
      "/products",
      {
        method: "POST",
        body: JSON.stringify(productData),
      },
      true
    ) // ✅ REQUIERE AUTH
  }

  // ✅ MEJORADO: Actualizar producto con auth
  updateProduct(
    id: string,
    productData: UpdateProductRequest
  ): Promise<ProductWithId> {
    // ✅ VALIDACIONES OPCIONALES
    if (
      productData.name !== undefined &&
      productData.name.trim().length === 0
    ) {
      throw new Error("El nombre del producto no puede estar vacío.")
    }

    if (productData.price !== undefined && productData.price <= 0) {
      throw new Error("El precio debe ser mayor a 0.")
    }

    return this.request<ProductWithId>(
      `/products/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(productData),
      },
      true
    ) // ✅ REQUIERE AUTH
  }

  // ✅ MEJORADO: Eliminar producto con auth
  deleteProduct(id: string): Promise<void> {
    return this.request<void>(
      `/products/${id}`,
      {
        method: "DELETE",
      },
      true
    ) // ✅ REQUIERE AUTH
  }

  // ✅ MEJORADO: Obtener productos por categoría
  getProductsByCategory(
    categoryId: string,
    options: {
      limit?: number
      sortBy?: "name" | "price" | "createdAt"
      sortOrder?: "asc" | "desc"
    } = {}
  ): Promise<Product[]> {
    const params = new URLSearchParams()

    if (options.limit) params.append("limit", options.limit.toString())
    if (options.sortBy) params.append("sortBy", options.sortBy)
    if (options.sortOrder) params.append("sortOrder", options.sortOrder)

    const endpoint = params.toString()
      ? `/products/category/${categoryId}?${params.toString()}`
      : `/products/category/${categoryId}`

    return this.request<Product[]>(endpoint)
  }

  // ✅ MEJORADO: Buscar productos con filtros
  searchProducts(
    query: string,
    options: {
      category?: string
      minPrice?: number
      maxPrice?: number
      inStock?: boolean
      limit?: number
    } = {}
  ): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      throw new Error("La consulta de búsqueda no puede estar vacía.")
    }

    const searchParams = new URLSearchParams({ search: query.trim() })

    if (options.category) searchParams.append("category", options.category)
    if (options.minPrice)
      searchParams.append("minPrice", options.minPrice.toString())
    if (options.maxPrice)
      searchParams.append("maxPrice", options.maxPrice.toString())
    if (options.inStock !== undefined)
      searchParams.append("inStock", options.inStock.toString())
    if (options.limit) searchParams.append("limit", options.limit.toString())

    return this.request<Product[]>(`/products?${searchParams.toString()}`)
  }

  // ✅ MEJORADO: Obtener productos con paginación y filtros
  getProductsPaginated(
    options: {
      page?: number
      limit?: number
      category?: string
      search?: string
      sortBy?: "name" | "price" | "createdAt"
      sortOrder?: "asc" | "desc"
      minPrice?: number
      maxPrice?: number
      inStock?: boolean
    } = {}
  ): Promise<{
    products: Product[]
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }> {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      inStock,
    } = options

    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (category) searchParams.append("category", category)
    if (search) searchParams.append("search", search)
    if (sortBy) searchParams.append("sortBy", sortBy)
    if (sortOrder) searchParams.append("sortOrder", sortOrder)
    if (minPrice) searchParams.append("minPrice", minPrice.toString())
    if (maxPrice) searchParams.append("maxPrice", maxPrice.toString())
    if (inStock !== undefined)
      searchParams.append("inStock", inStock.toString())

    return this.request(`/products?${searchParams.toString()}`)
  }

  // ✅ BONUS: Obtener productos más vendidos
  getBestSellingProducts(limit: number = 10): Promise<Product[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sortBy: "sales",
      sortOrder: "desc",
    })

    return this.request<Product[]>(`/products/bestsellers?${params.toString()}`)
  }

  // ✅ BONUS: Obtener productos en oferta
  getProductsOnSale(limit?: number): Promise<Product[]> {
    const params = new URLSearchParams()
    if (limit) params.append("limit", limit.toString())

    const endpoint = params.toString()
      ? `/products/sale?${params.toString()}`
      : "/products/sale"

    return this.request<Product[]>(endpoint)
  }

  // ✅ BONUS: Obtener productos nuevos
  getNewProducts(limit: number = 10): Promise<Product[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sortBy: "createdAt",
      sortOrder: "desc",
    })

    return this.request<Product[]>(`/products/new?${params.toString()}`)
  }

  // ✅ BONUS: Obtener estadísticas de productos (para admin)
  getProductStats(): Promise<{
    totalProducts: number
    totalCategories: number
    outOfStock: number
    lowStock: number
    topSellingProducts: Product[]
    recentProducts: Product[]
  }> {
    return this.request("/products/stats", {}, true) // ✅ REQUIERE AUTH
  }

  // ✅ BONUS: Actualizar stock de producto
  updateProductStock(productId: string, stock: number): Promise<ProductWithId> {
    if (stock < 0) {
      throw new Error("El stock no puede ser negativo.")
    }

    return this.request<ProductWithId>(
      `/products/${productId}/stock`,
      {
        method: "PATCH",
        body: JSON.stringify({ stock }),
      },
      true
    ) // ✅ REQUIERE AUTH
  }

  // ✅ BONUS: Obtener productos relacionados
  getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const params = new URLSearchParams({ limit: limit.toString() })
    return this.request<Product[]>(
      `/products/${productId}/related?${params.toString()}`
    )
  }

  // ✅ BONUS: Marcar producto como destacado (admin)
  toggleProductFeatured(productId: string): Promise<ProductWithId> {
    return this.request<ProductWithId>(
      `/products/${productId}/featured`,
      {
        method: "PATCH",
      },
      true
    ) // ✅ REQUIERE AUTH
  }
}

const productsService = new ProductsService()
export default productsService
