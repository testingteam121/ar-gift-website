'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, Video as VideoIcon, Loader2, Check, Play } from 'lucide-react';
import { presetVideoApi } from '@/lib/api';
import { PresetVideo, VideoCategory } from '@/types';
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const categories: { value: VideoCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'festival', label: 'Festival' },
  { value: 'general', label: 'General' },
];

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<PresetVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<VideoCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'birthday', duration: '' });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<PresetVideo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      const { data } = await presetVideoApi.getAll(params);
      setVideos(data.videos || []);
    } catch {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be under 100MB');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !videoFile) {
      toast.error('Name and video are required');
      return;
    }
    setSaving(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('category', form.category);
      if (form.duration) formData.append('duration', form.duration);
      formData.append('video', videoFile);

      await api.post('/preset-videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round(((progressEvent.loaded || 0) * 100) / (progressEvent.total || 1));
          setUploadProgress(pct);
        },
      });

      toast.success('Preset video uploaded successfully');
      setShowModal(false);
      setForm({ name: '', category: 'birthday', duration: '' });
      setVideoFile(null);
      setVideoPreview('');
      setUploadProgress(0);
      fetchVideos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await presetVideoApi.delete(deleteId);
      toast.success('Video deleted');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchVideos();
    } catch {
      toast.error('Failed to delete video');
    }
  };

  const filtered = videos.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Preset Videos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{videos.length} videos in library</p>
        </div>
        <button
          onClick={() => { setForm({ name: '', category: 'birthday', duration: '' }); setVideoFile(null); setVideoPreview(''); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#F5A900] hover:bg-[#D97706] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-glow"
        >
          <Plus className="w-5 h-5" /> Upload Video
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
            placeholder="Search videos..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-[#F5A900]"
          />
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-video bg-gray-800 rounded-2xl shimmer-bg opacity-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <VideoIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No videos found</p>
          <p className="text-sm mt-1">Upload your first preset video</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((video, i) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group relative aspect-video rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 cursor-pointer"
              onClick={() => setPreviewVideo(video)}
            >
              {video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt={video.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1d1c1c] to-[#333333] flex items-center justify-center">
                  <VideoIcon className="w-8 h-8 text-white/30" />
                </div>
              )}

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-[#F5A900] ml-0.5" />
                </div>
              </div>

              {/* Info + Delete */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate mb-1.5">{video.name}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="bg-[#F5A900]/80 text-white text-xs px-2 py-0.5 rounded-full capitalize">{video.category}</span>
                    {video.duration && <span className="text-gray-300 text-xs">{formatDuration(video.duration)}</span>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(video._id); setShowDeleteModal(true); }}
                    className="w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white rounded-md flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Preview Modal */}
      <Modal isOpen={!!previewVideo} onClose={() => setPreviewVideo(null)} title={previewVideo?.name} size="lg">
        <ModalBody>
          {previewVideo && (
            <div className="space-y-3">
              <video src={previewVideo.videoUrl} controls autoPlay className="w-full rounded-xl max-h-80" />
              <div className="flex items-center gap-3 text-sm">
                <span className="bg-[#FEF3C7] text-[#F5A900] px-3 py-1 rounded-full font-medium capitalize">{previewVideo.category}</span>
                {previewVideo.duration && <span className="text-gray-500">{formatDuration(previewVideo.duration)}</span>}
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Preset Video" size="md">
        <ModalBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Video Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. Happy Birthday Sparkles"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (seconds)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="input-field"
                placeholder="30"
                min="1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Video File * (MP4/MOV, max 100MB)</label>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleVideoChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#FFFBEB] file:text-[#F5A900] hover:file:bg-[#FEF3C7] cursor-pointer"
            />
            {videoPreview && (
              <video src={videoPreview} controls className="mt-3 w-full max-h-40 rounded-xl border border-gray-200" />
            )}
          </div>

          {saving && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading video to Cloudinary...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#F5A900] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? `Uploading ${uploadProgress}%...` : 'Upload Video'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Video" size="sm">
        <ModalBody>
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-gray-700 font-medium mb-1">Delete this preset video?</p>
            <p className="text-gray-400 text-sm">This will permanently remove the video from Cloudinary and the library.</p>
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
