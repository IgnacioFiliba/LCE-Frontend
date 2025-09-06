// services/productService.ts - ESPECIALIZADO EN CREAR PRODUCTOS
import { authService } from "@/features/login/services/login-service"
import { ProductDetailResponse } from "../types/detail"
import {
  CreateProductResponse,
  CreateProductRequest,
  Category,
} from "../types/product-form"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

class ProductService {
  constructor() {
    // ✅ SOLO LOG EN CLIENTE
    if (typeof window !== "undefined") {
      console.log(
        "🌐 ProductService (Create) initialized with baseURL:",
        getApiUrl()
      )
    }
  }

  // ✅ MÉTODO HELPER para headers con auth
  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken()

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Solo agregar si hay token
    }
  }

  // ✅ MEJORADO: Obtener detalle de producto
  async getProductDetail(id: string): Promise<ProductDetailResponse> {
    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl(`/products/${id}`)
    console.log("🔗 Obteniendo detalle del producto:", url)

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ AGREGAR PARA COOKIES
      })

      console.log("📡 Product detail response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(
          "❌ Error en getProductDetail:",
          response.status,
          errorData
        )

        if (response.status === 404) {
          throw new Error("Producto no encontrado.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver este producto.")
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Detalle del producto obtenido:", data.id)
      return data
    } catch (error) {
      console.error("❌ Get product detail error:", error)
      throw error
    }
  }

  // ✅ MEJORADO: Crear producto con validaciones robustas
  async createProduct(
    productData: CreateProductRequest
  ): Promise<CreateProductResponse> {
    console.log("🚀 INICIO createProduct")

    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl("/products")
    console.log("🔗 URL:", url)
    console.log("🔍 Datos originales:", JSON.stringify(productData, null, 2))

    // ✅ VALIDACIONES PREVIAS
    if (!productData.name || productData.name.trim().length === 0) {
      throw new Error("El nombre del producto es requerido.")
    }

    if (!productData.categoryId) {
      throw new Error("La categoría es requerida.")
    }

    // ✅ NORMALIZAR PRECIO (convertir comas a puntos)
    const normalizedPrice = productData.price.toString().replace(",", ".")
    const price = parseFloat(normalizedPrice)

    console.log("🔍 Precio original:", productData.price)
    console.log("🔍 Precio normalizado:", normalizedPrice)
    console.log("🔍 Precio convertido:", price)

    // Validar que el precio sea válido
    if (isNaN(price) || price <= 0) {
      throw new Error("Precio inválido. Debe ser un número mayor a 0.")
    }

    // Validar stock
    const stock = parseInt(productData.stock.toString())
    if (isNaN(stock) || stock < 0) {
      throw new Error("El stock debe ser un número mayor o igual a 0.")
    }

    // ✅ PROBAR DIFERENTES FORMATOS DE PRECIO
    if (typeof window !== "undefined") {
      console.log("🧪 Testing different price formats...")

      const priceTests = {
        original: price,
        string: price.toFixed(2),
        stringWithoutDecimals: price.toFixed(0),
        number: Number(price),
        numberFixed: Number(price.toFixed(2)),
        parseFloat: parseFloat(price.toFixed(2)),
      }

      console.log("🔍 Price formats to test:", priceTests)
    }

    // ✅ DATOS PREPARADOS CON VALIDACIONES
    const dataToSend = {
      name: productData.name.trim(),
      price: parseFloat(price.toFixed(2)), // ✅ PARSEFLOAT DEL STRING
      stock: stock,
      imgUrl: productData.imgUrl || null,
      year: productData.year ? productData.year.toString() : null,
      brand: productData.brand || null,
      model: productData.model || null,
      engine: productData.engine || null,
      categoryId: productData.categoryId,
    }

    console.log("🚀 Datos enviados:", JSON.stringify(dataToSend, null, 2))

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(dataToSend),
      })

      console.log("🔍 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error response:", errorData)

        // ✅ MEJOR manejo de errores
        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para crear productos.")
        }
        if (response.status === 400) {
          throw new Error(
            Array.isArray(errorData.message)
              ? errorData.message.join(", ")
              : errorData.message || "Datos de producto inválidos."
          )
        }
        if (response.status === 409) {
          throw new Error(
            "Ya existe un producto con este nombre, modelo o SKU."
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

      const result = await response.json()
      console.log("✅ Producto creado exitosamente:", result)
      return result
    } catch (error) {
      console.error("❌ Create product error:", error)
      throw error
    }
  }

  // ✅ MEJORADO: Obtener categorías
  async getCategories(): Promise<Category[]> {
    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl("/categories")
    console.log("🔗 Obteniendo categorías:", url)

    try {
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Categories response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en getCategories:", response.status, errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver las categorías.")
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Categorías obtenidas:", data.length || 0)
      return data
    } catch (error) {
      console.error("❌ Get categories error:", error)
      throw error
    }
  }

  // ✅ MEJORADO: Actualizar producto
  async updateProduct(
    id: string,
    productData: Partial<CreateProductRequest>
  ): Promise<CreateProductResponse> {
    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl(`/products/${id}`)
    console.log("🔗 Actualizando producto:", url)

    // Normalizar precio si existe
    const dataToSend = { ...productData }

    if (productData.price !== undefined) {
      const normalizedPrice = productData.price.toString().replace(",", ".")
      const price = parseFloat(normalizedPrice)

      if (isNaN(price) || price <= 0) {
        throw new Error("Precio inválido. Debe ser un número mayor a 0.")
      }

      dataToSend.price = parseFloat(price.toFixed(2))
    }

    if (productData.stock !== undefined) {
      const stock = parseInt(productData.stock.toString())
      if (isNaN(stock) || stock < 0) {
        throw new Error("Stock inválido. Debe ser un número mayor o igual a 0.")
      }
      dataToSend.stock = stock
    }

    if (productData.name) {
      dataToSend.name = productData.name.trim()
      if (dataToSend.name.length === 0) {
        throw new Error("El nombre del producto no puede estar vacío.")
      }
    }

    console.log(
      "🔄 Datos de actualización:",
      JSON.stringify(dataToSend, null, 2)
    )

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(dataToSend),
      })

      console.log("📡 Update response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error updating product:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para actualizar productos.")
        }
        if (response.status === 404) {
          throw new Error("Producto no encontrado.")
        }
        if (response.status === 400) {
          throw new Error(
            Array.isArray(errorData.message)
              ? errorData.message.join(", ")
              : errorData.message || "Datos de actualización inválidos."
          )
        }
        if (response.status === 409) {
          throw new Error("Conflicto: Ya existe un producto con estos datos.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const result = await response.json()
      console.log("✅ Producto actualizado exitosamente:", result)
      return result
    } catch (error) {
      console.error("❌ Update product error:", error)
      throw error
    }
  }

  // ✅ MEJORADO: Eliminar producto
  async deleteProduct(id: string): Promise<void> {
    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl(`/products/${id}`)
    console.log("🔗 Eliminando producto:", url)

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Delete response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error deleting product:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para eliminar productos.")
        }
        if (response.status === 404) {
          throw new Error("Producto no encontrado.")
        }
        if (response.status === 409) {
          throw new Error(
            errorData.message ||
              "No se puede eliminar un producto que tiene órdenes asociadas."
          )
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      console.log("✅ Producto eliminado exitosamente")
    } catch (error) {
      console.error("❌ Delete product error:", error)
      throw error
    }
  }

  // ✅ BONUS: Validar datos de producto antes de enviar
  validateProductData(productData: CreateProductRequest): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validar nombre
    if (!productData.name || productData.name.trim().length === 0) {
      errors.push("El nombre del producto es requerido")
    } else if (productData.name.trim().length < 3) {
      errors.push("El nombre debe tener al menos 3 caracteres")
    }

    // Validar precio
    const price = parseFloat(productData.price.toString().replace(",", "."))
    if (isNaN(price) || price <= 0) {
      errors.push("El precio debe ser un número mayor a 0")
    }

    // Validar stock
    const stock = parseInt(productData.stock.toString())
    if (isNaN(stock) || stock < 0) {
      errors.push("El stock debe ser un número mayor o igual a 0")
    }

    // Validar categoría
    if (!productData.categoryId) {
      errors.push("La categoría es requerida")
    }

    // Validar año si se proporciona
    if (productData.year) {
      const year = parseInt(productData.year.toString())
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        errors.push(`El año debe estar entre 1900 y ${currentYear + 1}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // ✅ BONUS: Crear producto con validación previa
  async createProductWithValidation(
    productData: CreateProductRequest
  ): Promise<CreateProductResponse> {
    // Validar datos antes de enviar
    const validation = this.validateProductData(productData)

    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(", ")}`)
    }

    return this.createProduct(productData)
  }
}

export const productService = new ProductService()
