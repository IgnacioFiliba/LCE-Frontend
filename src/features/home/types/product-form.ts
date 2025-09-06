// types/productForm.ts
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

export interface CreateProductResponse {
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
  }
  description?: string
}

export interface Category {
  id: string
  name: string
}

export interface ProductFormValues {
  name: string
  price: string // Como string en el form, luego convertimos a number
  stock: string
  imgUrl: string
  year: string
  brand: string
  model: string
  engine: string
  categoryId: string
}