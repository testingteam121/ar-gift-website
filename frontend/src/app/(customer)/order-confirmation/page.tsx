'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Mail, Sparkles } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { Order } from '@/types';

function Confetti() {
  const colors = ['#F5A900', '#D97706', '#fbbf24', '#10B981', '#3B82F6', '#EC4899'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720 - 360],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await orderApi.getOne(orderId);
        setOrder(data.order);
      } catch {
        console.error('Could not fetch order details');
      }
    };
    fetchOrder();

    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {showConfetti && <Confetti />}

      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-[#1d1c1c] p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle className="w-14 h-14 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Order Placed!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80"
            >
              Your magical AR gift is on its way
            </motion.p>
          </div>

          <div className="p-8">
            {/* Order ID */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <p className="text-gray-500 text-sm mb-2">Your Order ID</p>
              <div className="inline-flex items-center gap-2 bg-[#FEF3C7] text-[#D97706] font-mono font-bold text-xl px-6 py-3 rounded-2xl border border-[#fde68a]">
                <Sparkles className="w-5 h-5" />
                {orderId}
              </div>
              <p className="text-gray-400 text-xs mt-2">Save this for tracking your order</p>
            </motion.div>

            {/* Order Details */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-2xl p-5 mb-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product</span>
                    <span className="text-gray-900 font-medium">{order.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity</span>
                    <span className="text-gray-900 font-medium">{order.product.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="text-gray-900 font-medium">
                      {order.payment.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Status</span>
                    <span className={`font-semibold ${
                      order.payment.status === 'paid' ? 'text-green-600' :
                      order.payment.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="font-bold text-gray-900">Total Paid</span>
                    <span className="font-bold text-[#F5A900]">
                      ₹{order.payment.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AR Gift info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#FFFBEB] rounded-2xl p-5 mb-8 border border-[#fde68a]"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#F5A900]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1d1c1c] mb-1">Your AR Gift is Being Prepared</p>
                  <p className="text-[#555555] text-sm leading-relaxed">
                    We're creating your personalized AR gift. Once ready, your recipient just needs to scan it with their phone camera to see your video message!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email notification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 bg-green-50 rounded-xl p-4 mb-8"
            >
              <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 text-sm">
                Order confirmation sent to <strong>{order?.customer.email}</strong>
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid sm:grid-cols-2 gap-3"
            >
              <Link
                href={`/track-order?orderId=${orderId}`}
                className="flex items-center justify-center gap-2 bg-[#F5A900] text-white font-semibold py-3.5 rounded-xl hover:bg-[#D97706] transition-colors"
              >
                <Package className="w-5 h-5" />
                Track Order
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#F5A900] border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
