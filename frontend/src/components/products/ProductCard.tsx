'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Star } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const categoryEmoji: Record<string, string> = {
  'greeting-card': '💌',
  'photo-frame': '🖼️',
  'mug': '☕',
  'keychain': '🔑',
  'led-frame': '💡',
};

const categoryLabel: Record<string, string> = {
  'greeting-card': 'Greeting Card',
  'photo-frame': 'Photo Frame',
  'mug': 'Mug',
  'keychain': 'Keychain',
  'led-frame': 'LED Frame',
};

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const emoji = categoryEmoji[product.category] ?? '🎁';
  const hasImage = product.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">

        {/* Image Area */}
        <div className="relative aspect-[4/3] bg-[#F7F7F7] flex items-center justify-center overflow-hidden flex-shrink-0">

          {hasImage ? (
            <img
              src={product.images![0].url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <motion.div
              className="text-7xl md:text-8xl select-none z-10 relative"
              whileHover={{ scale: 1.15, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {emoji}
            </motion.div>
          )}

          {/* AR Badge */}
          <div className="absolute top-3 right-3 z-20 badge-gold text-[10px] px-2 py-1">
            ✦ AR
          </div>

          {/* Low stock */}
          {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
            <div className="absolute top-3 left-3 z-20 text-[10px] px-2.5 py-1 rounded-full font-semibold bg-red-50 text-red-500 border border-red-200">
              Only {product.stock} left
            </div>
          )}

          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <span className="text-[#969696] text-sm font-semibold border border-[#e6e6e6] px-4 py-2 rounded-xl bg-white">Out of Stock</span>
            </div>
          )}

          {/* Hover Overlay */}
          {product.stock !== 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
              <Link
                href={`/customize/${product._id}`}
                className="flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm text-white bg-[#F5A900] hover:bg-[#D97706] transition-all duration-200 translate-y-2 group-hover:translate-y-0"
              >
                <Eye className="w-4 h-4" />
                Customize Now
              </Link>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col flex-1 bg-white">
          <p className="text-[#969696] text-xs mb-1 capitalize font-medium">
            {categoryLabel[product.category] ?? product.category}
          </p>
          <h3 className="font-display font-semibold text-[#1d1c1c] text-[15px] leading-snug mb-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[#969696] text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>
          )}

          {/* Rating */}
          {product.ratings && product.ratings.count > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <Star className="w-3 h-3 fill-[#F5A900] text-[#F5A900]" />
              <span className="text-xs text-[#555555]">{product.ratings.average.toFixed(1)}</span>
              <span className="text-xs text-[#b0b0b0]">({product.ratings.count})</span>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.features.slice(0, 2).map((f) => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full text-[#D97706] bg-[#FEF3C7] border border-[#fde68a]">
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#e6e6e6]">
            <div>
              <span className="text-2xl font-display font-bold gradient-text">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <p className="text-[#b0b0b0] text-[10px]">+ free delivery</p>
            </div>

            <Link
              href={product.stock !== 0 ? `/customize/${product._id}` : '#'}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#F5A900] hover:text-[#D97706] transition-all duration-200 group/btn"
              onClick={(e) => product.stock === 0 && e.preventDefault()}
            >
              {product.stock !== 0 ? 'Customize' : 'Sold Out'}
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
