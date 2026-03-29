'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Package, Lock, LogOut, CheckCircle, AlertCircle, ChevronRight, Eye, EyeOff } from 'lucide-react';
import api, { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Tab = 'profile' | 'orders' | 'password';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile state
  const [profile, setProfile] = useState({ name: user?.name || '', phone: (user as any)?.phone || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated]);

  useEffect(() => {
    if (tab === 'orders') fetchOrders();
  }, [tab, ordersPage]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await api.get(`/orders?page=${ordersPage}&limit=5`);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const { data } = await authApi.updateProfile({ name: profile.name, phone: profile.phone });
      setUser(data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) return null;

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'orders' as Tab, label: 'My Orders', icon: Package },
    { id: 'password' as Tab, label: 'Password', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] flex items-center justify-center">
              {(user as any).avatar ? (
                <img src={(user as any).avatar} alt="" className="w-14 h-14 rounded-2xl object-cover" />
              ) : (
                <User className="w-7 h-7 text-[#F5A900]" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1d1c1c]">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 border border-red-100 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                    tab === t.id ? 'text-[#F5A900] bg-[#FEF3C7]' : 'text-[#555] hover:bg-gray-50'
                  }`}>
                  <div className="flex items-center gap-3">
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </div>
                  {tab === t.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

              {/* Profile Tab */}
              {tab === 'profile' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-[#1d1c1c] mb-6">Personal Information</h2>

                  {profileMsg && (
                    <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl text-sm ${
                      profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {profileMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1d1c1c] mb-1.5">Full Name</label>
                      <input type="text" required value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A900]/30 focus:border-[#F5A900] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1d1c1c] mb-1.5">Email</label>
                      <input type="email" value={user.email} disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1d1c1c] mb-1.5">
                        Phone <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input type="tel" value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A900]/30 focus:border-[#F5A900] transition-all"
                      />
                    </div>
                    <button type="submit" disabled={profileLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#F5A900] text-white text-sm font-semibold hover:bg-[#D97706] disabled:opacity-50 transition-colors">
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {/* Orders Tab */}
              {tab === 'orders' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-[#1d1c1c] mb-6">My Orders</h2>

                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No orders yet.</p>
                      <a href="/products" className="text-[#F5A900] text-sm font-medium hover:underline mt-1 inline-block">
                        Start shopping
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order: any) => (
                        <div key={order._id}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#F5A900]/30 hover:bg-[#FFFBF0] transition-all cursor-pointer"
                          onClick={() => router.push(`/track-order?orderId=${order.orderId}`)}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-[#1d1c1c]">#{order.orderId}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                                {order.orderStatus}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{order.product?.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            <span className="text-sm font-semibold text-[#1d1c1c]">₹{order.payment?.amount?.toLocaleString('en-IN')}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setOrdersPage(p)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            p === ordersPage ? 'bg-[#F5A900] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Password Tab */}
              {tab === 'password' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-[#1d1c1c] mb-2">Change Password</h2>
                  {(user as any).authProvider === 'google' && (
                    <p className="text-sm text-gray-500 mb-6">You signed in with Google. You can set a password to also enable email login.</p>
                  )}

                  {pwMsg && (
                    <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl text-sm ${
                      pwMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {pwMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {pwMsg.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {(user as any).authProvider !== 'google' && (
                      <div>
                        <label className="block text-sm font-medium text-[#1d1c1c] mb-1.5">Current Password</label>
                        <div className="relative">
                          <input type={showPw.current ? 'text' : 'password'} required
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A900]/30 focus:border-[#F5A900] transition-all pr-11"
                          />
                          <button type="button" onClick={() => setShowPw({ ...showPw, current: !showPw.current })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-[#1d1c1c] mb-1.5">New Password</label>
                      <div className="relative">
                        <input type={showPw.new ? 'text' : 'password'} required minLength={6}
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                          placeholder="Min. 6 characters"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A900]/30 focus:border-[#F5A900] transition-all pr-11"
                        />
                        <button type="button" onClick={() => setShowPw({ ...showPw, new: !showPw.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1d1c1c] mb-1.5">Confirm New Password</label>
                      <input type="password" required minLength={6}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A900]/30 focus:border-[#F5A900] transition-all"
                      />
                    </div>
                    <button type="submit" disabled={pwLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#F5A900] text-white text-sm font-semibold hover:bg-[#D97706] disabled:opacity-50 transition-colors">
                      {pwLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
