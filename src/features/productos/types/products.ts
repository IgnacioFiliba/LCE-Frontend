// types/products.ts
export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  imgUrl?: string
  year: string
  brand: string
  model: string
  engine: string
  averageRating: number
  totalReviews: number
  description?: string
  category?: Category
}

export interface GetProductsParams {
  page?: number
  limit?: number
  search?: string
  brands?: string[] | string
  inStock?: "true" | "false"
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
}

export type UpdateProductPayload = Partial<
  Pick<
    Product,
    "name" | "description" | "price" | "stock" | "imgUrl"
  >
>
