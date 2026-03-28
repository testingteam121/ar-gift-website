'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/#how-it-works', label: 'How it Works' },
  { href: '/customize', label: 'Customize Gift' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact', label: 'Contact Us' },
];

const categories = [
  { href: '/products?category=greeting-card', label: 'Greeting Cards' },
  { href: '/products?category=photo-frame', label: 'Photo Frames' },
  { href: '/products?category=mug', label: 'AR Mugs' },
  { href: '/products?category=keychain', label: 'Keychains' },
  { href: '/products?category=led-frame', label: 'LED Frames' },
];

const socialLinks = [
  { href: '#', icon: Instagram, label: 'Instagram' },
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Facebook, label: 'Facebook' },
  { href: '#', icon: Youtube, label: 'YouTube' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setEmail('');
    toast.success('Subscribed! Check your inbox.');
  };

  return (
    <footer className="bg-[#1d1c1c] border-t border-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-14">

          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-[#F5A900] flex items-center justify-center">
                <Sparkles className="w-[17px] h-[17px] text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-[17px] text-white block leading-none">AR Gifts</span>
                <span className="text-[9px] text-[#F5A900] tracking-[0.15em] uppercase font-semibold">Augmented Reality</span>
              </div>
            </Link>
            <p className="text-[#969696] text-sm leading-relaxed mb-6 max-w-sm">
              We create magical augmented reality gifts that bring your memories to life. Give gifts that truly come alive — no app required.
            </p>

            {/* Social links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[#969696] hover:text-[#F5A900] hover:border-[#F5A900] transition-colors duration-200 border border-[#333333]"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">Navigation</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#969696] hover:text-[#F5A900] transition-colors duration-200 text-sm flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-[#F5A900] transition-all duration-200 overflow-hidden" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">Products</h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-[#969696] hover:text-[#F5A900] transition-colors duration-200 text-sm flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-[#F5A900] transition-all duration-200 overflow-hidden" />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">Get In Touch</h3>
            <ul className="space-y-3 mb-7">
              <li>
                <a href="mailto:support@argifts.com" className="flex items-center gap-3 text-[#969696] hover:text-[#F5A900] text-sm transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-[#F5A900]/10 border border-[#F5A900]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-[#F5A900]" />
                  </div>
                  support@argifts.com
                </a>
              </li>
              <li>
                <a href="tel:+911800000000" className="flex items-center gap-3 text-[#969696] hover:text-[#F5A900] text-sm transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-[#F5A900]/10 border border-[#F5A900]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-[#F5A900]" />
                  </div>
                  +91 1800-000-000
                </a>
              </li>
              <li className="flex items-center gap-3 text-[#969696] text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F5A900]/10 border border-[#F5A900]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#F5A900]" />
                </div>
                Mumbai, Maharashtra, India
              </li>
            </ul>

            {/* Newsletter */}
            <h3 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-3">Newsletter</h3>
            <p className="text-[#969696] text-xs mb-3">Get exclusive offers and AR gift ideas straight to your inbox.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-white text-sm outline-none transition-all bg-[#2a2a2a] border border-[#333333] placeholder-[#555555] focus:border-[#F5A900]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40 bg-[#F5A900] hover:bg-[#D97706]"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#333333]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#555555] text-xs">
              &copy; {new Date().getFullYear()} AR Gifts. All rights reserved. Made with ❤️ in India.
            </p>
            <div className="flex items-center gap-5 text-xs text-[#555555]">
              <Link href="/privacy" className="hover:text-[#F5A900] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#F5A900] transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-[#F5A900] transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
