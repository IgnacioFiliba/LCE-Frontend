/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { X, User, Package, Calendar, DollarSign, CreditCard } from "lucide-react";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const mapBackendStatus = (backendStatus: string): string => {
    const statusMap: Record<string, string> = {
      onPreparation: "En Preparación",
      approved: "Aprobada",
      inTransit: "En Tránsito",
      delivered: "Entregada",
      cancelled: "Cancelada",
      returned: "Devuelta",
      processing: "En Preparación",
      shipped: "En Tránsito",
      pending: "Pendiente",
    };
    return statusMap[backendStatus] || backendStatus || "En Preparación";
  };

  const formatPrice = (price: number | string, currency = "USD") => {
    const n = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(isFinite(n) ? n : 0);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const items: any[] =
    order?.orderDetails?.items ??
    order?.orderDetails?.products ??
    [];

  const totalUnits = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
  const totalOrder = items.reduce(
    (s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice ?? it.price ?? 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-red-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-100">
          <div>
            <h2 className="text-xl font-semibold text-black">Detalles de la Orden</h2>
            <p className="text-sm text-gray-500">RP-{String(order.id || "").slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado / Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Package className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-800">Estado</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {mapBackendStatus(order.status)}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-800">Fecha</span>
              </div>
              <p className="text-sm text-black">{formatDate(order.date || order.createdAt)}</p>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-800">
                  Productos ({totalUnits} unidades)
                </span>
              </div>
              <span className="text-sm text-gray-600">{items.length} artículos</span>
            </div>

            <div className="space-y-3">
              {items.map((it, idx) => (
                <div key={it.id ?? idx} className="bg-white p-3 rounded-lg border border-red-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-black">
                        {it.name || it.productName || "Producto"}
                      </h4>
                      {it.description && (
                        <p className="text-sm text-gray-600">{it.description}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        Cantidad: {it.quantity} | Precio unitario:{" "}
                        {formatPrice(it.unitPrice ?? it.price ?? 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {formatPrice((it.unitPrice ?? it.price ?? 0) * (it.quantity ?? 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-lg font-medium text-red-900">Total de la Orden</span>
              </div>
              <span className="text-xl font-bold text-red-900">
                {formatPrice(order.orderDetails?.price ?? totalOrder)}
              </span>
            </div>
          </div>

          {/* Pago */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <CreditCard className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-800">Estado de Pago</span>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.paymentStatus === "approved"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {order.paymentStatus === "approved" ? "Pagado" : "Pendiente"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-red-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
