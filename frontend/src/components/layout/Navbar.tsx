'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/#how-it-works', label: 'How it Works' },
  { href: '/products', label: 'Customize' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-[#e6e6e6] shadow-sm'
            : 'bg-white border-b border-[#e6e6e6]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-[#F5A900]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-[18px] h-[18px] text-white" />
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-[17px] text-[#1d1c1c] tracking-tight">AR Gifts</span>
                <span className="text-[9px] text-[#F5A900] font-semibold tracking-[0.15em] uppercase">Augmented Reality</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#F5A900]'
                        : 'text-[#555555] hover:text-[#1d1c1c]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-lg bg-[#FEF3C7]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-xl text-[#555555] hover:text-[#1d1c1c] hover:bg-[#F7F7F7] transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {mounted && itemCount > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#F5A900] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Shop CTA */}
              <Link
                href="/products"
                className="hidden md:flex items-center gap-1.5 btn-primary text-sm px-5 py-2.5"
              >
                <span>Shop Now</span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden p-2.5 rounded-xl text-[#555555] hover:text-[#1d1c1c] hover:bg-[#F7F7F7] transition-all duration-200"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-[300px] z-50 flex flex-col overflow-hidden bg-white border-l border-[#e6e6e6]"
              style={{ boxShadow: '-8px 0 40px rgba(0,0,0,0.1)' }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-[#e6e6e6]">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F5A900] flex items-center justify-center">
                    <Sparkles className="w-[16px] h-[16px] text-white" />
                  </div>
                  <span className="font-display font-bold text-[#1d1c1c] text-[16px]">AR Gifts</span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg text-[#969696] hover:text-[#1d1c1c] hover:bg-[#F7F7F7] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-[#F5A900] bg-[#FEF3C7] border border-[#fde68a]'
                            : 'text-[#555555] hover:text-[#1d1c1c] hover:bg-[#F7F7F7]'
                        }`}
                      >
                        {link.label}
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#F5A900]" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="px-4 pb-6 pt-4 border-t border-[#e6e6e6] space-y-3">
                <Link
                  href="/cart"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-full font-semibold text-sm transition-all btn-outline"
                >
                  <ShoppingCart className="w-4 h-4" />
                  View Cart
                  {mounted && itemCount > 0 && (
                    <span className="badge-gold text-[11px] px-2 py-0.5">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm btn-primary"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Shop AR Gifts</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
