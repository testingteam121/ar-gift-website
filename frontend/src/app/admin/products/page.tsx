'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Image as ImageIcon, Loader2, X, Check } from 'lucide-react';
import { productApi } from '@/lib/api';
import { Product } from '@/types';
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal';
import FileUpload from '@/components/ui/FileUpload';
import toast from 'react-hot-toast';

const categories = [
  { value: 'greeting-card', label: 'Greeting Card' },
  { value: 'photo-frame', label: 'Photo Frame' },
  { value: 'mug', label: 'Mug' },
  { value: 'keychain', label: 'Keychain' },
  { value: 'led-frame', label: 'LED Frame' },
];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  features: string;
  isActive: boolean;
}

const defaultForm: ProductForm = {
  name: '', description: '', price: '', category: 'greeting-card',
  stock: '', features: '', isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productApi.getAll({ limit: 100 });
      setProducts(data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditProduct(null);
    setForm(defaultForm);
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      features: product.features?.join(', ') || '',
      isActive: product.isActive,
    });
    setImageFiles([]);
    setImagePreviews(product.images?.map((img) => img.url) || []);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.category || !form.stock) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('stock', form.stock);
      formData.append('features', form.features);
      formData.append('isActive', String(form.isActive));
      imageFiles.forEach((file) => formData.append('images', file));

      if (editProduct) {
        await productApi.update(editProduct._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productApi.create(formData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productApi.delete(deleteId);
      toast.success('Product deleted');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const formData = new FormData();
      formData.append('isActive', String(!product.isActive));
      await productApi.update(product._id, formData);
      toast.success(`Product ${product.isActive ? 'hidden' : 'shown'}`);
      fetchProducts();
    } catch {
      toast.error('Failed to update product');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{products.length} products in catalog</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#F5A900] hover:bg-[#D97706] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-glow"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-[#F5A900] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Product</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Price</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden sm:table-cell">Stock</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium hidden lg:table-cell">Status</th>
                <th className="text-right px-5 py-3.5 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-800 rounded shimmer-bg opacity-50" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-600">
                    <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{product.name}</p>
                          <p className="text-gray-400 text-xs truncate max-w-[180px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full capitalize">
                        {product.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white font-semibold">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`text-xs font-medium ${product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${product.isActive ? 'bg-green-500/15 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        {product.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                          title={product.isActive ? 'Hide' : 'Show'}
                        >
                          {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setDeleteId(product._id); setShowDeleteModal(true); }}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProduct ? 'Edit Product' : 'Add New Product'} size="lg">
        <ModalBody className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
                placeholder="e.g. AR Birthday Greeting Card"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="input-field"
              >
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="input-field"
                placeholder="299"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                className="input-field"
                placeholder="100"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <div className="flex items-center gap-3 h-[46px]">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-[#F5A900]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-gray-600">{form.isActive ? 'Active (Visible)' : 'Hidden'}</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field resize-none"
                rows={3}
                placeholder="Describe the product..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Features (comma separated)</label>
              <input
                type="text"
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                className="input-field"
                placeholder="AR-enabled, Premium quality, Gift ready packaging"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Images</label>
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {imagePreviews.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <FileUpload
                onFileSelect={(file, preview) => {
                  setImageFiles((f) => [...f, file]);
                  setImagePreviews((p) => [...p, preview]);
                }}
                accept="image"
                maxSizeMB={10}
                hint="Upload product images (JPG, PNG)"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Saving...' : (editProduct ? 'Update Product' : 'Create Product')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Product" size="sm">
        <ModalBody>
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-gray-700 font-medium mb-1">Delete this product?</p>
            <p className="text-gray-400 text-sm">This will hide the product from the store. This action can be undone by re-enabling it.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
