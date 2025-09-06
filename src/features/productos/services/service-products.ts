/* eslint-disable @typescript-eslint/no-explicit-any */
// features/productos/services/service-products.ts

import { authService } from "@/features/login/services/login-service"
import { getApiUrl } from "@/config/urls"
import { GetProductsParams, Product, UpdateProductPayload } from "../types/products"

class ApiClient {
  private baseURL: string
  constructor() {
    this.baseURL = getApiUrl()
    if (typeof window !== "undefined") {
      console.log("ProductService ApiClient initialized with baseURL:", this.baseURL)
    }
  }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = authService.getToken()
    const config: RequestInit = {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }
    const res = await fetch(url, config)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) throw new Error("No estás autenticado. Por favor inicia sesión.")
      if (res.status === 403) throw new Error("No tienes permisos para acceder a productos.")
      if (res.status === 404) throw new Error("Recurso no encontrado.")
      if (res.status >= 500) throw new Error("Error del servidor. Intenta de nuevo más tarde.")
      throw new Error(data.message || `Error ${res.status}: ${res.statusText}`)
    }
    return res.json()
  }
  get<T>(endpoint: string, params?: Record<string, any>) {
    const q = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request<T>(`${endpoint}${q}`, { method: "GET" })
  }
  post<T>(endpoint: string, body: any, isFormData = false) {
    return this.request<T>(endpoint, {
      method: "POST",
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      body: isFormData ? body : JSON.stringify(body),
    })
  }
  put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) })
  }
  patch<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) })
  }
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

class ProductService {
  private api = new ApiClient()

  async getProducts(params: GetProductsParams = {}) {
    if (!authService.isAuthenticated()) throw new Error("Debes estar autenticado para ver productos")
    const page = params.page ?? 1
    const limit = params.limit ?? 10
    const query: Record<string, any> = { page, limit }
    if (params.search) query.search = params.search
    if (params.brands) query.brands = Array.isArray(params.brands) ? params.brands.join(",") : params.brands
    if (params.inStock != null) query.inStock = params.inStock
    if (params.yearMin != null) query.yearMin = params.yearMin
    if (params.yearMax != null) query.yearMax = params.yearMax
    if (params.priceMin != null) query.priceMin = params.priceMin
    if (params.priceMax != null) query.priceMax = params.priceMax

    const items = await this.api.get<Product[]>("/products", query)
    const data = Array.isArray(items) ? items : []
    return {
      data,
      meta: { page, limit, total: data.length, hasNextPage: data.length === limit },
    }
  }

  async getProductById(id: string) {
    if (!authService.isAuthenticated()) throw new Error("Debes estar autenticado para ver el producto")
    return this.api.get<Product>(`/products/${id}`)
  }

  async createProduct(formData: FormData) {
    if (!authService.isAuthenticated()) throw new Error("Debes estar autenticado para crear productos")
    return this.api.post<Product>("/products", formData, true)
  }

  // ← método que tu UI espera
  async update(id: string, payload: UpdateProductPayload) {
    if (!authService.isAuthenticated()) throw new Error("Debes estar autenticado para actualizar productos")
    return this.api.put<Product>(`/products/${id}`, payload)
  }

  // alias opcional si en algún lado ya escribiste updateProduct
  async updateProduct(id: string, payload: UpdateProductPayload) {
    return this.update(id, payload)
  }

  async deleteProduct(id: string) {
    if (!authService.isAuthenticated()) throw new Error("Debes estar autenticado para eliminar productos")
    await this.api.delete(`/products/${id}`)
  }
}

const productService = new ProductService()
export default productService
