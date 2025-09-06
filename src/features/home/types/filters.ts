// types/filters.ts

// Filtros que maneja el front (coincidir con ProductFilters y el hook)
export interface FilterState {
  priceRange: { min: number; max: number };
  selectedBrands: string[];
  selectedModels: string[];     // ✅ NUEVO
  selectedEngines: string[];    // ✅ NUEVO
  yearRange: { min: number; max: number };
  categoryId: string | null;    // ✅ NUEVO
}

// Parámetros aceptados por el API (sumamos models/engines/categoryId)
export interface ProductFiltersAPI {
  limit?: number;
  page?: number;
  priceMax?: number;
  priceMin?: number;
  yearMax?: number;
  yearMin?: number;
  inStock?: boolean;
  brands?: string | string[];   // <-- permitir array
  models?: string | string[];
  engines?: string | string[];    // ✅ CSV de motores
  categoryId?: string | null; // ✅ categoría seleccionada
  search?: string;     // Texto parcial, case-insensitive
}

// Para convertir FilterState a parámetros de API (+ sort opcional)
export interface ProductQueryParams extends ProductFiltersAPI {
  sortBy?: "name" | "price" | "brand" | "year";
  sortOrder?: "asc" | "desc";
}

// Respuesta del API de productos - Actualizada con categoryId
export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  stock: number;
  imgUrl: string;
  year: number | string; // 🔧 acepta number o string según tu backend
  brand: string;
  model: string;
  engine: string;
  categoryId: string; // Compatibilidad
  category: {
    id: string;
    name: string;
    products: string[];
  };
  description: string;
  orderDetails: OrderDetail[];
}

interface OrderDetail {
  id: string;
  price: number;
  order: {
    id: string;
    date: string;
    status: string;
    orderDetails: string;
    user: {
      id: string;
      name: string;
      email: string;
      password: string;
      phone: number;
      country: string;
      address: string;
      city: string;
      isAdmin: boolean;
      isSuperAdmin: boolean;
      orders: string[];
    };
  };
  products: string[];
}
