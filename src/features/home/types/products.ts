// types/Product.ts

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  imgUrl: string
  year: string
  brand: string
  model: string
  engine: string
  categoryId: string
}

// Si tu API también devuelve un ID único para cada producto, puedes usar esta versión extendida:
export interface ProductWithId extends Product {
  id: string
}

// Para respuestas de la API que podrían incluir metadatos
export interface ProductsResponse {
  products: Product[]
  total?: number
  page?: number
  limit?: number
}

// Para crear un producto (sin algunos campos que el backend podría generar)
export interface CreateProductRequest {
  name: string
  price: number
  stock: number
  imgUrl: string
  year: string
  brand: string
  model: string
  engine: string
  categoryId: string
}

// Para actualizar un producto (campos opcionales)
export interface UpdateProductRequest {
  name?: string
  price?: number
  stock?: number
  imgUrl?: string
  year?: string
  brand?: string
  model?: string
  engine?: string
  categoryId?: string
}

// Para errores de la API
export interface ApiError {
  message: string
  status: number
  details?: string
}

// Estados de loading para los componentes
export interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
}

export default Product
