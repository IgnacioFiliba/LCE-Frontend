/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect, useMemo } from "react"

import ButtonAdmin from "@/features/home/components/ButtonAdminHome"
import ProductCardsList from "@/features/home/components/ProductCardList"
import ProductFilters from "@/features/home/components/ProductFilters"
import SearchBarWithAPI from "@/features/home/components/Searchbar"
import { FilterState } from "@/features/home/types/filters"
import LayoutWrapper from "@/shared/Wrapper"
import { useProductsFiltered } from "@/features/home/hooks/useFilters"
import ChatWidget from "@/features/chat/components/ChatWidget"

// UI (shadcn) + icons
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"

const PageHome = () => {
  // ESTADOS
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [filters, setFilters] = useState<FilterState>({
    selectedBrands: [],
    selectedModels: [],
    selectedEngines: [],
    yearRange: { min: 1990, max: new Date().getFullYear() },
    priceRange: { min: 0, max: 9_999_999 },
    categoryId: null,
  })
  const [sortBy, setSortBy] = useState<"name" | "price" | "brand" | "year">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showFilters, setShowFilters] = useState(false)

  // 🔎 BÚSQUEDA
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[] | null>(null)

  // 🔢 PAGINACIÓN (client-side)
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const resetToFirstPage = () =>
    setPagination((p) => ({ ...p, page: 1 }))

  // HOOK con productos y facets (catálogo base)
  // Traemos un máximo de 100 y paginamos en el cliente
  const {
    products,
    availableBrands,
    availableModels,
    availableEngines,
    availableCategories,
    loading,
    error,
  } = useProductsFiltered({
    searchTerm, // si tu hook lo ignora, no pasa nada
    filters,
    sortBy,
    sortOrder,
    page: 1,
    limit: 100, // traemos un lote y paginamos localmente
  })

  // GOOGLE AUTH
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")
    const data = urlParams.get("data")

    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data))
        const accessToken =
          parsedData.access_Token || parsedData.accessToken || parsedData.token
        if (accessToken && parsedData.user) {
          localStorage.setItem("token", accessToken)
          localStorage.setItem("user", JSON.stringify(parsedData.user))
          window.dispatchEvent(new CustomEvent("auth-updated"))
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch {/* noop */}
    } else if (token) {
      try {
        if (!token.includes("[object")) {
          localStorage.setItem("token", token)
          window.dispatchEvent(new CustomEvent("auth-updated"))
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch {/* noop */}
    }

    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setCurrentUser(parsedUser)
      } catch {/* noop */}
    }
  }, [])

  // Cuando se limpia el término de búsqueda, vaciamos resultados del buscador
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null)
    }
  }, [searchTerm])

  // Resetear a la primera página cuando cambien criterios
  useEffect(() => {
    resetToFirstPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters, sortBy, sortOrder])

  // HANDLERS
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortOrder(newSortBy === "price" || newSortBy === "year" ? "desc" : "asc")
    }
  }

  const handleToggleFilters = () => setShowFilters((prev) => !prev)

  const handleClearFilters = () => {
    setFilters({
      selectedBrands: [],
      selectedModels: [],
      selectedEngines: [],
      yearRange: { min: 1990, max: new Date().getFullYear() },
      priceRange: { min: 0, max: 9_999_999 },
      categoryId: null,
    })
  }

  // 👉 Qué lista usamos:
  const baseList = searchTerm.trim()
    ? (searchResults ?? [])
    : products

  // 🔍 Normalizamos la lista a mostrar (ocultos y stock) para que la paginación sea consistente
  const displayList = useMemo(() => {
    const HIDE = new Set<string>([
      "Aceite Castrol 10W40",
      "Amortiguador Monroe",
      "Bujía NGK Iridium",
      "Filtro de Aceite Bosch",
    ])
    return (Array.isArray(baseList) ? baseList : [])
      .filter((p: any) => !HIDE.has(p?.name))
      .filter((p: any) => (typeof p?.stock === "number" ? p.stock > 0 : true))
  }, [baseList])

  // 📄 Paginación local
  const totalItems = displayList.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.limit))
  const currentPage = Math.min(pagination.page, totalPages)
  const startIndex = (currentPage - 1) * pagination.limit
  const endIndex = startIndex + pagination.limit
  const paginatedProducts = displayList.slice(startIndex, endIndex)

  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  const goFirst = () => setPagination((p) => ({ ...p, page: 1 }))
  const goPrev = () =>
    setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
  const goNext = () =>
    setPagination((p) => ({ ...p, page: Math.min(totalPages, p.page + 1) }))
  const goLast = () => setPagination((p) => ({ ...p, page: totalPages }))

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <section className="mb-8 mt-24">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Nuestros Productos
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Encontrá los mejores repuestos con calidad y garantía.
                </p>
              </div>
              <div className="hidden md:block">
                <ButtonAdmin user={currentUser} />
              </div>
            </div>
          </section>

          {/* SearchBar */}
          <SearchBarWithAPI
            onResultsChange={(res) => setSearchResults(res)}
            onSearchTermChange={(term: string) => setSearchTerm(term)}
          />

          {/* Filtros */}
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            availableBrands={availableBrands}
            availableModels={availableModels}
            availableEngines={availableEngines}
            availableCategories={availableCategories}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            showFilters={showFilters}
            onToggleFilters={handleToggleFilters}
            onClearFilters={handleClearFilters}
            className="mb-4"
          />

          {/* Lista de productos (paginada) */}
          {(!searchTerm.trim() && loading) ? (
            <p className="text-gray-500">Cargando productos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <ProductCardsList
                products={paginatedProducts}
                searchTerm={searchTerm}
                filters={filters}
                sortBy={sortBy}
                sortOrder={sortOrder}
                className="w-full"
              />

              {/* Paginación */}
              <div className="mt-8">
                <Card className="shadow-md">
                  <CardContent className="flex items-center justify-between pt-6">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goFirst}
                        disabled={isFirstPage}
                        className={isFirstPage ? "opacity-50" : ""}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goPrev}
                        disabled={isFirstPage}
                        className={isFirstPage ? "opacity-50" : ""}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded">
                        {currentPage}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goNext}
                        disabled={isLastPage}
                        className={isLastPage ? "opacity-50" : ""}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goLast}
                        disabled={isLastPage}
                        className={isLastPage ? "opacity-50" : ""}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Info total resultados */}
                <p className="mt-2 text-xs text-gray-500">
                  Mostrando {paginatedProducts.length} de {totalItems} resultados
                </p>
              </div>
            </>
          )}
        </main>

        {/* FAB móvil */}
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <ButtonAdmin user={currentUser} />
        </div>
      </div>
      <ChatWidget />
    </LayoutWrapper>
  )
}

export default PageHome
