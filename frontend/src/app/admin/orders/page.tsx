'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Eye, Download, ChevronLeft, ChevronRight,
  Package, Image as ImageIcon, Video as VideoIcon,
  RefreshCw, Filter
} from 'lucide-react';
import { orderApi, paymentApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const statusOptions: { value: OrderStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Orders', color: 'bg-gray-700 text-gray-200' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'printing', label: 'Printing', color: 'bg-violet-500/20 text-violet-400' },
  { value: 'shipped', label: 'Shipped', color: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500/20 text-green-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
];

const statusBadgeColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  processing: 'bg-blue-500/15 text-blue-400',
  printing: 'bg-violet-500/15 text-violet-400',
  shipped: 'bg-cyan-500/15 text-cyan-400',
  delivered: 'bg-green-500/15 text-green-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

const paymentBadgeColors: Record<string, string> = {
  pending: 'text-amber-400',
  paid: 'text-green-400',
  failed: 'text-red-400',
  refunded: 'text-gray-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [orderFiles, setOrderFiles] = useState<any>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (activeStatus !== 'all') params.status = activeStatus;
      if (search) params.search = search;
      const { data } = await orderApi.getAll(params);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, activeStatus, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTrackingNumber(order.trackingNumber || '');
    setOrderFiles(null);
    setShowDetailModal(true);

    // Fetch files
    setLoadingFiles(true);
    try {
      const { data } = await orderApi.getFiles(order.orderId);
      setOrderFiles(data.files);
    } catch {
      // silently fail
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedOrder) return;
    setMarkingPaid(true);
    try {
      await paymentApi.markAsPaid(selectedOrder.orderId);
      toast.success('Order marked as paid');
      setShowDetailModal(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      await orderApi.updateStatus(selectedOrder.orderId, {
        orderStatus: newStatus,
        ...(trackingNumber ? { trackingNumber } : {}),
      });
      toast.success('Order status updated');
      setShowDetailModal(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {statusOptions.map((s) => (
          <button
            key={s.value}
            onClick={() => { setActiveStatus(s.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeStatus === s.value
                ? 'ring-2 ring-[#F5A900] ' + s.color
                : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by Order ID or customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-[#F5A900]"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-[#F5A900] text-white rounded-xl text-sm font-medium hover:bg-[#D97706] transition-colors">
          Search
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }} className="px-3 py-2.5 bg-gray-800 text-gray-400 rounded-xl text-sm hover:bg-gray-700 transition-colors">
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Order ID</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden md:table-cell">Customer</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden lg:table-cell">Product</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Payment</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Status</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden sm:table-cell">Date</th>
                <th className="text-right px-5 py-3.5 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-800 rounded shimmer-bg opacity-40" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-600">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-white text-xs font-semibold">{order.orderId}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div>
                        <p className="text-gray-200 font-medium truncate max-w-[120px]">{order.customer.name}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[120px]">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="text-gray-300 truncate max-w-[140px] text-xs">{order.product.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-white font-semibold text-xs">₹{order.payment.amount.toLocaleString('en-IN')}</p>
                        <p className={`text-xs font-medium capitalize ${paymentBadgeColors[order.payment.status]}`}>
                          {order.payment.status}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusBadgeColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openDetail(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5A900]/20 text-[#fbbf24] hover:bg-[#F5A900]/30 rounded-lg text-xs font-medium transition-colors ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-800">
            <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={`Order: ${selectedOrder?.orderId}`} size="xl">
        {selectedOrder && (
          <>
            <ModalBody className="space-y-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3">Customer</h3>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium text-gray-800">{selectedOrder.customer.name}</p>
                    <p className="text-gray-500">{selectedOrder.customer.email}</p>
                    <p className="text-gray-500">{selectedOrder.customer.phone}</p>
                    <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                      {selectedOrder.customer.address.street},<br />
                      {selectedOrder.customer.address.city}, {selectedOrder.customer.address.state} - {selectedOrder.customer.address.pincode}
                    </p>
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3">Product</h3>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium text-gray-800">{selectedOrder.product.name}</p>
                    <p className="text-gray-500">Qty: {selectedOrder.product.quantity}</p>
                    <p className="text-[#F5A900] font-bold">₹{selectedOrder.payment.amount.toLocaleString('en-IN')}</p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Payment Method: <span className="text-gray-700 font-medium capitalize">{selectedOrder.payment.method}</span></p>
                      <p className="text-xs text-gray-500">Payment Status: <span className={`font-medium capitalize ${paymentBadgeColors[selectedOrder.payment.status]}`}>{selectedOrder.payment.status}</span></p>
                    </div>
                  </div>
                </div>

                {/* AR Assets */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3">AR Assets</h3>
                  {loadingFiles ? (
                    <div className="space-y-2">
                      <div className="h-24 bg-gray-200 rounded-xl shimmer-bg" />
                      <div className="h-4 bg-gray-200 rounded shimmer-bg" />
                    </div>
                  ) : orderFiles ? (
                    <div className="space-y-3">
                      {orderFiles.templateImage && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Template: {orderFiles.templateName}</p>
                          <img src={orderFiles.templateImage} alt="Template" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                          <a href={orderFiles.templateImage} target="_blank" rel="noopener noreferrer" className="text-xs text-[#D97706] mt-1 flex items-center gap-1 hover:underline">
                            <Download className="w-3 h-3" /> Download Template
                          </a>
                        </div>
                      )}
                      {orderFiles.uploadedImage && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">AR Target Image</p>
                          <img src={orderFiles.uploadedImage} alt="AR Target" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                          <a href={orderFiles.uploadedImage} target="_blank" rel="noopener noreferrer" className="text-xs text-[#D97706] mt-1 flex items-center gap-1 hover:underline">
                            <Download className="w-3 h-3" /> Download Image
                          </a>
                        </div>
                      )}
                      {orderFiles.selectedVideo && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">AR Video</p>
                          <a href={orderFiles.selectedVideo} target="_blank" rel="noopener noreferrer" className="text-xs text-[#D97706] flex items-center gap-1 hover:underline">
                            <Download className="w-3 h-3" /> Download Video
                          </a>
                        </div>
                      )}
                      {!orderFiles.templateImage && !orderFiles.uploadedImage && !orderFiles.selectedVideo && (
                        <p className="text-gray-400 text-xs">No files available</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">No assets found</p>
                  )}
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-4">Update Order Status</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Order Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="input-field text-sm"
                    >
                      {statusOptions.filter((s) => s.value !== 'all').map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Tracking Number (optional)</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. INDP1234567890"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <button onClick={() => setShowDetailModal(false)} className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors">Close</button>
              {selectedOrder?.payment.status !== 'paid' && (
                <button
                  onClick={handleMarkAsPaid}
                  disabled={markingPaid}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  {markingPaid ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Marking...</>
                  ) : (
                    'Mark as Paid'
                  )}
                </button>
              )}
              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="btn-primary flex items-center gap-2"
              >
                {updatingStatus ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</>
                ) : (
                  'Update Status'
                )}
              </button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
