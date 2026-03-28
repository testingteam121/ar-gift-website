'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Info, AlertCircle, Maximize2 } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const [targetImage, setTargetImage] = useState<string>('');
  const [targetVideo, setTargetVideo] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [arStarted, setArStarted] = useState(false);
  const [error, setError] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const image = sessionStorage.getItem('ar_target_image') || '';
    const video = sessionStorage.getItem('ar_target_video') || '';
    setTargetImage(image);
    setTargetVideo(video);
  }, []);

  const startAR = () => {
    if (!targetImage || !targetVideo) {
      setError('No AR target found. Please customize a product first.');
      return;
    }
    setShowInstructions(false);
    setArStarted(true);
  };

  const getARViewerUrl = () => {
    const params = new URLSearchParams({
      target: targetImage,
      video: targetVideo,
    });
    return `/ar-viewer.html?${params.toString()}`;
  };

  const openFullscreen = () => {
    window.open(getARViewerUrl(), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16">
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-gray-900 rounded-3xl p-8 border border-gray-700"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#F5A900]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-[#F5A900]" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Test AR Experience</h1>
              <p className="text-gray-400">Preview how your AR gift will look</p>
            </div>

            {!targetImage && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 text-sm font-medium">No AR target found</p>
                  <p className="text-yellow-400/70 text-xs mt-1">
                    Please go back and customize a product first, then click "Test AR".
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-8">
              {[
                { icon: '📱', text: 'Allow camera access when prompted' },
                { icon: '🎯', text: 'Point camera at the image/card you selected' },
                { icon: '✨', text: 'Watch your video message appear in AR' },
                { icon: '📏', text: 'Keep 20-40cm distance for best results' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={startAR}
                disabled={!targetImage}
                className="w-full bg-[#F5A900] hover:bg-[#D97706] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Start AR Experience
              </button>
              <button
                onClick={openFullscreen}
                disabled={!targetImage}
                className="w-full border border-gray-600 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-5 h-5" />
                Open Full Screen
              </button>
              <Link
                href="/products"
                className="block text-center text-gray-500 hover:text-gray-300 text-sm transition-colors py-2"
              >
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* AR Viewer */}
      {arStarted && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Header overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">AR Active</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openFullscreen}
                className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setArStarted(false); setShowInstructions(true); }}
                className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Instructions overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10"
            >
              <div className="w-16 h-16 border-2 border-white/40 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-white text-sm font-medium">Point camera at your AR image</p>
              <p className="text-white/50 text-xs mt-1">Keep the image in frame</p>
            </motion.div>
          </div>

          {/* AR iframe */}
          <iframe
            ref={iframeRef}
            src={getARViewerUrl()}
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen"
            title="AR Viewer"
          />
        </div>
      )}
    </div>
  );
}
