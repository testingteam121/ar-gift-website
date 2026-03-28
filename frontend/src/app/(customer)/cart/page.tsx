'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const total = getTotal();
  const itemCount = getItemCount();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-4"
        >
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added any AR gifts yet. Browse our magical collection!
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Browse AR Gifts
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="text-gray-500 text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => {
                  const imageUrl = item.customization.uploadedImage?.preview ||
                    item.customization.uploadedImage?.url ||
                    item.customization.selectedTemplate?.imageUrl ||
                    item.product.images?.[0]?.url || '';

                  return (
                    <motion.div
                      key={item.product._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingBag className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute top-1 right-1 bg-[#F5A900] rounded-md p-0.5">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.product.name}</h3>
                              <p className="text-gray-500 text-xs mt-0.5 capitalize">
                                {item.product.category.replace('-', ' ')}
                              </p>
                              {item.customization.selectedTemplate && (
                                <p className="text-xs text-[#D97706] mt-1">
                                  Template: {item.customization.selectedTemplate.name}
                                </p>
                              )}
                              {item.customization.selectedVideo?.presetVideo && (
                                <p className="text-xs text-[#D97706]">
                                  Video: {item.customization.selectedVideo.presetVideo.name}
                                </p>
                              )}
                              {item.customization.selectedVideo?.type === 'upload' && (
                                <p className="text-xs text-[#D97706]">Video: Custom upload</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.product._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-semibold text-gray-900 text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="font-bold text-[#F5A900] text-lg">
                                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-400">
                                  ₹{item.product.price.toLocaleString('en-IN')} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-[#F5A900] hover:text-[#D97706] font-medium text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                    <span className="text-gray-900 font-medium">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className={total >= 999 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                      {total >= 999 ? 'FREE' : '₹99'}
                    </span>
                  </div>
                  {total < 999 && (
                    <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                      Add ₹{(999 - total).toLocaleString('en-IN')} more for free delivery
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Total</span>
                    <span className="font-bold text-2xl text-[#F5A900]">
                      ₹{(total + (total >= 999 ? 0 : 99)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {total >= 999 && (
                    <p className="text-green-600 text-xs mt-1 text-right">You saved ₹99 on delivery!</p>
                  )}
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>🔒</span>
                    <span>Secure SSL encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>🔄</span>
                    <span>Easy 7-day returns</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>✨</span>
                    <span>AR experience included free</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
