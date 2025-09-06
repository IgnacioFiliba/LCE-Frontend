// services/productServiceClean.ts
import { authService } from "@/features/login/services/login-service"
import { CreateProductResponseClean } from "../types/productClean"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

class ProductServiceClean {
  // ✅ CONSTRUCTOR CON URLs DINÁMICAS
  constructor() {
    // ✅ SOLO LOG EN CLIENTE
    if (typeof window !== "undefined") {
      console.log(
        "🌐 ProductServiceClean initialized with baseURL:",
        getApiUrl()
      )
    }
  }

  // ✅ HEADERS MEJORADOS PARA FORMDATA (SIN Content-Type)
  private getHeadersForFormData(): HeadersInit {
    const token = authService.getToken()

    if (typeof window !== "undefined") {
      console.log("🔗 Using API:", getApiUrl()) // Debug API URL dinámico
      console.log("🔑 Has token:", !!token)
    }

    return {
      // ✅ NO INCLUIR Content-Type para FormData - el browser lo hace automáticamente
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // ✅ HEADERS PARA REQUESTS JSON
  private getHeadersForJSON(): HeadersInit {
    const token = authService.getToken()

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // ✅ CREAR PRODUCTO CON FORMDATA Y URLs DINÁMICAS
  async createProduct(formData: FormData): Promise<CreateProductResponseClean> {
    console.log("🚀 Service Clean - Creating product with FormData")

    // ✅ DEBUG: Ver contenido del FormData
    if (typeof window !== "undefined") {
      console.log("🔍 FormData contents:")
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          )
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }
    }

    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl("/products")
    console.log("🔗 Full URL:", url)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeadersForFormData(), // ✅ Headers especiales para FormData
        credentials: "include", // ✅ AGREGAR PARA COOKIES
        body: formData, // ✅ FormData directamente, no JSON.stringify
      })

      console.log("🔍 Response status:", response.status)

