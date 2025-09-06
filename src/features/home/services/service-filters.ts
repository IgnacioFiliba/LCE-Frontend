// services/service-filters.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductResponse, ProductQueryParams } from "../types/filters";
import { getApiUrl } from "@/config/urls";

interface ExtendedProductQueryParams
  extends Omit<ProductQueryParams, "sortBy" | "sortOrder"> {
  sortBy?: "name" | "price" | "year" | "brand" | "model" | "engine" | "stock";
  sortOrder?: "asc" | "desc";
  category?: string;
  categoryId?: string | null;
  models?: string | string[];   // CSV o array
  engines?: string | string[];  // CSV o array
  brands?: string | string[];   // <-- importante para tu backend
}

class FiltersService {
  private readonly ALLOWED_QUERY_PARAMS = [
    "limit",
    "page",
    "priceMin",
    "priceMax",
    "yearMin",
    "yearMax",
    "inStock",
    "brands",
    "models",
    "engines",
    "search",
    "category",
    "categoryId",
  ];

  constructor() {
    if (typeof window !== "undefined") {
      console.log("🌐 FiltersService baseURL:", getApiUrl());
    }
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (includeAuth && typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      if (token) (headers as any).Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  // helper: añade key con string o con múltiples valores si es array
  private appendParam(qs: URLSearchParams, key: string, val?: any) {
    if (val === null || val === undefined) return;
    if (!this.ALLOWED_QUERY_PARAMS.includes(key)) return;

    if (Array.isArray(val)) {
      val
        .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
        .forEach((v) => qs.append(key, String(v)));
    } else {
      const s = String(val).trim();
      if (s !== "") qs.append(key, s);
    }
  }

  private buildSafeQueryParams(params: ExtendedProductQueryParams): URLSearchParams {
    const queryParams = new URLSearchParams();

    this.appendParam(queryParams, "limit", params.limit && params.limit > 0 ? Math.min(params.limit, 100) : null);
    this.appendParam(queryParams, "page", params.page && params.page > 0 ? params.page : null);
    this.appendParam(queryParams, "priceMin", params.priceMin && params.priceMin >= 0 ? params.priceMin : null);
    this.appendParam(queryParams, "priceMax", params.priceMax && params.priceMax !== Infinity && params.priceMax > 0 ? params.priceMax : null);
    this.appendParam(queryParams, "yearMin", params.yearMin && params.yearMin > 0 ? params.yearMin : null);
    this.appendParam(queryParams, "yearMax", params.yearMax && params.yearMax > 0 ? params.yearMax : null);
    this.appendParam(queryParams, "inStock", params.inStock);
    this.appendParam(queryParams, "brands", params.brands);     // soporta array
    this.appendParam(queryParams, "models", params.models);     // soporta array
    this.appendParam(queryParams, "engines", params.engines);   // soporta array
    this.appendParam(queryParams, "search", params.search);
    this.appendParam(queryParams, "category", params.category);
    this.appendParam(queryParams, "categoryId", params.categoryId);

    return queryParams;
  }

  async getProducts(params: ExtendedProductQueryParams = {}): Promise<ProductResponse[]> {
    const queryParams = this.buildSafeQueryParams(params);
    if (params.sortBy || params.sortOrder) {
      console.warn("⚠️ sortBy/sortOrder serán manejados en el frontend (ordenamiento local).");
    }

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const url = getApiUrl(endpoint);

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400) {
        const message = Array.isArray((errorData as any).message)
          ? (errorData as any).message.join(", ")
          : (errorData as any).message || "Parámetros de filtros inválidos.";
        throw new Error(`Parámetros inválidos: ${message}`);
      }
      if (response.status === 404) {
        throw new Error("Endpoint no encontrado.");
      }
      if (response.status >= 500) {
        throw new Error("Error del servidor. Intenta de nuevo más tarde.");
      }
      throw new Error((errorData as any).message || `Error ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) return [];

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Respuesta inválida del servidor (JSON).");
    }

    // Tu controlador /products devuelve solo items (array)
    if (Array.isArray(data)) return data as ProductResponse[];
    if (data.products) return data.products as ProductResponse[];
    if (data.data) return data.data as ProductResponse[];
    return [];
  }

  // Ordenamiento local
  sortProductsLocally(
    products: ProductResponse[],
    sortBy?: string,
    sortOrder: "asc" | "desc" = "asc"
  ): ProductResponse[] {
    if (!sortBy || !products.length) return products;

    const cloned = [...products] as any[];
    cloned.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "price":
          aValue = Number(a.price) || 0;
          bValue = Number(b.price) || 0;
          break;
        case "year":
          aValue = Number(a.year) || 0;
          bValue = Number(b.year) || 0;
          break;
        case "brand":
          aValue = a.brand?.toLowerCase() || "";
          bValue = b.brand?.toLowerCase() || "";
          break;
        case "model":
          aValue = a.model?.toLowerCase() || "";
          bValue = b.model?.toLowerCase() || "";
          break;
        case "engine":
          aValue = a.engine?.toLowerCase() || "";
          bValue = b.engine?.toLowerCase() || "";
          break;
        case "stock":
          aValue = Number(a.stock) || 0;
          bValue = Number(b.stock) || 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return cloned as ProductResponse[];
  }

  async getProductsWithSort(params: ExtendedProductQueryParams = {}): Promise<ProductResponse[]> {
    // 🔧 FIX: usar this, no self
    const products = await this.getProducts(params);
    if (params.sortBy) {
      return this.sortProductsLocally(products, params.sortBy, params.sortOrder);
    }
    return products;
  }

  // Facets: tu backend NO tiene /products/facets → vamos directo al fallback
  async getFacets(): Promise<{
    brands: string[];
    models: string[];
    engines: string[];
    categories: { id: string; name: string }[];
  }> {
    // Fallback: derivar de productos
    const products = await this.getProducts({ limit: 1000 });

    const brands = Array.from(
      new Set(products.map((p: any) => p.brand).filter(Boolean))
    ).sort();

    const models = Array.from(
      new Set(products.map((p: any) => p.model).filter(Boolean))
    ).sort();

    const engines = Array.from(
      new Set(products.map((p: any) => p.engine).filter(Boolean))
    ).sort();

    const cMap = new Map<string, string>();
    products.forEach((p: any) => {
      const id = p.category?.id || p.categoryId;
      const name = p.category?.name || p.categoryName;
      if (id && name && !cMap.has(id)) cMap.set(id, name);
    });
    const categories = Array.from(cMap, ([id, name]) => ({ id, name }));

    return { brands, models, engines, categories };
  }

  async getBrands(): Promise<string[]> {
    try {
      const { brands } = await this.getFacets();
      return brands;
    } catch {
      return [];
    }
  }

  debugParams(params: ExtendedProductQueryParams): void {
    console.log("🔍 DEBUG - Params recibidos:", params);
    const safe = this.buildSafeQueryParams(params);
    console.log("🔍 DEBUG - Query string:", safe.toString());
    const ignored = Object.keys(params).filter(
      (k) =>
        !this.ALLOWED_QUERY_PARAMS.includes(k) &&
        (params as any)[k as keyof ExtendedProductQueryParams] !== undefined
    );
    if (ignored.length) console.warn("⚠️ Ignorados:", ignored);
  }
}

const filtersService = new FiltersService();
export default filtersService;
export { FiltersService, filtersService };
