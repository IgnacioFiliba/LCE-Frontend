import { useState, useEffect } from 'react';
import { ordersService } from '../services/checkout';
import { Order } from '../types/checkout';


export const useOrders = (userId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  const fetchOrders = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersService.getOrdersByUserId(userId);
      setOrders(response.orders);
      setTotalOrders(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const refetch = () => {
    fetchOrders();
  };

  return {
    orders,
    loading,
    error,
    totalOrders,
    refetch
  };
};

// Hook para una orden específica
export const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const orderData = await ordersService.getOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const refetch = () => {
    fetchOrder();
  };

  return {
    order,
    loading,
    error,
    refetch
  };
};