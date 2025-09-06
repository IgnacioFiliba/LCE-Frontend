// components/ProductCardsList.tsx - VERSIÓN CON FAVORITOS INTEGRADOS (CORREGIDA)
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
import { Product } from "../../types/products" // 👈 named import corregido
import ProductDetailModal from "../ProductDetailModal"
import { FilterState } from "../../types/filters"
import useProductsFiltered from "../../hooks/useFilters"

import Image from "next/image"
import { useCartContext } from "../../../cart/context"
import { useFavorites } from "@/features/cart/hooks/useFavorites"

interface ProductCardsListProps {
  filters?: FilterState
  sortBy?: "name" | "price" | "brand" | "year"
  sortOrder?: "asc" | "desc"
  className?: string
}

const ProductCardsList: React.FC<ProductCardsListProps> = ({
  filters: externalFilters,
  sortBy: externalSortBy = "name",
  sortOrder: externalSortOrder = "asc",
  className = "",
}) => {
  // Favoritos desde backend
  const {
    toggleFavorite,
    isFavorite,
    favoriteIds,
    isLoading: favoritesLoading,
  } = useFavorites()

  // Carrito
  const { addItem, isLoading: cartLoading, itemCount } = useCartContext()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)

  // Filtros por defecto
  const defaultFilters: FilterState = {
    priceRange: { min: 0, max: Infinity },
    selectedBrands: [],
    yearRange: { min: 1990, max: new Date().getFullYear() },
  }
  const filters = externalFilters || defaultFilters

  // Productos filtrados
  const {
    products: allProducts,
    loading,
    error,
    totalCount,
    refetch,
  } = useProductsFiltered({
    searchTerm: "",
    filters,
    sortBy: externalSortBy,
    sortOrder: externalSortOrder,
    page: 1,
    limit: 100,
  })

  // Ocultar algunos + dejar solo con stock
  const products = useMemo(() => {
    const productsToHide = [
      "Aceite Castrol 10W40",
      "Amortiguador Monroe",
      "Bujía NGK Iridium",
      "Filtro de Aceite Bosch",
    ]
    return allProducts
      .filter((p) => !productsToHide.includes(p.name))
      .filter((p) => p.stock > 0)
  }, [allProducts])

  // Favoritos
  const handleToggleFavorite = async (product: Product) => {
    if (!product.id) return
    await toggleFavorite(product.id)
  }

  const handleToggleFavoriteWithEvent = async (
    e: React.MouseEvent,
    product: Product
  ) => {
    e.preventDefault()
    e.stopPropagation()
    await handleToggleFavorite(product)
  }

  // Carrito (acepta qty; el modal puede mandar cantidad)
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    if (!product?.id || product.stock <= 0) return
    await addItem({
      productId: product.id,
      quantity: Math.max(1, Math.floor(quantity)),
    })
  }

  const handleAddToCartWithEvent = async (
    e: React.MouseEvent,
    product: Product
  ) => {
    e.preventDefault()
    e.stopPropagation()
    await handleAddToCart(product, 1)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
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

  // Estados base
  if (loading) {
    return (
      <div className={`${className} flex justify-center items-center h-64`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-xl p-6 text-center`}>
        <Filter size={48} className="mx-auto mb-2 text-red-600" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error al cargar productos
        </h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header con stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Productos Disponibles
          </h2>
          <p className="text-gray-600">
            Mostrando {products.length} productos
            {totalCount > products.length && ` de ${totalCount} total`}
          </p>
        </div>
      {/*
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Favoritos</p>
            <p className="text-xl font-bold text-red-500">
              {favoriteIds?.length ?? 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">En carrito</p>
            <p className="text-xl font-bold text-blue-500">{itemCount}</p>
          </div>
        </div>*/}
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const isProductFavorite = isFavorite(product.id)
            const isOutOfStock = product.stock <= 0

            return (
              <div
                key={`${product.id}-${index}`}
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
                  {/* <div className="absolute top-4 left-4">{getStockBadge(product.stock)}</div> */}

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
                      <span>{product.year}</span>
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

                  {/* Botón agregar al carrito (opcional; lo dejamos comentado si sólo agregas desde el modal) */}
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
          <button
            onClick={refetch}
            className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold"
          >
            Recargar productos
          </button>
        </div>
      )}

      {/* Modal de detalle (envía qty al handler) */}
      <ProductDetailModal
        isOpen={showProductDetail}
        product={selectedProduct}
        onClose={() => setShowProductDetail(false)}
        onAddToCart={handleAddToCart} // 👈 acepta (product, qty)
      />
    </div>
  )
}

export default ProductCardsList
