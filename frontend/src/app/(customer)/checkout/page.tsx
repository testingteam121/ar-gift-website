'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { orderApi, paymentApi, productApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, CreditCard, Truck, Shield, Sparkles } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const delivery = total >= 999 ? 0 : 99;
  const grandTotal = total + delivery;

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '',
    street: '', city: '', state: '', pincode: '', country: 'India',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    // Verify every cart product still exists in the DB (catches stale/outdated IDs)
    // Only clear cart on 404 — not on network errors (backend down etc.)
    const validateCartProducts = async () => {
      const results = await Promise.allSettled(
        items.map((item) => productApi.getOne(item.product._id))
      );
      const anyGone = results.some(
        (r) => r.status === 'rejected' && (r.reason as any)?.response?.status === 404
      );
      if (anyGone) {
        useCartStore.getState().clearCart();
        toast.error('Some products in your cart are no longer available. Please add them again.');
        router.push('/products');
      }
    };
    validateCartProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email is required';
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Valid 10-digit mobile number required';
    if (!form.street.trim()) newErrors.street = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'Valid 6-digit pincode required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOrders = async (): Promise<{ orderId: string; imageUrl: string }[]> => {
    const orderIds: { orderId: string; imageUrl: string }[] = [];

    for (const item of items) {
      const formData = new FormData();
      formData.append('customerName', form.name);
      formData.append('customerEmail', form.email);
      formData.append('customerPhone', form.phone);
      formData.append('street', form.street);
      formData.append('city', form.city);
      formData.append('state', form.state);
      formData.append('pincode', form.pincode);
      formData.append('country', form.country);
      formData.append('productId', item.product._id);
      formData.append('quantity', String(item.quantity));
      formData.append('paymentMethod', paymentMethod);

      if (item.customization.uploadedImage?.file) {
        formData.append('image', item.customization.uploadedImage.file);
      } else if (item.customization.uploadedImage?.url) {
        formData.append('selectedImageUrl', item.customization.uploadedImage.url);
      }

      if (item.customization.selectedVideo) {
        if (item.customization.selectedVideo.type === 'upload') {
          if (item.customization.selectedVideo.file) {
            formData.append('video', item.customization.selectedVideo.file);
          } else {
            throw new Error('Uploaded video was lost. Please go back and re-upload your video.');
          }
        } else if (item.customization.selectedVideo.url) {
          formData.append('selectedVideoUrl', item.customization.selectedVideo.url);
          formData.append('selectedVideoType', item.customization.selectedVideo.type);
          if (item.customization.selectedVideo.presetVideo) {
            formData.append('selectedVideoPresetId', item.customization.selectedVideo.presetVideo._id);
          }
        }
      }

      if (item.customization.selectedTemplate) {
        formData.append('templateId', item.customization.selectedTemplate._id);
      }

      const { data } = await orderApi.create(formData);
      orderIds.push({ orderId: data.order.orderId, imageUrl: item.customization.uploadedImage?.preview || item.customization.uploadedImage?.url || '' });
    }

    return orderIds;
  };

  const handleRazorpayPayment = async (orderId: string) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error('Failed to load Razorpay. Please try again.');
      return;
    }

    const { data } = await paymentApi.createRazorpayOrder(orderId);

    return new Promise<void>((resolve, reject) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'AR Gifts',
        description: 'Personalized AR Gift Purchase',
        order_id: data.razorpayOrder.id,
        prefill: {
          name: data.order.customerName,
          email: data.order.customerEmail,
          contact: data.order.customerPhone,
        },
        theme: { color: '#F5A900' },
        handler: async (response: any) => {
          try {
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            resolve();
          } catch {
            reject(new Error('Payment verification failed'));
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const orders = await createOrders();
      const firstOrder = orders[0];

      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(firstOrder.orderId);
      } else {
        await paymentApi.confirmCOD(firstOrder.orderId);
      }

      clearCart();
      const prepareUrl = firstOrder.imageUrl
        ? `/prepare-ar?orderId=${firstOrder.orderId}&imageUrl=${encodeURIComponent(firstOrder.imageUrl)}`
        : `/order-confirmation?orderId=${firstOrder.orderId}`;
      router.push(prepareUrl);
      toast.success('Order placed successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Order placement failed';
      if (message === 'Payment cancelled') {
        toast.error('Payment cancelled');
      } else if (message.toLowerCase().includes('product not found') || message.toLowerCase().includes('not found')) {
        // Stale cart — clear and redirect
        clearCart();
        toast.error('Products in your cart are no longer available. Please shop again.');
        router.push('/products');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Details */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">Contact Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateForm('name', e.target.value)}
                        className={`input-field-light ${errors.name ? 'border-red-400' : ''}`}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        className={`input-field-light ${errors.email ? 'border-red-400' : ''}`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className={`input-field-light ${errors.phone ? 'border-red-400' : ''}`}
                        placeholder="9876543210"
                        maxLength={10}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">Delivery Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address *</label>
                      <input
                        type="text"
                        value={form.street}
                        onChange={(e) => updateForm('street', e.target.value)}
                        className={`input-field-light ${errors.street ? 'border-red-400' : ''}`}
                        placeholder="123 Main Street, Apartment 4B"
                      />
                      {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => updateForm('city', e.target.value)}
                          className={`input-field-light ${errors.city ? 'border-red-400' : ''}`}
                          placeholder="Mumbai"
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                        <input
                          type="text"
                          value={form.state}
                          onChange={(e) => updateForm('state', e.target.value)}
                          className={`input-field-light ${errors.state ? 'border-red-400' : ''}`}
                          placeholder="Maharashtra"
                        />
                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                        <input
                          type="text"
                          value={form.pincode}
                          onChange={(e) => updateForm('pincode', e.target.value)}
                          className={`input-field-light ${errors.pincode ? 'border-red-400' : ''}`}
                          placeholder="400001"
                          maxLength={6}
                        />
                        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                        <input
                          type="text"
                          value={form.country}
                          onChange={(e) => updateForm('country', e.target.value)}
                          className="input-field-light"
                          placeholder="India"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">Payment Method</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay' ? 'border-[#F5A900] bg-[#FFFBEB]' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="accent-[#F5A900]"
                      />
                      <CreditCard className={`w-6 h-6 ${paymentMethod === 'razorpay' ? 'text-[#F5A900]' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-900">Pay Online</p>
                        <p className="text-xs text-gray-500">UPI, Credit/Debit Card, Net Banking via Razorpay</p>
                      </div>
                      <div className="ml-auto flex gap-1">
                        {['UPI', 'Visa', 'MC'].map((m) => (
                          <span key={m} className="text-xs bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-600">{m}</span>
                        ))}
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-[#F5A900] bg-[#FFFBEB]' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-[#F5A900]"
                      />
                      <Truck className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-[#F5A900]' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-900">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when your order arrives at your door</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

                  <div className="space-y-3 mb-4">
                    {items.map((item) => {
                      const imageUrl = item.customization.uploadedImage?.preview ||
                        item.customization.uploadedImage?.url ||
                        item.product.images?.[0]?.url || '';
                      return (
                        <div key={item.product._id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                            {imageUrl && <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />}
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F5A900] text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-2 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery</span>
                      <span className={delivery === 0 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                        {delivery === 0 ? 'FREE' : `₹${delivery}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-[#F5A900]">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        {paymentMethod === 'razorpay' ? 'Pay Securely' : 'Place COD Order'}
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Shield className="w-3 h-3" />
                    <span>256-bit SSL encrypted. Your info is safe.</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
