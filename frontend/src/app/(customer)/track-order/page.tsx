'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle, Truck, Printer, Clock, X, Sparkles } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import toast from 'react-hot-toast';

const statusSteps: { status: OrderStatus; label: string; icon: React.ElementType; description: string }[] = [
  { status: 'pending', label: 'Order Placed', icon: Clock, description: 'Your order has been received' },
  { status: 'processing', label: 'Processing', icon: Package, description: 'We are preparing your order' },
  { status: 'printing', label: 'Printing', icon: Printer, description: 'Your AR gift is being printed' },
  { status: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way' },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Package delivered successfully' },
];

const statusOrder = ['pending', 'processing', 'printing', 'shipped', 'delivered'];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [email, setEmail] = useState('');
  const [inputOrderId, setInputOrderId] = useState(searchParams.get('orderId') || '');
  const [inputEmail, setInputEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const trackOrder = async (oid?: string, em?: string) => {
    const trackId = oid || inputOrderId;
    const trackEmail = em || inputEmail;

    if (!trackId.trim()) {
      toast.error('Please enter your Order ID');
      return;
    }

    setLoading(true);
    setNotFound(false);
    try {
      const { data } = await orderApi.getOne(trackId, trackEmail);
      setOrder(data.order);
      setOrderId(trackId);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        setNotFound(true);
        setOrder(null);
        toast.error('Order not found. Please check your Order ID and email.');
      } else {
        toast.error('Failed to fetch order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId) {
      trackOrder(urlOrderId, '');
    }
  }, []);

  const getStatusIndex = (status: string) => statusOrder.indexOf(status);
  const currentIndex = order ? getStatusIndex(order.orderStatus) : -1;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-[#FEF3C7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#F5A900]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your order ID to see real-time status</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Order ID</label>
              <input
                type="text"
                value={inputOrderId}
                onChange={(e) => setInputOrderId(e.target.value.toUpperCase())}
                placeholder="e.g. ARG-2024-ABC123"
                className="input-field font-mono"
                onKeyDown={(e) => e.key === 'Enter' && trackOrder()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-gray-400 font-normal text-xs">(optional, for verification)</span>
              </label>
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && trackOrder()}
              />
            </div>
            <button
              onClick={() => trackOrder()}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </div>
        </motion.div>

        {/* Not Found */}
        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center mb-6"
          >
            <X className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-800 font-semibold">Order not found</p>
            <p className="text-red-600 text-sm mt-1">
              Please check your Order ID and email. The order may take a few minutes to appear.
            </p>
          </motion.div>
        )}

        {/* Order Status */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Order Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
                  <p className="font-mono font-bold text-[#F5A900] text-lg">{order.orderId}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-[#FEF3C7] text-[#D97706]'
                }`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-0.5">Product</p>
                  <p className="font-medium text-gray-900">{order.product.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Ordered On</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Customer</p>
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Amount Paid</p>
                  <p className="font-bold text-[#F5A900]">₹{order.payment.amount.toLocaleString('en-IN')}</p>
                </div>
                {order.trackingNumber && (
                  <div className="sm:col-span-2">
                    <p className="text-gray-500 mb-0.5">Tracking Number</p>
                    <p className="font-mono font-medium text-gray-900">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            {order.orderStatus !== 'cancelled' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Order Progress</h3>

                {/* Progress bar */}
                <div className="relative mb-6">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#F5A900] to-[#fbbf24] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIndex + 1) / statusSteps.length) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {statusSteps.map((stepInfo, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = stepInfo.icon;

                    return (
                      <motion.div
                        key={stepInfo.status}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                          isCurrent ? 'bg-[#FFFBEB] border border-[#fde68a]' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted ? 'bg-[#F5A900] text-white' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {stepInfo.label}
                          </p>
                          <p className={`text-xs ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                            {stepInfo.description}
                          </p>
                        </div>
                        {isCurrent && (
                          <div className="w-2 h-2 bg-[#F5A900] rounded-full animate-pulse" />
                        )}
                        {isCompleted && !isCurrent && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AR Experience reminder */}
            {(order.orderStatus === 'shipped' || order.orderStatus === 'delivered') && (
              <div className="bg-[#FFFBEB] rounded-2xl p-5 border border-[#fde68a]">
                <div className="flex gap-3">
                  <Sparkles className="w-6 h-6 text-[#F5A900] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1d1c1c]">Ready to Experience AR?</p>
                    <p className="text-[#555555] text-sm mt-1">
                      Your gift has the AR magic built in! Just point any smartphone camera at the image on your gift to see the video message play.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#F5A900] border-t-transparent rounded-full animate-spin" /></div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
