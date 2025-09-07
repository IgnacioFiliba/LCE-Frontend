/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/ProductCardsList.tsx - VERSIÓN QUE USA LA PROP `products` (SIN FETCH INTERNO)
import React, { useState, useMemo } from "react"
import {
  Filter,
  Heart,
  Search,
  ShoppingCart,
  Eye,
  Calendar,
  Cog,
  Loader2,
} from "lucide-react"
import Image from "next/image"

import { Product } from "../../types/products"
import { FilterState, ProductResponse } from "../../types/filters"
import ProductDetailModal from "../ProductDetailModal"

import { useCartContext } from "../../../cart/context"
import { useFavorites } from "@/features/cart/hooks/useFavorites"

interface ProductCardsListProps {
  products: ProductResponse[]
  searchTerm: string
  filters?: FilterState
  sortBy?: "name" | "price" | "brand" | "year"
  sortOrder?: "asc" | "desc"
  className?: string
}

// 🔧 Adaptador: asegura que year sea string y shape de Product para el modal
const toProduct = (p: Product | ProductResponse): Product => {
  return {
    ...(p as any),
    year: String((p as any)?.year ?? ""),
  } as Product
}

const ProductCardsList: React.FC<ProductCardsListProps> = ({
  products: incomingProducts = [],
  searchTerm,
  filters: externalFilters,
  sortBy = "name",
  sortOrder = "asc",
  className = "",
}) => {
  // Favoritos desde backend
  const { toggleFavorite, isFavorite, isLoading: favoritesLoading } = useFavorites()

  // Carrito
  const { addItem, isLoading: cartLoading } = useCartContext()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)

  // Aplicar ocultos/stock/sort local sobre LO QUE LLEGA POR PROP
  const products = useMemo(() => {
    const HIDE = new Set<string>([
      "Aceite Castrol 10W40",
      "Amortiguador Monroe",
      "Bujía NGK Iridium",
      "Filtro de Aceite Bosch",
    ])

    const base = Array.isArray(incomingProducts) ? incomingProducts : []

    // filtrar ocultos + stock > 0 (si stock viene definido)
    let arr = base
      .filter((p) => !HIDE.has(p.name))
      .filter((p) => (typeof p.stock === "number" ? p.stock > 0 : true))

    // sort opcional local (por si querés reforzar el orden)
    const getVal = (p: any) => {
      switch (sortBy) {
        case "name":
          return (p.name || "").toString().toLowerCase()
        case "price":
          return Number(p.price) || 0
        case "brand":
          return (p.brand || "").toString().toLowerCase()
        case "year":
          return Number(p.year) || 0
        default:
          return 0
      }
    }

    arr = [...arr].sort((a, b) => {
      const A = getVal(a)
      const B = getVal(b)
      if (A < B) return sortOrder === "asc" ? -1 : 1
      if (A > B) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    if (typeof window !== "undefined") {
      console.log(
        "[ProductCardsList] rendering",
        arr.length,
        "items for search:",
        searchTerm
      )
    }
    return arr
  }, [incomingProducts, sortBy, sortOrder, searchTerm])

  // Favoritos
  const handleToggleFavorite = async (product: Product | ProductResponse) => {
    const p = toProduct(product)
    if (!p.id) return
    await toggleFavorite(p.id)
  }

  const handleToggleFavoriteWithEvent = async (
    e: React.MouseEvent,
    product: Product | ProductResponse
  ) => {
    e.preventDefault()
    e.stopPropagation()
    await handleToggleFavorite(product)
  }

  // Carrito (acepta qty; el modal puede mandar cantidad)
  const handleAddToCart = async (
    product: Product | ProductResponse,
    quantity: number = 1
  ) => {
    const p = toProduct(product)
    if (!p?.id || (typeof (product as any).stock === "number" && (product as any).stock <= 0)) return
    await addItem({
      productId: p.id,
      quantity: Math.max(1, Math.floor(quantity)),
    })
  }

  const handleAddToCartWithEvent = async (
    e: React.MouseEvent,
    product: Product | ProductResponse
  ) => {
    e.preventDefault()
    e.stopPropagation()
    await handleAddToCart(product, 1)
  }

  const handleProductClick = (product: Product | ProductResponse) => {
    setSelectedProduct(toProduct(product))
    setShowProductDetail(true)
  }

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Sin Stock
        </span>
      )
    } else if (stock <= 10) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          Stock: {stock}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        Stock: {stock}
      </span>
    )
  }

  return (
    <div className={className}>
      {/* Header con stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Productos Disponibles</h2>
          <p className="text-gray-600">Mostrando {products.length} productos</p>
        </div>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const isProductFavorite = isFavorite(product.id)
            const isOutOfStock =
              typeof product.stock === "number" ? product.stock <= 0 : false

            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer border border-gray-100"
                onClick={() => handleProductClick(product)}
              >
                {/* Imagen */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <Image
                    src={product.imgUrl}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Badge de stock (opcional) */}
                  {/* <div className="absolute top-4 left-4">{getStockBadge(Number(product.stock ?? 0))}</div> */}

                  {/* Favorito */}
                  <button
                    onClick={(e) => handleToggleFavoriteWithEvent(e, product)}
                    disabled={favoritesLoading}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 ${
                      isProductFavorite
                        ? "bg-red-500 text-white shadow-lg"
                        : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white"
                    } backdrop-blur-sm ${
                      favoritesLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    type="button"
                  >
                    {favoritesLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Heart size={18} fill={isProductFavorite ? "currentColor" : "none"} />
                    )}
                  </button>

                  {/* Overlay acción */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProductClick(product)
                        }}
                        className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                      >
                        <Eye size={20} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                      {product.brand}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {product.model}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{String(product.year)}</span>
                    </div>
                    {product.model && (
                      <div className="flex items-center gap-1">
                        <Cog size={14} />
                        <span className="truncate">{product.model}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">USD</span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Botón agregar al carrito (opcional) */}
                  {/* 
                  <button
                    onClick={(e) => handleAddToCartWithEvent(e, product)}
                    disabled={isOutOfStock || cartLoading}
                    type="button"
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      isOutOfStock || cartLoading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg active:scale-95"
                    }`}
                  >
                    {cartLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={18} />
                    )}
                    {cartLoading
                      ? "Agregando..."
                      : isOutOfStock
                      ? "No Disponible"
                      : "Agregar al Carrito"}
                  </button>
                  */}
                </div>

                {/* Overlay sin stock */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShoppingCart size={24} className="text-red-500" />
                      </div>
                      <p className="font-semibold text-red-600">Agotado</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Search size={64} className="mx-auto text-gray-400 mb-6" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-4">
            No se encontraron productos
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Intenta ajustando los filtros para ver más productos disponibles en
            nuestro catálogo
          </p>
          {/* Este botón ya no hace refetch aquí porque los datos los provee el padre */}
        </div>
      )}

      {/* Modal de detalle (envía qty al handler) */}
      <ProductDetailModal
        isOpen={showProductDetail}
        product={selectedProduct}
        onClose={() => setShowProductDetail(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}

export default ProductCardsList
