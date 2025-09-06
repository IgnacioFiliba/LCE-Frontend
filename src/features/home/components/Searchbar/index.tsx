/* eslint-disable @typescript-eslint/no-explicit-any */
// components/SearchBarWithAPI.tsx
import React, { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { useProductSearch } from "../../hooks/useSearch"

interface SearchBarWithAPIProps {
  onResultsChange?: (results: any[]) => void
  onSearchTermChange?: (term: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

const SearchBarWithAPI: React.FC<SearchBarWithAPIProps> = ({
  onResultsChange,
  onSearchTermChange,
  placeholder = "Buscar productos por nombre, marca, modelo...",
  className = "",
  debounceMs = 500,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Hook de búsqueda
  const { results, loading, error, searchProducts, clearResults } =
    useProductSearch()

  // ✅ FUNCIÓN HELPER PARA LIMPIAR TIMEOUT
  const clearPendingSearch = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // ✅ FUNCIÓN PARA EJECUTAR BÚSQUEDA INMEDIATA
  const executeSearch = (term: string) => {
    clearPendingSearch() // Limpiar cualquier búsqueda pendiente

    if (term.trim()) {
      console.log("🔍 Executing immediate search for:", term)
      searchProducts(term)
    } else {
      console.log("🔍 Clearing search results")
      clearResults()
    }
  }

  // Debounce para la búsqueda automática
  useEffect(() => {
    clearPendingSearch() // Limpiar timeout anterior

    timeoutRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        console.log("🔍 Debounced search triggered for:", searchTerm)
        searchProducts(searchTerm)
      } else {
        clearResults()
      }
    }, debounceMs)

    return () => clearPendingSearch()
  }, [searchTerm, searchProducts, clearResults, debounceMs])

  // Notificar cambios de resultados al padre
  useEffect(() => {
    onResultsChange?.(results)
  }, [results, onResultsChange])

  // Notificar cambios de término de búsqueda al padre
  useEffect(() => {
    onSearchTermChange?.(searchTerm)
  }, [searchTerm, onSearchTermChange])

  // ✅ MANEJAR ENTER - BÚSQUEDA INMEDIATA MEJORADA
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      console.log("🔍 Enter pressed - executing immediate search")
      executeSearch(searchTerm)
    }
  }

  // ✅ MANEJAR CAMBIO EN EL INPUT
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  // ✅ LIMPIAR BÚSQUEDA
  const clearSearch = () => {
    clearPendingSearch() // Limpiar cualquier búsqueda pendiente
    setSearchTerm("")
    clearResults()
  }

  // ✅ FUNCIÓN PARA BÚSQUEDA MANUAL (botón buscar)
  const handleManualSearch = () => {
    console.log("🔍 Manual search button clicked")
    executeSearch(searchTerm)
  }

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => clearPendingSearch()
  }, [])

  return (
    <div className={`${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="flex gap-4 mb-4">
        {/* Input de búsqueda */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />

          {/* Loading spinner en el input */}
          {loading && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <Loader2
                className="animate-spin text-blue-500"
                size={16}
              />
            </div>
          )}

          {/* Botón limpiar búsqueda */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ✅ BOTÓN DE BÚSQUEDA
        <button
          onClick={handleManualSearch}
          disabled={!searchTerm.trim() || loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <Loader2
              className="animate-spin"
              size={16}
            />
          ) : (
            <Search size={16} />
          )}
          Buscar
        </button> */}
      </div>

      {/* Estado de búsqueda */}
      {searchTerm && (
        <div className="mb-4">
          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2
                className="animate-spin"
                size={16}
              />
              <span className="text-sm">
                Buscando &ldquo;{searchTerm}&rdquo;...
              </span>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="text-green-600 text-sm">
              ✅ {results.length} productos encontrados para &ldquo;{searchTerm}
              &rdquo;
            </div>
          )}

          {!loading && !error && results.length === 0 && searchTerm && (
            <div className="text-gray-500 text-sm">
              No se encontraron productos para &ldquo;{searchTerm}&rdquo;
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">❌ Error: {error}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBarWithAPI
