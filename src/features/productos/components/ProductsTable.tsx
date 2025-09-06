// components/ProductsTable.tsx
"use client"

import React from "react"
import { Search, RefreshCw, Pencil, Eye, Tag, Box, DollarSign } from "lucide-react"
import useProducts from "@/features/productos/hooks/useProducts"
import { Product } from "../types/products"
import ProductEditModal from "./ProductEditModal"
import ProductDetailModal from "./ProductDetailModal"
import { toast } from "sonner" 

const ProductsTable: React.FC = () => {
  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,       // <- del hook
    hasNextPage,
    hasPrevPage,
    totalProducts,    // <- del hook
    refresh,
    search,
    setPage,
    updateProduct,
    clearError,
  } = useProducts({ initialParams: { limit: 10 }, autoFetch: true })

  const [searchTerm, setSearchTerm] = React.useState("")
  const [selected, setSelected] = React.useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Modal de detalle
  const [viewOpen, setViewOpen] = React.useState(false)
  const [viewProduct, setViewProduct] = React.useState<Product | null>(null)

  // búsqueda (igual lógica que orders: dispara si 0 o >2 chars)
  const handleSearch = async (val: string) => {
    setSearchTerm(val)
    if (val.length === 0 || val.length > 2) await search(val)
  }

  const openEdit = (p: Product) => {
    setSelected(p)
    setIsModalOpen(true)
  }

  const closeEdit = () => {
    setIsModalOpen(false)
    setSelected(null)
  }

  const openView = (p: Product) => {
    setViewProduct(p)
    setViewOpen(true)
  }

  const closeView = () => {
    setViewOpen(false)
    setViewProduct(null)
  }

  const onSave = async (payload: Partial<Product>) => {
    if (!selected) return false
    const ok = await updateProduct(selected.id, {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      stock: payload.stock,
      imgUrl: payload.imgUrl,
    })
     if (ok) {
    toast.success("Producto actualizado")  // 👈 aquí va
    closeEdit()
  }
    return ok
  }

  const safeProducts = Array.isArray(products) ? products : []

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Box className="h-5 w-5" />
              Gestión de Productos
            </h3>
            <p className="text-sm text-gray-500 mt-1">Busca, visualiza y edita productos</p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md bg-white hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        <div className="p-6">
          {/* búsqueda */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar por nombre, marca, modelo, categoría..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
              {error}
              <button className="ml-3 underline" onClick={clearError}>Cerrar</button>
            </div>
          )}

          {/* tabla */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca/Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      {loading ? "Cargando productos..." : "No hay productos para mostrar"}
                    </td>
                  </tr>
                ) : (
                  safeProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                            {p.imgUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.imgUrl} alt={p.name} className="h-10 w-10 object-cover" />
                            ) : (
                              <Tag className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{p.name}</div>
                            {p.engine && <div className="text-xs text-gray-500">{p.engine}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{p.brand}</div>
                        <div className="text-xs text-gray-500">{p.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                          {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
                            .format(Number(p.price || 0))
                            .replace(/^\$/, "")}
                        </div>
                      </td>
                      <td className="px-6 py-4">{p.stock}</td>
                      <td className="px-6 py-4">{p.year}</td>
                      <td className="px-6 py-4">{p.category?.name ?? "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            className="inline-flex items-center p-2 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-2"
                            onClick={() => openEdit(p)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="inline-flex items-center p-2 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-2"
                            onClick={() => openView(p)}
                            title="Ver"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* paginación (idéntica a Orders) */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Mostrando {safeProducts.length} de {totalProducts || 0} productos
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((currentPage || 1) - 1)}
                disabled={!hasPrevPage || loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
                Página {currentPage || 1} de {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((currentPage || 1) + 1)}
                disabled={!hasNextPage || loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ProductEditModal
        isOpen={isModalOpen}
        product={selected}
        onClose={closeEdit}
        onSave={onSave}
      />

      <ProductDetailModal
        isOpen={viewOpen}
        product={viewProduct}
        onClose={closeView}
      />
    </div>
  )
}

export default ProductsTable
