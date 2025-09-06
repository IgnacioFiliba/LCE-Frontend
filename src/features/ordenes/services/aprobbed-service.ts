/* eslint-disable @typescript-eslint/no-explicit-any */
// services/ordersService.ts

import { getApiUrl } from "@/config/urls";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface OrderStatusUpdate {
  id: string;
  status: string;
  updatedAt: string;
}

export class OrdersService {
  /**
   * Obtener token de autenticación del localStorage
   */
  private static getAuthToken(): string | null {
    try {
      if (typeof window === "undefined") return null;
      
      const token = localStorage.getItem("token");
      if (!token || token === "undefined" || token === "null") {
        return null;
      }
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  /**
   * Crear headers con autenticación
   */
  private static createAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Método helper para hacer requests autenticados
   */
  private static async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const fullUrl = getApiUrl(endpoint);
    
    if (typeof window !== "undefined") {
      console.log("📤 Making authenticated request to:", fullUrl);
    }

    try {
      const response = await fetch(fullUrl, {
        headers: {
          ...this.createAuthHeaders(),
          ...options.headers,
        },
        credentials: "include",
        ...options,
      });

      if (typeof window !== "undefined") {
        console.log("📥 Response status:", response.status);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Manejar errores de autenticación
        if (response.status === 401) {
          // Token expirado o inválido - podrías disparar un logout aquí
          console.error("❌ Token inválido o expirado");
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente");
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción");
        }
        if (response.status === 404) {
          throw new Error("Recurso no encontrado");
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde");
        }

        throw new Error(
          errorData.message || 
          errorData.error || 
          `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (typeof window !== "undefined") {
        console.log("✅ Request successful");
      }

      return data;
    } catch (error) {
      if (typeof window !== "undefined") {
        console.error("❌ Request failed:", error);
      }
      throw error;
    }
  }

  /**
   * Obtener todas las órdenes
   */
  static async getOrders(): Promise<ApiResponse<any[]>> {
    try {
      const data = await this.makeAuthenticatedRequest("/orders", {
        method: 'GET',
      });
      
      return {
        success: true,
        data: data,
        message: 'Órdenes obtenidas correctamente'
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener órdenes'
      };
    }
  }

  /**
   * Aprobar una orden (cambiar status de "onPreparation" a "approved")
   */
  static async approveOrder(orderId: string): Promise<ApiResponse<OrderStatusUpdate>> {
    try {
      if (!orderId) {
        throw new Error('ID de orden es requerido');
      }

      // Verificar que hay token antes de hacer la petición
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión');
      }

      const data = await this.makeAuthenticatedRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'approved'
        }),
      });
      
      return {
        success: true,
        data: data,
        message: 'Orden aprobada correctamente'
      };
    } catch (error) {
      console.error('Error approving order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al aprobar la orden'
      };
    }
  }

  /**
   * Cambiar el status de una orden a cualquier estado
   */
  static async updateOrderStatus(
    orderId: string, 
    newStatus: 'onPreparation' | 'approved' | 'inTransit' | 'delivered' | 'cancelled' | 'returned'
  ): Promise<ApiResponse<OrderStatusUpdate>> {
    try {
      if (!orderId) {
        throw new Error('ID de orden es requerido');
      }

      if (!newStatus) {
        throw new Error('Nuevo status es requerido');
      }

      // Verificar autenticación
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión');
      }

      const data = await this.makeAuthenticatedRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus
        }),
      });
      
      return {
        success: true,
        data: data,
        message: `Status cambiado a ${newStatus} correctamente`
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar el status'
      };
    }
  }

  /**
   * Obtener una orden específica por ID
   */
  static async getOrderById(orderId: string): Promise<ApiResponse<any>> {
    try {
      if (!orderId) {
        throw new Error('ID de orden es requerido');
      }

      const data = await this.makeAuthenticatedRequest(`/orders/${orderId}`, {
        method: 'GET',
      });
      
      return {
        success: true,
        data: data,
        message: 'Orden obtenida correctamente'
      };
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener la orden'
      };
    }
  }

  /**
   * Verificar si el usuario actual es admin (helper method)
   */
  static isUserAdmin(): boolean {
    try {
      if (typeof window === "undefined") return false;

      const userData = localStorage.getItem("user");
      if (!userData || userData === "undefined" || userData === "null") {
        return false;
      }

      const user = JSON.parse(userData);
      return user?.isAdmin === true || user?.isSuperAdmin === true;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }
}