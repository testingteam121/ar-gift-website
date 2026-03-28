import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import toast from 'react-hot-toast';

interface UseOrdersOptions {
  page?: number;
  limit?: number;
  status?: OrderStatus | 'all';
  autoFetch?: boolean;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  stats: {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
  } | null;
  refetch: () => void;
  updateStatus: (orderId: string, status: OrderStatus, extraData?: object) => Promise<boolean>;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { page = 1, limit = 10, status, autoFetch = true } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<UseOrdersReturn['stats']>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (status && status !== 'all') params.status = status;

      const { data } = await orderApi.getAll(params);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await orderApi.getStats();
      setStats(data.stats);
    } catch {
      // silently fail stats
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
      fetchStats();
    }
  }, [fetchOrders, fetchStats, autoFetch]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus, extraData: object = {}): Promise<boolean> => {
    try {
      await orderApi.updateStatus(orderId, { orderStatus: newStatus, ...extraData });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
      return false;
    }
  };

  return { orders, loading, error, total, totalPages, stats, refetch: fetchOrders, updateStatus };
}

export function useOrder(orderId: string | null, email?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await orderApi.getOne(orderId, email);
      setOrder(data.order);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  }, [orderId, email]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
