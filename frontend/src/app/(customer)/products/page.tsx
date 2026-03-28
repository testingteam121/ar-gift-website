'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { productApi } from '@/lib/api';
import { Product, ProductCategory } from '@/types';
import { useSearchParams } from 'next/navigation';

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'greeting-card', label: 'Greeting Cards' },
  { value: 'photo-frame', label: 'Photo Frames' },
  { value: 'mug', label: 'Mugs' },
  { value: 'keychain', label: 'Keychains' },
  { value: 'led-frame', label: 'LED Frames' },
];

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratings.average', label: 'Top Rated' },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="aspect-square shimmer-bg" />
      <div className="p-4 space-y-3">
        <div className="h-4 shimmer-bg rounded w-3/4" />
        <div className="h-3 shimmer-bg rounded w-full" />
        <div className="h-3 shimmer-bg rounded w-1/2" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 shimmer-bg rounded w-16" />
          <div className="h-9 shimmer-bg rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(
    (searchParams.get('category') as ProductCategory) || 'all'
  );
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 12,
        sort,
      };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await productApi.getAll(params);
      setProducts(data.products);
      setTotalProducts(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search, sort, minPrice, maxPrice, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const urlCategory = searchParams.get('category') as ProductCategory;
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearch('');
    setSearchInput('');
    setMinPrice('');
    setMaxPrice('');
    setSort('-createdAt');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory !== 'all' || search || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1d1c1c] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5A900] tracking-[0.15em] uppercase mb-4 border border-[#F5A900]/30 px-4 py-1.5 rounded-full"
          >
            ✦ Our Collection
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-bold text-white mb-3"
          >
            AR Gift Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#969696]"
          >
            {totalProducts} magical gifts available
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-xl mx-auto flex gap-3"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#969696]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#2a2a2a] border border-[#333333] focus:outline-none focus:border-[#F5A900] text-white placeholder-[#555555]"
              />
            </div>
            <button type="submit" className="bg-[#F5A900] hover:bg-[#D97706] text-white px-6 py-3.5 rounded-2xl font-semibold transition-colors">
              Search
            </button>
          </motion.form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Category filters */}
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { setSelectedCategory(cat.value); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat.value
                      ? 'bg-[#F5A900] text-white'
                      : 'bg-white text-[#555555] hover:bg-[#F7F7F7] border border-[#e6e6e6]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort + Filter controls */}
          <div className="flex gap-3 items-center">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white border border-[#e6e6e6] text-[#555555] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A900]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                showFilters ? 'bg-[#F5A900] text-white border-[#F5A900]' : 'bg-white text-[#555555] border-[#e6e6e6]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-[#F5A900] rounded-full" />
              )}
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-5 mb-6 border border-gray-200 shadow-sm"
          >
            <div className="flex flex-wrap gap-6 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Price (₹)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-32 px-3 py-2 border border-[#e6e6e6] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A900]"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Price (₹)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="10000"
                  className="w-32 px-3 py-2 border border-[#e6e6e6] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A900]"
                  min="0"
                />
              </div>
              <button
                onClick={() => { setCurrentPage(1); fetchProducts(); }}
                className="px-5 py-2 bg-[#F5A900] text-white rounded-xl text-sm font-medium hover:bg-[#D97706] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      currentPage === i + 1
                        ? 'bg-[#F5A900] text-white'
                        : 'bg-white border border-[#e6e6e6] text-[#555555] hover:bg-[#F7F7F7]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#F5A900] border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
