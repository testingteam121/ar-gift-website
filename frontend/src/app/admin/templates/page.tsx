'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { templateApi } from '@/lib/api';
import { Template, TemplateCategory } from '@/types';
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal';
import FileUpload from '@/components/ui/FileUpload';
import toast from 'react-hot-toast';

const categories: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'love', label: 'Love' },
  { value: 'festival', label: 'Festival' },
];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'birthday' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      const { data } = await templateApi.getAll(params);
      setTemplates(data.templates || []);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleSave = async () => {
    if (!form.name.trim() || !imageFile) {
      toast.error('Name and image are required');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('category', form.category);
      formData.append('image', imageFile);
      await templateApi.create(formData);
      toast.success('Template uploaded successfully');
      setShowModal(false);
      setForm({ name: '', category: 'birthday' });
      setImageFile(null);
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await templateApi.delete(deleteId);
      toast.success('Template deleted');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchTemplates();
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Templates</h1>
          <p className="text-gray-400 text-sm mt-0.5">{templates.length} templates in library</p>
        </div>
        <button
          onClick={() => { setForm({ name: '', category: 'birthday' }); setImageFile(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#F5A900] hover:bg-[#D97706] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-glow"
        >
          <Plus className="w-5 h-5" /> Upload Template
        </button>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.value
                  ? 'bg-[#F5A900] text-white shadow-glow'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-56">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-[#F5A900]"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-800 rounded-2xl shimmer-bg opacity-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No templates found</p>
          <p className="text-sm mt-1">Upload your first template to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((template, i) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-800 bg-gray-900"
            >
              <img
                src={template.thumbnailUrl || template.imageUrl}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-medium truncate mb-2">{template.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-[#F5A900]/80 text-white text-xs px-2 py-0.5 rounded-full capitalize">
                      {template.category}
                    </span>
                    <button
                      onClick={() => { setDeleteId(template._id); setShowDeleteModal(true); }}
                      className="w-7 h-7 bg-red-500/80 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Template" size="md">
        <ModalBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Template Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. Floral Birthday Wishes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="input-field"
            >
              {categories.filter((c) => c.value !== 'all').map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <FileUpload
            onFileSelect={(file) => setImageFile(file)}
            onFileRemove={() => setImageFile(null)}
            accept="image"
            maxSizeMB={10}
            label="Template Image *"
            hint="Upload high-quality image (min 800x800px recommended)"
          />
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Uploading...' : 'Upload Template'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Template" size="sm">
        <ModalBody>
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-gray-700 font-medium mb-1">Delete this template?</p>
            <p className="text-gray-400 text-sm">This will permanently remove the template and its image from Cloudinary.</p>
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
