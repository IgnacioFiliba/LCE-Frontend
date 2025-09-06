// types/orderTypes.ts

// Estados de orden en el backend
export type BackendOrderStatus = 'onPreparation' | 'approved' | 'inTransit' | 'delivered' | 'cancelled' | 'returned';

// Estados de orden en el frontend (español)
export type FrontendOrderStatus = 'En Preparacion' | 'Aprobada' | 'En Transito' | 'Entregada' | 'Cancelada' | 'Devuelta';

// Estructura que llega del backend
export interface BackendOrder {
  id: string;
  date: string;
  status: BackendOrderStatus;
  paymentStatus: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orderDetails: {
    id: string;
    price: string;
    products: BackendProduct[];
  };
}

export interface BackendProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  quantity: number;
}

// Estructura para el frontend (la que usa tu componente actual)
export interface FrontendOrder {
  id: string;
  orderNumber?: string;
  date: string;
  status: BackendOrderStatus; // Mantenemos el del backend para comparaciones
  paymentStatus: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orderDetails: {
    id: string;
    price: string;
    products: BackendProduct[];
  };
}

// Respuesta de la API para actualización de status
export interface OrderStatusUpdateResponse {
  id: string;
  status: BackendOrderStatus;
  updatedAt: string;
  message?: string;
}

// Request body para actualizar status
export interface UpdateOrderStatusRequest {
  status: BackendOrderStatus;
}

// Mapeo de estados
export const STATUS_MAP: Record<BackendOrderStatus, FrontendOrderStatus> = {
  'onPreparation': 'En Preparacion',
  'approved': 'Aprobada',
  'inTransit': 'En Transito', 
  'delivered': 'Entregada',
  'cancelled': 'Cancelada',
  'returned': 'Devuelta'
};

// Mapeo inverso
export const REVERSE_STATUS_MAP: Record<FrontendOrderStatus, BackendOrderStatus> = {
  'En Preparacion': 'onPreparation',
  'Aprobada': 'approved',
  'En Transito': 'inTransit',
  'Entregada': 'delivered', 
  'Cancelada': 'cancelled',
  'Devuelta': 'returned'
};

// Función helper para mapear status
export const mapBackendStatusToFrontend = (backendStatus: BackendOrderStatus): FrontendOrderStatus => {
  return STATUS_MAP[backendStatus] || 'En Preparacion';
};

export const mapFrontendStatusToBackend = (frontendStatus: FrontendOrderStatus): BackendOrderStatus => {
  return REVERSE_STATUS_MAP[frontendStatus] || 'onPreparation';
};