/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from "react"
import { X, Tag, Box, DollarSign, Package, Star, Calendar, Cpu, Wrench } from "lucide-react"
import { Product } from "../types/products"

type Props = {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

const ProductDetailModal: React.FC<Props> = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null

  const formatPrice = (value: number | string, currency = "COP") => {
    const n = typeof value === "string" ? parseFloat(value) : value
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(isNaN(n) ? 0 : n)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Detalle del Producto</h2>
            <p className="text-sm text-gray-500">{product.id?.slice(0, 8)}...</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top: imagen + nombre + precio/stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {product.imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imgUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Tag className="h-10 w-10 text-gray-400" />
                )}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category?.name ?? "Sin categoría"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Precio</span>
                    </div>
                    <span className="text-lg font-bold text-blue-900">{formatPrice(product.price)}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-emerald-600 mr-2" />
                      <span className="text-sm font-medium text-emerald-900">Stock</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (product.stock ?? 0) > 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {(product.stock ?? 0) > 0 ? `${product.stock} uds` : "Sin stock"}
                    </span>
                  </div>
                </div>
              </div>

              {/* rating */}
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-yellow-50 text-yellow-800 border border-yellow-200">
                  <Star className="h-3.5 w-3.5 mr-1" />
                  {Number(product.averageRating ?? 0).toFixed(1)}
                </div>
                <span className="text-xs text-gray-500">
                  {product.totalReviews ?? 0} reseña{(product.totalReviews ?? 0) === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-1">
                <Box className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Marca / Modelo</span>
              </div>
              <p className="text-sm text-gray-900">{product.brand || "-"}</p>
              <p className="text-xs text-gray-500">{product.model || "-"}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Año</span>
              </div>
              <p className="text-sm text-gray-900">{product.year || "-"}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-1">
                <Cpu className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Motor</span>
              </div>
              <p className="text-sm text-gray-900">{product.engine || "-"}</p>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              <Wrench className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Descripción</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {product.description?.trim() || "Este producto no tiene descripción."}
            </p>
          </div>

          {/* Comentarios (si vienen) */}
          {Array.isArray((product as any)?.comments) && (product as any).comments.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Comentarios</div>
              <div className="space-y-3">
                {(product as any).comments.map((c: any, idx: number) => (
                  <div key={c.id || idx} className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-900">{c.user?.name ?? "Usuario"}</div>
                    <div className="text-xs text-gray-500 mb-1">{c.user?.email ?? ""}</div>
                    <p className="text-sm text-gray-700">{c.text ?? c.comment ?? ""}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
