'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  Upload, Image as ImageIcon, Video, Play, Pause, Check, ChevronLeft,
  ChevronRight, ShoppingCart, Eye, X, Loader2
} from 'lucide-react';
import { productApi, templateApi, presetVideoApi } from '@/lib/api';
import { Product, Template, PresetVideo, TemplateCategory, VideoCategory } from '@/types';
import { useCartStore } from '@/store/cartStore';

type Step = 1 | 2 | 3 | 4;

const stepLabels = ['Select Image', 'Select Video', 'AR Preview', 'Add to Cart'];

const templateCategories: { value: TemplateCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'love', label: 'Love' },
  { value: 'festival', label: 'Festival' },
];

const videoCategories: { value: VideoCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'festival', label: 'Festival' },
  { value: 'general', label: 'General' },
];

export default function CustomizePage() {
  const { productId } = useParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [step, setStep] = useState<Step>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Step 1 state
  const [imageTab, setImageTab] = useState<'template' | 'upload'>('template');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');

  // Step 2 state
  const [videoTab, setVideoTab] = useState<'preset' | 'upload'>('preset');
  const [presetVideos, setPresetVideos] = useState<PresetVideo[]>([]);
  const [videoCategory, setVideoCategory] = useState<VideoCategory>('all');
  const [selectedPresetVideo, setSelectedPresetVideo] = useState<PresetVideo | null>(null);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [uploadedVideoPreview, setUploadedVideoPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Step 4
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productApi.getOne(productId as string);
        setProduct(data.product);
      } catch {
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setLoadingProduct(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId, router]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const params = templateCategory !== 'all' ? { category: templateCategory } : undefined;
        const { data } = await templateApi.getAll(params);
        setTemplates(data.templates);
      } catch {
        console.error('Failed to fetch templates');
      }
    };
    fetchTemplates();
  }, [templateCategory]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const params = videoCategory !== 'all' ? { category: videoCategory } : undefined;
        const { data } = await presetVideoApi.getAll(params);
        setPresetVideos(data.videos);
      } catch {
        console.error('Failed to fetch videos');
      }
    };
    fetchVideos();
  }, [videoCategory]);

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }
    setUploadedImageFile(file);
    setUploadedImagePreview(URL.createObjectURL(file));
    setSelectedTemplate(null);
  }, []);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
  });

  const onVideoDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be less than 50MB');
      return;
    }
    setUploadedVideoFile(file);
    setUploadedVideoPreview(URL.createObjectURL(file));
    setSelectedPresetVideo(null);

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 10;
      });
    }, 200);
  }, []);

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = useDropzone({
    onDrop: onVideoDrop,
    accept: { 'video/mp4': [], 'video/quicktime': [], 'video/webm': [] },
    maxFiles: 1,
  });

  const hasImage = selectedTemplate || uploadedImageFile;
  const hasVideo = selectedPresetVideo || uploadedVideoFile;

  const getSelectedImageUrl = () => {
    if (selectedTemplate) return selectedTemplate.imageUrl;
    if (uploadedImagePreview) return uploadedImagePreview;
    return '';
  };

  const getSelectedVideoUrl = () => {
    if (selectedPresetVideo) return selectedPresetVideo.videoUrl;
    if (uploadedVideoPreview) return uploadedVideoPreview;
    return '';
  };

  const handleNext = () => {
    if (step === 1 && !hasImage) {
      toast.error('Please select a template or upload an image');
      return;
    }
    if (step === 2 && !hasVideo) {
      toast.error('Please select a preset video or upload your own');
      return;
    }
    setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    setStep((s) => (s - 1) as Step);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      product,
      quantity,
      customization: {
        uploadedImage: uploadedImageFile
          ? { file: uploadedImageFile, preview: uploadedImagePreview }
          : selectedTemplate
          ? { url: selectedTemplate.imageUrl }
          : undefined,
        selectedTemplate: selectedTemplate || undefined,
        selectedVideo: selectedPresetVideo
          ? { url: selectedPresetVideo.videoUrl, type: 'preset', presetVideo: selectedPresetVideo }
          : uploadedVideoFile
          ? { url: uploadedVideoPreview, type: 'upload', file: uploadedVideoFile }
          : undefined,
      },
    });
    toast.success('Added to cart!');
    router.push('/cart');
  };

  const handleTestAR = () => {
    const imageUrl = getSelectedImageUrl();
    const videoUrl = getSelectedVideoUrl();
    if (imageUrl && videoUrl) {
      sessionStorage.setItem('ar_target_image', imageUrl);
      sessionStorage.setItem('ar_target_video', videoUrl);
      window.open('/scan', '_blank');
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-10 h-10 text-[#D97706] animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customize Your {product.name}</h1>
          <p className="text-gray-500 mt-1">Create your personalized AR gift in 4 easy steps</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {stepLabels.map((label, index) => {
            const stepNum = (index + 1) as Step;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-[#F5A900] text-white shadow-glow' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
                  </div>
                  <span className={`text-xs mt-1 font-medium hidden sm:block ${
                    isCurrent ? 'text-[#F5A900]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>{label}</span>
                </div>
                {index < stepLabels.length - 1 && (
                  <div className={`w-16 sm:w-24 h-0.5 mx-2 transition-colors duration-300 ${
                    step > stepNum ? 'bg-green-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* STEP 1: Select Image */}
            {step === 1 && (
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Step 1: Select Your Image</h2>
                <p className="text-gray-500 text-sm mb-6">Choose a template or upload your own image</p>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
                  <button
                    onClick={() => setImageTab('template')}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      imageTab === 'template' ? 'bg-[#F5A900] text-white shadow-glow' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Template Gallery
                  </button>
                  <button
                    onClick={() => setImageTab('upload')}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      imageTab === 'upload' ? 'bg-[#F5A900] text-white shadow-glow' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Upload My Image
                  </button>
                </div>

                {imageTab === 'template' && (
                  <>
                    {/* Category filter */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
                      {templateCategories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setTemplateCategory(cat.value)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                            templateCategory === cat.value
                              ? 'bg-[#FEF3C7] text-[#D97706] border border-[#fcd34d]'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {templates.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No templates available in this category yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {templates.map((template) => (
                          <button
                            key={template._id}
                            onClick={() => {
                              setSelectedTemplate(template);
                              setUploadedImageFile(null);
                              setUploadedImagePreview('');
                            }}
                            className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all duration-200 ${
                              selectedTemplate?._id === template._id
                                ? 'border-[#F5A900] shadow-glow scale-95'
                                : 'border-transparent hover:border-[#F5A900]/50 hover:scale-95'
                            }`}
                          >
                            <img src={template.thumbnailUrl || template.imageUrl} alt={template.name} className="w-full h-full object-cover" />
                            {selectedTemplate?._id === template._id && (
                              <div className="absolute inset-0 bg-[#F5A900]/20 flex items-center justify-center">
                                <div className="w-8 h-8 bg-[#F5A900] rounded-full flex items-center justify-center">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                              <p className="text-white text-xs font-medium truncate">{template.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {imageTab === 'upload' && (
                  <div>
                    <div
                      {...getImageRootProps()}
                      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                        isImageDragActive ? 'border-[#F5A900] bg-[#FFFBEB]' : 'border-gray-200 hover:border-[#F5A900] hover:bg-gray-50'
                      }`}
                    >
                      <input {...getImageInputProps()} />
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">
                        {isImageDragActive ? 'Drop your image here' : 'Drag & drop your image here'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">or click to browse</p>
                      <p className="text-gray-400 text-xs mt-3">JPG, PNG, WebP · Max 10MB</p>
                    </div>

                    {uploadedImagePreview && (
                      <div className="mt-4 relative">
                        <img src={uploadedImagePreview} alt="Preview" className="w-full max-h-60 object-contain rounded-xl border border-gray-200" />
                        <button
                          onClick={() => { setUploadedImageFile(null); setUploadedImagePreview(''); }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Image uploaded successfully
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Select Video */}
            {step === 2 && (
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Step 2: Select AR Video</h2>
                <p className="text-gray-500 text-sm mb-6">This video will play when someone scans your gift</p>

                <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
                  <button
                    onClick={() => setVideoTab('preset')}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      videoTab === 'preset' ? 'bg-[#F5A900] text-white shadow-glow' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Preset Videos
                  </button>
                  <button
                    onClick={() => setVideoTab('upload')}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      videoTab === 'upload' ? 'bg-[#F5A900] text-white shadow-glow' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Upload My Video
                  </button>
                </div>

                {videoTab === 'preset' && (
                  <>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
                      {videoCategories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setVideoCategory(cat.value)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                            videoCategory === cat.value
                              ? 'bg-[#FEF3C7] text-[#D97706] border border-[#fcd34d]'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {presetVideos.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No preset videos available in this category yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {presetVideos.map((video) => (
                          <button
                            key={video._id}
                            onClick={() => {
                              setSelectedPresetVideo(video);
                              setUploadedVideoFile(null);
                              setUploadedVideoPreview('');
                            }}
                            className={`relative rounded-2xl overflow-hidden aspect-video border-2 group transition-all duration-200 ${
                              selectedPresetVideo?._id === video._id
                                ? 'border-[#F5A900] shadow-glow'
                                : 'border-transparent hover:border-[#F5A900]/50'
                            }`}
                          >
                            <div className="w-full h-full bg-gradient-to-br from-[#1d1c1c] to-[#333333] flex items-center justify-center">
                              {video.thumbnailUrl ? (
                                <img src={video.thumbnailUrl} alt={video.name} className="w-full h-full object-cover" />
                              ) : (
                                <Video className="w-8 h-8 text-white/50" />
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                                <Play className="w-5 h-5 text-[#F5A900] ml-0.5" />
                              </div>
                            </div>
                            {selectedPresetVideo?._id === video._id && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-[#F5A900] rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-white text-xs font-medium truncate">{video.name}</p>
                              {video.duration && (
                                <p className="text-white/60 text-xs">{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {videoTab === 'upload' && (
                  <div>
                    <div
                      {...getVideoRootProps()}
                      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                        isVideoDragActive ? 'border-[#F5A900] bg-[#FFFBEB]' : 'border-gray-200 hover:border-[#F5A900] hover:bg-gray-50'
                      }`}
                    >
                      <input {...getVideoInputProps()} />
                      <Video className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">
                        {isVideoDragActive ? 'Drop your video here' : 'Drag & drop your video here'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">or click to browse</p>
                      <p className="text-gray-400 text-xs mt-3">MP4, MOV, WebM · Max 50MB</p>
                    </div>

                    {uploadedVideoFile && (
                      <div className="mt-4">
                        {uploadProgress < 100 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Processing...</span>
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
                        {uploadedVideoPreview && (
                          <video
                            src={uploadedVideoPreview}
                            controls
                            className="w-full max-h-48 rounded-xl border border-gray-200"
                          />
                        )}
                        <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                          <Check className="w-4 h-4" /> {uploadedVideoFile.name} ready
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: AR Preview */}
            {step === 3 && (
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Step 3: Preview Your AR Gift</h2>
                <p className="text-gray-500 text-sm mb-6">Review your customization and test the AR experience</p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image preview */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Image</h3>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
                      {getSelectedImageUrl() ? (
                        <img src={getSelectedImageUrl()} alt="Selected" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      {selectedTemplate ? `Template: ${selectedTemplate.name}` : 'Custom uploaded image'}
                    </p>
                  </div>

                  {/* Video preview */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Your AR Video</h3>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 flex items-center justify-center relative">
                      {getSelectedVideoUrl() ? (
                        <video src={getSelectedVideoUrl()} controls className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <Video className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">No video selected</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      {selectedPresetVideo ? `Preset: ${selectedPresetVideo.name}` : 'Custom uploaded video'}
                    </p>
                  </div>
                </div>

                {/* Test AR button */}
                <div className="mt-8 p-5 bg-[#FFFBEB] rounded-2xl border border-[#fde68a]">
                  <h3 className="font-semibold text-[#1d1c1c] mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Test AR Experience
                  </h3>
                  <p className="text-[#555555] text-sm mb-4">
                    Preview how your AR gift will look. Point the camera at the image below to see the video play.
                  </p>
                  <button
                    onClick={handleTestAR}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Open AR Preview
                  </button>
                  <p className="text-xs text-[#D97706] mt-2">
                    Note: For the best AR experience, ensure you have camera permissions enabled.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: Add to Cart */}
            {step === 4 && (
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Step 4: Complete Your Order</h2>
                <p className="text-gray-500 text-sm mb-6">Review and add your customized AR gift to cart</p>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Product Summary */}
                  <div>
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                      <div className="flex gap-4 mb-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                          <img
                            src={product.images?.[0]?.url || ''}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{product.category.replace('-', ' ')}</p>
                          <p className="text-[#F5A900] font-bold mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Image</span>
                          <span className="text-gray-700 font-medium">
                            {selectedTemplate ? selectedTemplate.name : 'Custom upload'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">AR Video</span>
                          <span className="text-gray-700 font-medium">
                            {selectedPresetVideo ? selectedPresetVideo.name : 'Custom video'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Image preview small */}
                    {getSelectedImageUrl() && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video">
                        <img src={getSelectedImageUrl()} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Quantity and Price */}
                  <div>
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-4">Quantity & Pricing</h3>

                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                          <button
                            onClick={() => setQuantity((q) => q + 1)}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-5">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Price per item</span>
                          <span className="text-gray-700">₹{product.price.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Quantity</span>
                          <span className="text-gray-700">x {quantity}</span>
                        </div>
                        {product.price * quantity >= 999 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Free Delivery</span>
                            <span>Included</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-bold text-2xl text-[#F5A900]">
                            ₹{(product.price * quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleAddToCart}
                        className="w-full btn-primary flex items-center justify-center gap-2 py-4"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>

                      <button
                        onClick={() => {
                          handleAddToCart();
                          router.push('/checkout');
                        }}
                        className="w-full mt-3 btn-secondary flex items-center justify-center gap-2 py-4"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={step === 1 ? () => router.push('/products') : handleBack}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {step === 1 ? 'Back to Products' : 'Previous'}
          </button>

          {step < 4 && (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
            >
              Next Step
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
