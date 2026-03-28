'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Star, ShoppingBag, Play, Camera, Gift, Video, Check,
  Users, Package, Heart, ArrowRight, Zap, Shield, Truck, X, Scan
} from 'lucide-react';
import { productApi } from '@/lib/api';
import { Product } from '@/types';

function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [inView, end, duration]);
  return { count, ref };
}

const categoryEmoji: Record<string, string> = {
  'greeting-card': '💌',
  'photo-frame': '🖼️',
  'mug': '☕',
  'keychain': '🔑',
  'led-frame': '💡',
};

const fallbackProducts: Pick<Product, '_id' | 'name' | 'price' | 'category' | 'description' | 'images'>[] = [
  { _id: '1', name: 'AR Birthday Card',  price: 299,  category: 'greeting-card', description: 'Make their birthday unforgettable', images: [] },
  { _id: '2', name: 'AR Photo Frame',    price: 899,  category: 'photo-frame',   description: 'Memories that move and speak',     images: [] },
  { _id: '3', name: 'AR Magic Mug',      price: 599,  category: 'mug',           description: 'Coffee + video = pure magic',       images: [] },
  { _id: '4', name: 'AR LED Frame',      price: 1499, category: 'led-frame',     description: 'Illuminated memories forever',      images: [] },
];

const categories = [
  { name: 'Greeting Cards', emoji: '💌', href: '/products?category=greeting-card', desc: 'From ₹299' },
  { name: 'Photo Frames',   emoji: '🖼️', href: '/products?category=photo-frame',   desc: 'From ₹899' },
  { name: 'AR Mugs',        emoji: '☕', href: '/products?category=mug',           desc: 'From ₹599' },
  { name: 'Keychains',      emoji: '🔑', href: '/products?category=keychain',      desc: 'From ₹399' },
  { name: 'LED Frames',     emoji: '💡', href: '/products?category=led-frame',     desc: 'From ₹1499' },
];

const testimonials = [
  { name: 'Priya Sharma',  location: 'Mumbai',    rating: 5, avatar: 'PS', text: 'My husband was completely speechless! The video played perfectly when he scanned it. Absolutely magical — he still talks about it!' },
  { name: 'Rohit Kumar',   location: 'Delhi',     rating: 5, avatar: 'RK', text: 'Sent an AR birthday card to my mom across the country. She called me crying happy tears. The AR experience is mind-blowing.' },
  { name: 'Ananya Singh',  location: 'Bangalore', rating: 5, avatar: 'AS', text: 'Used AR invitations for our wedding and every guest was amazed! Everyone was scanning it at the venue. Best decision ever.' },
];

const steps = [
  { step: '01', icon: Gift,  title: 'Choose & Customize', desc: 'Pick your product and upload a personal photo or choose from 100+ premium templates.' },
  { step: '02', icon: Video, title: 'Attach Your Video',   desc: 'Record a heartfelt message or pick from our preset video animations. Up to 50MB.' },
  { step: '03', icon: Scan,  title: 'We Print & Ship',     desc: 'We print your gift with AR-encoded image and deliver it to your door in 24hrs.' },
  { step: '04', icon: Camera,title: 'Scan & Watch Magic',  desc: 'They scan the image with any smartphone. Your video appears like pure magic!' },
];

const perks = [
  { icon: Truck,  title: 'Free Delivery',    desc: 'On orders above ₹999' },
  { icon: Shield, title: 'Secure Payments',  desc: 'Razorpay powered' },
  { icon: Zap,    title: 'Quick Processing', desc: 'Dispatched in 24hrs' },
  { icon: Heart,  title: '4.9★ Rating',      desc: '10,000+ happy customers' },
];

