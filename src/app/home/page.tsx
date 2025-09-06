/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import ButtonAdmin from "@/features/home/components/ButtonAdminHome"
import ProductCardsList from "@/features/home/components/ProductCardList"
import ProductFilters from "@/features/home/components/ProductFilters"
import SearchBarWithAPI from "@/features/home/components/Searchbar"
import { FilterState } from "@/features/home/types/filters"
import LayoutWrapper from "@/shared/Wrapper"
import React, { useState, useEffect } from "react"
import { useProductsFiltered } from "@/features/home/hooks/useFilters"
import ChatWidget from "@/features/chat/components/ChatWidget"

const PageHome = () => {
  // ESTADOS
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filters, setFilters] = useState<FilterState>({
    selectedBrands: [],
    selectedModels: [],
    selectedEngines: [],
    yearRange: { min: 1990, max: new Date().getFullYear() },
    categoryId: null,
  })
  const [sortBy, setSortBy] = useState<"name" | "price" | "brand" | "year">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // HOOK con productos y facets
  const {
    products,
    availableBrands,
    availableModels,
    availableEngines,
    availableCategories,
    loading,
    error,
  } = useProductsFiltered({
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    page: 1,
    limit: 50,
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
      } catch {
        // noop
      }
    } else if (token) {
      try {
        if (!token.includes("[object")) {
          localStorage.setItem("token", token)
          window.dispatchEvent(new CustomEvent("auth-updated"))
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch {
        // noop
      }
    }

    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setCurrentUser(parsedUser)
      } catch {
        // noop
      }
    }
  }, [])

  // HANDLERS
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }))
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prev: "asc" | "desc") => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortOrder(newSortBy === "price" || newSortBy === "year" ? "desc" : "asc")
    }
  }

  const handleToggleFilters = () => setShowFilters((prev: boolean) => !prev)

  const handleClearFilters = () => {
    setFilters({
      selectedBrands: [],
      selectedModels: [],
      selectedEngines: [],
      yearRange: { min: 1990, max: new Date().getFullYear() },
      categoryId: null,
    })
  }

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
                  Encuentra los mejores repuestos de vehículos con la mejor calidad y garantía
                </p>
              </div>

              {/* Botón admin */}
              <div className="hidden md:block">
                <ButtonAdmin user={currentUser} />
              </div>
            </div>
          </section>

          {/* SearchBar */}
          <div>
            <SearchBarWithAPI
              onResultsChange={() => {}}
              onSearchTermChange={(term: string) => setSearchTerm(term)}
            />
          </div>

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

          {/* Lista de productos con estilo de <ProductCardsList /> */}
          {loading ? (
            <p className="text-gray-500">Cargando productos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ProductCardsList
              products={products}
              filters={filters}
              sortBy={sortBy}
              sortOrder={sortOrder}
              className="w-full"
            />
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
