/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FilterState,
  ProductResponse,
  ProductQueryParams,
} from "../types/filters";
import { filtersService } from "../services/service-filters";

interface UseProductsFilteredProps {
  searchTerm?: string;
  filters: FilterState;
  sortBy: "name" | "price" | "brand" | "year";
  sortOrder: "asc" | "desc";
  page?: number;
  limit?: number;
}

interface UseProductsFilteredReturn {
  products: ProductResponse[];
  loading: boolean;
  error: string | null;
  availableBrands: string[];
  availableModels: string[];
  availableEngines: string[];
  availableCategories: { id: string; name: string }[];
  totalCount: number;
  refetch: () => void;
}

const useProductsFiltered = ({
  searchTerm = "",
  filters,
  sortBy,
  sortOrder,
  page = 1,
  limit = 50,
}: UseProductsFilteredProps): UseProductsFilteredReturn => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableEngines, setAvailableEngines] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const trimmedSearch = (searchTerm ?? "").trim();
  const isSearchActive = trimmedSearch.length > 0;

  // ------- Build API params from FilterState -------
  const apiParams: ProductQueryParams & {
    brands?: string[];
    models?: string[];
    engines?: string[];
    categoryId?: string | null;
    sortBy?: "name" | "price" | "year" | "brand" | "model" | "engine" | "stock";
    sortOrder?: "asc" | "desc";
  } = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const params: any = {
      limit,
      page,
      search: isSearchActive ? trimmedSearch : undefined,
      sortBy,
      sortOrder,
    };

    if (!isSearchActive) {
      if (filters.yearRange?.min && filters.yearRange.min > 0) {
        params.yearMin = filters.yearRange.min;
      }
      if (
        filters.yearRange?.max &&
        filters.yearRange.max > 0 &&
        filters.yearRange.max <= currentYear
      ) {
        params.yearMax = filters.yearRange.max;
      }
    }

    if (filters.selectedBrands?.length) {
      params.brands = filters.selectedBrands;
    }
    if (filters.selectedModels?.length) {
      params.models = filters.selectedModels;
    }
    if (filters.selectedEngines?.length) {
      params.engines = filters.selectedEngines;
    }

    if (filters.categoryId) {
      params.categoryId = filters.categoryId;
    }

    return params;
  }, [limit, page, trimmedSearch, isSearchActive, filters, sortBy, sortOrder]);

  // ------- Fetch products -------
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await filtersService.getProductsWithSort(apiParams);

      // Optional: esconder algunos seeds
      const HIDE = new Set<string>([
        "Aceite Castrol 10W40",
        "Amortiguador Monroe",
        "Bujía NGK Iridium",
        "Filtro de Aceite Bosch",
        "Pastilla de Freno Brembo",
      ]);

      const filtered = data.filter((p) => !HIDE.has(p.name));

      const mapped = filtered.map((p: any) => ({
        ...p,
        categoryId: p.categoryId || p.category?.id || "",
      }));

      setProducts(mapped);
      setTotalCount(mapped.length);
    } catch (err: any) {
      console.error("❌ HOOK - Error:", err);
      setError(err?.message || "Error desconocido");
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  // ------- Fetch facets dinámicas según filtros -------
  const fetchFacets = useCallback(async () => {
    try {
      const facetParams = {
        // 🔑 Lo central para tu caso: marcas
        brands: filters.selectedBrands?.length ? filters.selectedBrands : undefined,
        // mantener consistencia con el resto de filtros activos
        models: filters.selectedModels?.length ? filters.selectedModels : undefined,
        engines: filters.selectedEngines?.length ? filters.selectedEngines : undefined,
        categoryId: filters.categoryId || undefined,
        // respeta años si no hay búsqueda activa (evita excluir por year al buscar texto)
        yearMin: !isSearchActive ? (apiParams as any).yearMin : undefined,
        yearMax: !isSearchActive ? (apiParams as any).yearMax : undefined,
        // si querés también cruzar por precio/stock/búsqueda, podés agregar:
        priceMin: (apiParams as any).priceMin,
        priceMax: (apiParams as any).priceMax,
        inStock: (apiParams as any).inStock,
        search: (apiParams as any).search,
      };

      const facets = await filtersService.getFacets(facetParams);
      const nextBrands = facets.brands || [];
      const nextModels = facets.models || [];
      const nextEngines = facets.engines || [];
      const nextCategories = facets.categories || [];

      setAvailableBrands(nextBrands);
      setAvailableModels(nextModels);
      setAvailableEngines(nextEngines);
      setAvailableCategories(nextCategories);
    } catch (e) {
      console.warn("⚠️ Facets endpoint no disponible o error; usando fallback derivado si aplica");
      try {
        const facets = await filtersService.getFacets();
        setAvailableBrands(facets.brands || []);
        setAvailableModels(facets.models || []);
        setAvailableEngines(facets.engines || []);
        setAvailableCategories(facets.categories || []);
      } catch (err) {
        console.error("❌ Error derivando facets:", err);
        setAvailableBrands([]);
        setAvailableModels([]);
        setAvailableEngines([]);
        setAvailableCategories([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.selectedBrands, filters.selectedModels, filters.selectedEngines, filters.categoryId, isSearchActive, (apiParams as any).yearMin, (apiParams as any).yearMax]);

  // Effects
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchFacets();
  }, [fetchFacets]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    availableBrands,
    availableModels,
    availableEngines,
    availableCategories,
    totalCount,
    refetch,
  };
};

export default useProductsFiltered;
export { useProductsFiltered };