function StatCard({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: React.ElementType }) {
  const { count, ref } = useCounter(value);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
      <div className="text-4xl md:text-5xl font-display font-bold text-[#F5A900] mb-1">
        {count.toLocaleString('en-IN')}{suffix}
      </div>
      <div className="flex items-center justify-center gap-2 text-[#969696] text-sm">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState(fallbackProducts);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    productApi.getAll({ limit: 4 })
      .then(({ data }) => {
        const items = data?.products ?? [];
        if (items.length > 0) setFeaturedProducts(items.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
  };

  return (
    <div className="bg-white overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-dark-grid opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#FEF3C7] opacity-40 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#FEF3C7] opacity-30 blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — Text */}
          <div>
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#fde68a] mb-6">
                <Sparkles className="w-3 h-3" /> India's First AR Gift Store
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp} custom={1} initial="hidden" animate="show"
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1d1c1c] leading-tight mb-6"
            >
              Give Gifts That{' '}
              <span className="text-[#F5A900]">Come Alive</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={2} initial="hidden" animate="show"
              className="text-lg text-[#555555] mb-8 max-w-xl leading-relaxed"
            >
              Attach a personal video to any gift. Your loved ones scan it with their phone
              and watch the magic unfold — powered by Augmented Reality.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="flex flex-wrap gap-3 mb-10">
              <Link href="/products" className="btn-primary text-base px-7 py-3.5">
                <ShoppingBag className="w-5 h-5" />
                Shop AR Gifts
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setDemoOpen(true)}
                className="btn-outline text-base px-7 py-3.5 flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-[#1d1c1c] flex items-center justify-center">
                  <Play className="w-3 h-3 text-white ml-0.5" />
                </div>
                Watch Demo
              </button>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="flex flex-wrap items-center gap-4 text-sm text-[#969696]">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#F5A900] text-[#F5A900]" />)}
                <span className="text-[#555555] ml-1 font-medium">4.9/5</span>
              </div>
              <span className="w-px h-4 bg-[#e6e6e6]" />
              <span>10,000+ Gifts Delivered</span>
              <span className="w-px h-4 bg-[#e6e6e6]" />
              <span>No App Needed</span>
            </motion.div>
          </div>

          {/* Right — Floating cards */}
          <div className="relative hidden lg:flex items-center justify-center h-[500px]">
            <motion.div
              className="absolute top-8 right-8"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-44 h-52 rounded-2xl overflow-hidden shadow-xl border border-[#e6e6e6] bg-white">
                <div className="h-36 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-6xl">💌</div>
                <div className="p-3">
                  <p className="text-[#1d1c1c] text-xs font-semibold">AR Greeting Card</p>
                  <p className="text-[#F5A900] text-xs font-bold">₹299</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-8 left-8"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="w-40 h-48 rounded-2xl overflow-hidden shadow-xl border border-[#e6e6e6] bg-white">
                <div className="h-32 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-5xl">🖼️</div>
                <div className="p-3">
                  <p className="text-[#1d1c1c] text-xs font-semibold">AR Photo Frame</p>
                  <p className="text-[#F5A900] text-xs font-bold">₹899</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
              <div className="w-36 h-44 rounded-2xl overflow-hidden shadow-xl border border-[#e6e6e6] bg-white">
                <div className="h-28 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-5xl">☕</div>
                <div className="p-3">
                  <p className="text-[#1d1c1c] text-xs font-semibold">AR Magic Mug</p>
                  <p className="text-[#F5A900] text-xs font-bold">₹599</p>
                </div>
              </div>
            </motion.div>

            {/* AR badge overlay */}
            <motion.div
              className="absolute top-4 left-12 bg-[#F5A900] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦ AR Enabled
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PERKS BAR ── */}
      <section className="py-8 bg-[#1d1c1c]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5A900]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#F5A900]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{perk.title}</p>
                    <p className="text-[#969696] text-xs">{perk.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#fde68a] mb-4">
              Simple Process
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1d1c1c] mt-4 mb-4">
              How AR Gifts Work
            </h2>
            <p className="text-[#969696] text-lg max-w-xl mx-auto">
              Create a magical gifting experience in 4 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="bg-white rounded-2xl p-7 border border-[#e6e6e6] shadow-sm hover:shadow-md hover:border-[#F5A900]/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <span className="text-5xl font-display font-bold text-[#e6e6e6]">{step.step}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#1d1c1c] mb-2">{step.title}</h3>
                  <p className="text-[#969696] text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
            <Link href="/products" className="btn-primary px-8 py-4 text-base inline-flex">
              Start Creating Your Gift
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#fde68a] mb-4">
                Our Collection
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1d1c1c] mt-4">
                Featured AR Gifts
              </h2>
            </div>
            <Link href="/products" className="btn-outline self-start md:self-auto text-sm px-5 py-2.5 flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {productsLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-[#e6e6e6] animate-pulse">
                    <div className="aspect-[4/3] bg-[#F7F7F7]" />
                    <div className="p-5 space-y-3 bg-white">
                      <div className="h-3 bg-[#F7F7F7] rounded w-3/4" />
                      <div className="h-5 bg-[#F7F7F7] rounded w-1/2" />
                    </div>
                  </div>
                ))
              : featuredProducts.map((product, index) => {
                  const emoji = categoryEmoji[product.category] ?? '🎁';
                  const imageUrl = product.images[0]?.url;
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group rounded-2xl overflow-hidden border border-[#e6e6e6] bg-white hover:shadow-lg hover:border-[#F5A900]/30 transition-all duration-300"
                    >
                      <div className="relative aspect-[4/3] bg-[#F7F7F7] flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 25vw" />
                        ) : (
                          <motion.div className="text-7xl select-none" whileHover={{ scale: 1.2 }} transition={{ type: 'spring', stiffness: 300 }}>
                            {emoji}
                          </motion.div>
                        )}
                        <div className="absolute top-3 right-3 bg-[#F5A900] text-white text-[10px] font-bold px-2 py-1 rounded-full">✦ AR</div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Link href={`/customize/${product._id}`} className="bg-white text-[#1d1c1c] font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#F5A900] hover:text-white transition-colors">
                            Customize
                          </Link>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-[#969696] text-xs mb-1 truncate">{product.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <div>
                            <h3 className="font-semibold text-[#1d1c1c] text-[15px]">{product.name}</h3>
                            <span className="text-xl font-display font-bold text-[#F5A900]">₹{product.price.toLocaleString('en-IN')}</span>
                          </div>
                          <Link href={`/customize/${product._id}`} className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#fde68a] flex items-center justify-center text-[#D97706] hover:bg-[#F5A900] hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
            }
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#fde68a] mb-4">
              Browse by Type
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1d1c1c] mt-4 mb-3">
              Product Categories
            </h2>
            <p className="text-[#969696]">Find the perfect AR gift for every occasion</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, index) => (
              <motion.div key={cat.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} whileHover={{ y: -4 }}>
                <Link href={cat.href} className="bg-white flex flex-col items-center py-8 px-4 rounded-2xl text-center border border-[#e6e6e6] hover:border-[#F5A900]/40 hover:shadow-md transition-all duration-300 block group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">{cat.emoji}</div>
                  <p className="font-semibold text-[#1d1c1c] text-sm mb-1">{cat.name}</p>
                  <p className="text-[#F5A900] text-xs font-semibold">{cat.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#fde68a] mb-4">
              <Star className="w-3 h-3 fill-[#F5A900] text-[#F5A900]" /> Happy Customers
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1d1c1c] mt-4 mb-3">
              What People Are Saying
            </h2>
            <p className="text-[#969696]">Join 10,000+ customers who've created magical moments</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }}
                className="bg-white rounded-2xl p-7 border border-[#e6e6e6] hover:border-[#F5A900]/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#F5A900] text-[#F5A900]" />)}
                </div>
                <p className="text-[#555555] text-[15px] leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#F5A900] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[#1d1c1c] font-semibold text-sm">{t.name}</p>
                    <p className="text-[#969696] text-xs">{t.location}</p>
                  </div>
                  <div className="ml-auto text-[10px] px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 font-semibold">Verified</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 bg-[#1d1c1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCard value={10000} suffix="+" label="Happy Customers"   icon={Users}   />
            <StatCard value={25000} suffix="+" label="AR Gifts Delivered" icon={Package} />
            <StatCard value={4900}  suffix="+" label="5-Star Reviews"     icon={Star}    />
            <StatCard value={99}    suffix="%" label="Satisfaction Rate"  icon={Heart}   />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl bg-[#F5A900] overflow-hidden text-center py-20 px-8 relative"
          >
            <div className="absolute inset-0 bg-dark-grid opacity-10" />
            <div className="relative z-10">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-5xl mb-6 inline-block">
                🎁
              </motion.div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
                Ready to Create Pure Magic?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-lg mx-auto">
                Start personalizing your AR gift today. Free delivery on orders above ₹999.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-white text-[#1d1c1c] font-bold px-9 py-4 rounded-full hover:bg-[#FEF3C7] transition-colors text-base">
                  <ShoppingBag className="w-5 h-5" /> Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/scan" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-bold px-9 py-4 rounded-full hover:bg-white/10 transition-colors text-base">
                  <Camera className="w-5 h-5" /> Try AR Scanner
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
                {['Free Returns', 'Secure Checkout', '24/7 Support', 'No App Needed'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /><span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DEMO MODAL ── */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setDemoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-white border border-[#e6e6e6] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setDemoOpen(false)} className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-[#F7F7F7] hover:bg-[#e6e6e6] text-[#969696] hover:text-[#1d1c1c] transition-all">
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-video flex items-center justify-center bg-[#FEF3C7]">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-[#F5A900]/20 border border-[#F5A900]/30 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-9 h-9 text-[#F5A900]" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#1d1c1c] mb-2">AR Demo</h3>
                  <p className="text-[#969696] text-sm max-w-xs mx-auto">Point your camera at any AR gift card to see your video come to life in real-time</p>
                  <Link href="/scan" onClick={() => setDemoOpen(false)} className="btn-primary mt-6 inline-flex px-7 py-3 text-sm">
                    Try Live AR Scanner <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="p-5 border-t border-[#e6e6e6]">
                <p className="text-[#969696] text-xs text-center">No app download required · Works in any browser · Instant video playback</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
