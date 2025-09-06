/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useProductsFiltered.ts
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

  // ------- Build API params from FilterState -------
  const apiParams: ProductQueryParams & {
    brands?: string[];
    models?: string[];
    engines?: string[];
    categoryId?: string | null;
  } = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const params: any = {
      limit,
      page,
      search: searchTerm.trim() || undefined,
      sortBy,
      sortOrder,
    };

    // Year filters
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

    // Brand/Model/Engine as arrays
    if (filters.selectedBrands?.length) {
      params.brands = filters.selectedBrands;
    }
    if (filters.selectedModels?.length) {
      params.models = filters.selectedModels;
    }
    if (filters.selectedEngines?.length) {
      params.engines = filters.selectedEngines;
    }

    // Category
    if (filters.categoryId) {
      params.categoryId = filters.categoryId;
    }

    return params;
  }, [searchTerm, filters, sortBy, sortOrder, page, limit]);

  // ------- Fetch products -------
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await filtersService.getProductsWithSort(apiParams);

      // Optional: hide seeder items
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

  // ------- Fetch facets -------
  const fetchFacets = useCallback(async () => {
    try {
      const facets = await filtersService.getFacets();
      setAvailableBrands(facets.brands || []);
      setAvailableModels(facets.models || []);
      setAvailableEngines(facets.engines || []);
      setAvailableCategories(facets.categories || []);
    } catch (e) {
      console.warn("⚠️ Facets endpoint no disponible, usando fallback");
      try {
        const sample = await filtersService.getProducts({ limit: 1000 });
        const brands = Array.from(
          new Set(sample.map((p: any) => p.brand).filter(Boolean))
        ).sort();
        const models = Array.from(
          new Set(sample.map((p: any) => p.model).filter(Boolean))
        ).sort();
        const engines = Array.from(
          new Set(sample.map((p: any) => p.engine).filter(Boolean))
        ).sort();
        const cMap = new Map<string, string>();
        sample.forEach((p: any) => {
          const id = p.category?.id || p.categoryId;
          const name = p.category?.name || p.categoryName;
          if (id && name && !cMap.has(id)) cMap.set(id, name);
        });
        setAvailableBrands(brands);
        setAvailableModels(models);
        setAvailableEngines(engines);
        setAvailableCategories(Array.from(cMap, ([id, name]) => ({ id, name })));
      } catch (err) {
        console.error("❌ Error derivando facets:", err);
        setAvailableBrands([]);
        setAvailableModels([]);
        setAvailableEngines([]);
        setAvailableCategories([]);
      }
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchFacets();
  }, [fetchFacets]);

  const refetch = useCallback(() => {
    fetchProducts();
    fetchFacets();
  }, [fetchProducts, fetchFacets]);

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
