/* eslint-disable @typescript-eslint/no-explicit-any */
// components/OrderDetailModal.tsx

import React from 'react';
import { X, User, Package, Calendar, DollarSign, CreditCard, MapPin } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any; // Usar el tipo que ya tienes definido
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  // Función para mapear estados del backend al frontend
  const mapBackendStatus = (backendStatus: string): string => {
    const statusMap: Record<string, string> = {
      'onPreparation': 'En Preparacion',
      'approved': 'Aprobada',
      'inTransit': 'En Transito',
      'delivered': 'Entregada',
      'cancelled': 'Cancelada',
      'returned': 'Devuelta'
    }
    return statusMap[backendStatus] || 'En Preparacion'
  }

  // Formatear precio colombiano
  const formatPrice = (price: number | string, currency: string = "COP"): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice)
  }

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calcular total de productos
  const totalProducts = order.orderDetails?.products?.reduce(
    (sum: number, product: any) => sum + product.quantity, 0
  ) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalles de la Orden
            </h2>
            <p className="text-sm text-gray-500">
              {`RP-${order.id?.slice(0, 8) || "unknown"}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Package className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Estado</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {mapBackendStatus(order.status)}
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Fecha</span>
              </div>
              <p className="text-sm text-gray-900">
                {order.date ? formatDate(order.date) : 'No disponible'}
              </p>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <User className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Cliente</span>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{order.user?.name || 'Sin nombre'}</p>
              <p className="text-sm text-gray-600">{order.user?.email || 'Sin email'}</p>
              <p className="text-xs text-gray-500">ID: {order.user?.id?.slice(0, 8)}...</p>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Productos ({totalProducts} unidades)
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {order.orderDetails?.products?.length || 0} artículos
              </span>
            </div>
            
            <div className="space-y-3">
              {order.orderDetails?.products?.map((product: any, index: number) => (
                <div key={product.id || index} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cantidad: {product.quantity} | Precio unitario: {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(parseFloat(product.price) * product.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-lg font-medium text-blue-900">Total de la Orden</span>
              </div>
              <span className="text-xl font-bold text-blue-900">
                {formatPrice(parseFloat(order.orderDetails?.price || "0"))}
              </span>
            </div>
          </div>

          {/* Estado de Pago */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Estado de Pago</span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              order.paymentStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {order.paymentStatus === 'approved' ? 'Pagado' : 'Pendiente'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;