      if (typeof window !== "undefined") {
        console.log(
          "🔍 Response headers:",
          Object.fromEntries(response.headers.entries())
        )
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error response completo:", errorData)

        // ✅ MOSTRAR EL ARRAY DE ERRORES ESPECÍFICOS
        if (errorData.message && Array.isArray(errorData.message)) {
          console.error("❌ Errores específicos:", errorData.message)
          errorData.message.forEach((msg: string, index: number) => {
            console.error(`   ${index + 1}. ${msg}`)
          })
        }

        // ✅ MEJORADO: Manejo específico de errores
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
          throw new Error("Ya existe un producto con este nombre o SKU.")
        }
        if (response.status === 413) {
          throw new Error("El archivo es demasiado grande.")
        }
        if (response.status === 415) {
          throw new Error("Tipo de archivo no soportado.")
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        // ✅ MEJORAR EL MENSAJE DE ERROR
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message ||
            `Error ${response.status}: ${response.statusText}`

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("✅ Service Clean - Success:", result)
      return result
    } catch (error) {
      console.error("❌ Create product error:", error)
      throw error
    }
  }

  // ✅ MEJORADO: Actualizar producto con FormData
  async updateProduct(
    productId: string,
    formData: FormData
  ): Promise<CreateProductResponseClean> {
    console.log("🚀 Service Clean - Updating product with FormData")
    console.log("🔍 Product ID:", productId)

    // ✅ DEBUG: Ver contenido del FormData
    if (typeof window !== "undefined") {
      console.log("🔍 FormData contents:")
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          )
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }
    }

    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl(`/products/${productId}`)
    console.log("🔗 Full URL:", url)

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: this.getHeadersForFormData(),
        credentials: "include",
        body: formData,
      })

      console.log("🔍 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error response completo:", errorData)

        if (errorData.message && Array.isArray(errorData.message)) {
          console.error("❌ Errores específicos:", errorData.message)
          errorData.message.forEach((msg: string, index: number) => {
            console.error(`   ${index + 1}. ${msg}`)
          })
        }

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
        if (response.status === 413) {
          throw new Error("El archivo es demasiado grande.")
        }
        if (response.status === 415) {
          throw new Error("Tipo de archivo no soportado.")
        }

        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message ||
            `Error ${response.status}: ${response.statusText}`

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("✅ Service Clean - Update Success:", result)
      return result
    } catch (error) {
      console.error("❌ Update product error:", error)
      throw error
    }
  }

  // ✅ MEJORADO: Eliminar producto
  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    console.log("🚀 Service Clean - Deleting product")
    console.log("🔍 Product ID:", productId)

    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl(`/products/${productId}`)
    console.log("🔗 Full URL:", url)

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getHeadersForJSON(),
        credentials: "include",
      })

      console.log("🔍 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error response completo:", errorData)

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

        const errorMessage =
          errorData.message ||
          `Error ${response.status}: ${response.statusText}`

        throw new Error(errorMessage)
      }

      console.log("✅ Service Clean - Delete Success")
      return { success: true }
    } catch (error) {
      console.error("❌ Delete product error:", error)
      throw error
    }
  }

  // ✅ MEJORADO: Subir imagen individual
  async uploadProductImage(
    productId: string,
    imageFile: File
  ): Promise<{ imageUrl: string }> {
    console.log("🚀 Service Clean - Uploading product image")
    console.log("🔍 Product ID:", productId)
    console.log("🔍 Image file:", imageFile.name, imageFile.size, "bytes")

    const formData = new FormData()
    formData.append("image", imageFile)

    // ✅ USAR URLs DINÁMICAS
    const url = getApiUrl(`/products/${productId}/image`)
    console.log("🔗 Full URL:", url)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeadersForFormData(),
        credentials: "include",
        body: formData,
      })

      console.log("🔍 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error response completo:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para subir imágenes.")
        }
        if (response.status === 404) {
          throw new Error("Producto no encontrado.")
        }
        if (response.status === 400) {
          throw new Error(errorData.message || "Imagen inválida.")
        }
        if (response.status === 413) {
          throw new Error("La imagen es demasiado grande.")
        }
        if (response.status === 415) {
          throw new Error("Tipo de imagen no soportado.")
        }

        const errorMessage =
          errorData.message ||
          `Error ${response.status}: ${response.statusText}`

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("✅ Service Clean - Image Upload Success:", result)
      return result
    } catch (error) {
      console.error("❌ Upload image error:", error)
      throw error
    }
  }

  // ✅ BONUS: Eliminar imagen de producto
  async deleteProductImage(
    productId: string,
    imageId: string
  ): Promise<{ success: boolean }> {
    console.log("🚀 Service Clean - Deleting product image")
    console.log("🔍 Product ID:", productId)
    console.log("🔍 Image ID:", imageId)

    const url = getApiUrl(`/products/${productId}/images/${imageId}`)
    console.log("🔗 Full URL:", url)

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getHeadersForJSON(),
        credentials: "include",
      })

      console.log("🔍 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error response completo:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para eliminar imágenes.")
        }
        if (response.status === 404) {
          throw new Error("Producto o imagen no encontrado.")
        }

        const errorMessage =
          errorData.message ||
          `Error ${response.status}: ${response.statusText}`

        throw new Error(errorMessage)
      }

      console.log("✅ Service Clean - Image Delete Success")
      return { success: true }
    } catch (error) {
      console.error("❌ Delete image error:", error)
      throw error
    }
  }

  // ✅ BONUS: Subir múltiples imágenes
  async uploadMultipleImages(
    productId: string,
    imageFiles: File[]
  ): Promise<{ imageUrls: string[] }> {
    console.log("🚀 Service Clean - Uploading multiple images")
    console.log("🔍 Product ID:", productId)
    console.log("🔍 Image count:", imageFiles.length)

    const formData = new FormData()
    imageFiles.forEach((file, index) => {
      formData.append(`images`, file)
      console.log(`🔍 Image ${index + 1}:`, file.name, file.size, "bytes")
    })

    const url = getApiUrl(`/products/${productId}/images`)
    console.log("🔗 Full URL:", url)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeadersForFormData(),
        credentials: "include",
        body: formData,
      })

      console.log("🔍 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error response completo:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para subir imágenes.")
        }
        if (response.status === 404) {
          throw new Error("Producto no encontrado.")
        }
        if (response.status === 400) {
          throw new Error(
            errorData.message || "Algunas imágenes son inválidas."
          )
        }
        if (response.status === 413) {
          throw new Error("Algunas imágenes son demasiado grandes.")
        }
        if (response.status === 415) {
          throw new Error("Algunos tipos de imagen no son soportados.")
        }

        const errorMessage =
          errorData.message ||
          `Error ${response.status}: ${response.statusText}`

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("✅ Service Clean - Multiple Images Upload Success:", result)
      return result
    } catch (error) {
      console.error("❌ Upload multiple images error:", error)
      throw error
    }
  }

  // ✅ BONUS: Actualizar solo datos del producto (sin imágenes)
  async updateProductData(
    productId: string,
    productData: {
      name?: string
      description?: string
      price?: number
      category?: string
      stock?: number
      sku?: string
    }
  ): Promise<CreateProductResponseClean> {
    console.log("🚀 Service Clean - Updating product data only")
    console.log("🔍 Product ID:", productId)
    console.log("🔍 Update data:", productData)

    const url = getApiUrl(`/products/${productId}/data`)
    console.log("🔗 Full URL:", url)

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: this.getHeadersForJSON(),
        credentials: "include",
        body: JSON.stringify(productData),
      })

      console.log("🔍 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error response completo:", errorData)

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
              : errorData.message || "Datos de producto inválidos."
          )
        }
        if (response.status === 409) {
          throw new Error("Ya existe un producto con estos datos.")
        }

        const errorMessage =
          errorData.message ||
          `Error ${response.status}: ${response.statusText}`

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("✅ Service Clean - Data Update Success:", result)
      return result
    } catch (error) {
      console.error("❌ Update product data error:", error)
      throw error
    }
  }
}

export const productServiceClean = new ProductServiceClean()
