// types/productClean.ts

// ✅ BASADO EXACTAMENTE EN EL SWAGGER
export interface CreateProductClean {
  name: string
  price: number // ← número como dice el swagger
  stock: number // ← número como dice el swagger
  imgUrl: string
  year: string // ← string como dice el swagger
  brand: string
  model: string
  engine: string
  categoryId: string
}

// Response del backend
export interface CreateProductResponseClean {
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
  createdAt: string
  updatedAt: string
}

// Para el formulario (todos strings para inputs)
export interface ProductFormClean {
  name: string
  price: string // ← string en el form, convertimos después
  stock: string // ← string en el form, convertimos después
  imgUrl: string
  year: string
  brand: string
  model: string
  engine: string
  categoryId: string
}

// ✅ AGREGAR ESTE TIPO UNION PARA EL HOOK
export type CreateProductInput = FormData | CreateProductClean
