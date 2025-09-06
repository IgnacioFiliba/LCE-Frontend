// components/ProductCard.tsx - ACTUALIZADO CON FAVORITOS INTEGRADOS
import React from "react"
import { ShoppingCart, Heart, Calendar, Cog, Loader2 } from "lucide-react"
import Image from "next/image"
import Product from "../../types/products"
import { useCart } from "../../../cart/hooks/useCart"
import { useFavorites } from "@/features/cart/hooks/useFavorites"

interface ProductCardProps {
  product: Product
  onProductClick?: (product: Product) => void
  // ✅ ELIMINAR: Ya no necesitamos estas props
  // onToggleFavorite?: (product: Product) => void
  // isFavorite?: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  // onToggleFavorite, // ✅ ELIMINAR
  // isFavorite = false, // ✅ ELIMINAR
}) => {
  console.log("🔧 ProductCard cargado para:", product.name)
  const { addItem, isLoading } = useCart()
  console.log("🎯 useCart hook loaded:", { addItem: !!addItem, isLoading })

  // ✅ NUEVO: Hook de favoritos integrado
  const {
    toggleFavorite,
    isFavorite,
    isLoading: favoritesLoading,
  } = useFavorites()

  const isInStock = product.stock > 0
  // ✅ NUEVO: Verificar si es favorito usando el ID del producto
  const isProductFavorite = isFavorite(product.id)

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isInStock && !isLoading) {
      try {
        // ✅ Usar el ID real del producto que viene del backend
        const productId = product.id

        if (!productId) {
          console.error("❌ Producto sin ID válido:", product)
          return
        }

        await addItem({
          productId: productId, // ✅ ID real del backend
          quantity: 1,
        })

        console.log("✅ Producto agregado al carrito:", product.name)
      } catch (error) {
        console.error("❌ Error en handleAddToCart:", error)
      }
    } else {
      console.log(
        "🎯 No se ejecuta addItem - isInStock:",
        isInStock,
        "isLoading:",
        isLoading
      )
    }
  }

  // ✅ NUEVO: Handler interno para favoritos
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!product.id) {
      console.error("❌ Producto sin ID válido:", product)
      return
    }

    console.log("❤️ Toggle favorite para:", product.id, product.name)
    await toggleFavorite(product.id)
  }

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Imagen del producto */}
      <div className="relative overflow-hidden">
        <Image
          src={product.imgUrl}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            // ✅ EVITAR LOOP INFINITO
            const target = e.target as HTMLImageElement
            if (!target.dataset.fallback) {
              target.dataset.fallback = "true"
              target.src = "https://picsum.photos/400/400"
            }
          }}
        />

        {/* Badge de stock */}
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold ${
            isInStock ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {isInStock ? `Stock: ${product.stock}` : "Sin Stock"}
        </div>

        {/* ✅ ACTUALIZADO: Botón de favoritos con loading */}
        <button
          onClick={handleToggleFavorite}
          disabled={favoritesLoading}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isProductFavorite
              ? "bg-red-500 text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
          } ${favoritesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {favoritesLoading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Heart
              size={16}
              fill={isProductFavorite ? "currentColor" : "none"}
            />
          )}
        </button>
      </div>

      {/* Contenido de la card */}
      <div className="p-4">
        {/* Marca y Modelo */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            {product.brand}
          </span>
          <span className="text-xs text-gray-500">{product.model}</span>
        </div>

        {/* Nombre del producto */}
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* Información técnica */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar
              size={14}
              className="mr-2"
            />
            <span>Año: {product.year}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Cog
              size={14}
              className="mr-2"
            />
            <span className="truncate">Motor: {product.engine}</span>
          </div>
        </div>

        {/* Precio */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-800">
              ${product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Botón de agregar al carrito */}
        <button
          onClick={handleAddToCart}
          disabled={!isInStock || isLoading}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
            isInStock && !isLoading
              ? "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <ShoppingCart size={16} />
          )}
          {isLoading
            ? "Agregando..."
            : isInStock
            ? "Agregar al Carrito"
            : "No Disponible"}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
