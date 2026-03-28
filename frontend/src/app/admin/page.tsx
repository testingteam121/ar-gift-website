'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag, DollarSign, Clock, Package, TrendingUp,
  ArrowUpRight, Eye, RefreshCw
} from 'lucide-react';
import { orderApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  printing: 'bg-violet-100 text-violet-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StatCard({ title, value, subtitle, icon: Icon, color, href }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; color: string; href?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {href && (
          <Link href={href} className="text-gray-600 hover:text-gray-300 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
}

// Simple CSS bar chart
function RevenueBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-xs w-8">{label}</span>
      <div className="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#F5A900] to-[#fbbf24] rounded-full flex items-center justify-end pr-2"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {pct > 20 && <span className="text-white text-xs font-bold">₹{(value / 1000).toFixed(1)}k</span>}
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await orderApi.getStats();
      setStats(data.stats);
      setRecentOrders(data.recentOrders || []);
    } catch {
      // Use placeholder data if API fails
      setStats({ totalOrders: 0, pendingOrders: 0, processingOrders: 0, deliveredOrders: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statCards = stats
    ? [
        { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-600', href: '/admin/orders', subtitle: 'All time' },
        { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'bg-green-600', subtitle: 'From paid orders' },
        { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-600', href: '/admin/orders?status=pending', subtitle: 'Awaiting action' },
        { title: 'Delivered', value: stats.deliveredOrders, icon: Package, color: 'bg-[#F5A900]', subtitle: 'Successfully completed' },
      ]
    : [];

  // Dummy weekly data for bar chart
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekRevenue = [12000, 18500, 9000, 22000, 15000, 28000, 19500];
  const maxRev = Math.max(...weekRevenue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-32 shimmer-bg opacity-30" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts + Recent Orders */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold">Weekly Revenue</h2>
              <p className="text-gray-500 text-xs">This week's performance</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-3">
            {weekDays.map((day, i) => (
              <RevenueBar key={day} label={day} value={weekRevenue[i]} max={maxRev} />
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[#F5A900] hover:text-[#fbbf24] text-sm flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-sm text-white font-medium">{order.orderId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs truncate">{order.customer.name} · {order.product.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-semibold">₹{order.payment.amount.toLocaleString('en-IN')}</p>
                    <p className="text-gray-600 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <Link href="/admin/orders" className="text-gray-600 hover:text-gray-300 transition-colors ml-1">
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', href: '/admin/products', icon: Package, color: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
            { label: 'Add Template', href: '/admin/templates', icon: Package, color: 'bg-purple-600/20 text-purple-400 border-purple-600/30' },
            { label: 'Add Video', href: '/admin/videos', icon: Package, color: 'bg-green-600/20 text-green-400 border-green-600/30' },
            { label: 'Manage Orders', href: '/admin/orders', icon: ShoppingBag, color: 'bg-amber-600/20 text-amber-400 border-amber-600/30' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${action.color} hover:opacity-80 transition-opacity text-center`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
