'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

type Status = 'loading' | 'compiling' | 'uploading' | 'done' | 'error';

function PrepareARContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const imageUrl = searchParams.get('imageUrl');

  const [status, setStatus] = useState<Status>('loading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId || !imageUrl) {
      router.push('/');
      return;
    }
    compileMindFile();
  }, []);

  const compileMindFile = async () => {
    try {
      setStatus('compiling');

      const Compiler: any = await new Promise((resolve, reject) => {
        if ((window as any).__MindARCompiler) return resolve((window as any).__MindARCompiler);
        const onReady = () => resolve((window as any).__MindARCompiler);
        window.addEventListener('mindar-compiler-ready', onReady as EventListener, { once: true });
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import * as MindAR from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js';
          window.__MindARCompiler = MindAR.Compiler ?? MindAR.default?.Compiler ?? MindAR.default?.IMAGE?.Compiler;
          window.dispatchEvent(new CustomEvent('mindar-compiler-ready'));
        `;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      if (!Compiler) throw new Error('MindAR Compiler not found');

      // Load the scanner image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl!;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')!.drawImage(img, 0, 0);

      const compiler = new Compiler();
      await compiler.compileImageTargets([canvas], (p: number) => {
        setProgress(Math.round(p));
      });

      const buffer: ArrayBuffer = await compiler.exportData();

      // Upload to backend
      setStatus('uploading');
      const formData = new FormData();
      formData.append('mindFile', new Blob([buffer], { type: 'application/octet-stream' }), 'target.mind');

      await api.post(`/ar/target/${orderId}/upload-mind`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus('done');

      // Redirect to order confirmation after 2s
      setTimeout(() => {
        router.push(`/order-confirmation?orderId=${orderId}`);
      }, 2000);
    } catch (err: any) {
      console.error('AR compilation failed:', err);
      setError(err.message || 'Compilation failed');
      setStatus('error');
      // Still redirect on error — AR can be compiled later by admin
      setTimeout(() => {
        router.push(`/order-confirmation?orderId=${orderId}`);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#1d1c1c] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm w-full"
      >
        <div className="w-20 h-20 bg-[#FEF3C7] rounded-3xl flex items-center justify-center mx-auto mb-6">
          {status === 'done' ? (
            <CheckCircle className="w-10 h-10 text-green-500" />
          ) : status === 'error' ? (
            <AlertCircle className="w-10 h-10 text-red-400" />
          ) : (
            <Sparkles className="w-10 h-10 text-[#F5A900] animate-pulse" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {status === 'done' ? 'AR Ready!' : status === 'error' ? 'Almost there...' : 'Preparing Your AR Gift'}
        </h1>

        <p className="text-[#969696] text-sm mb-8">
          {status === 'compiling' && 'Compiling AR target image...'}
          {status === 'uploading' && 'Uploading AR data...'}
          {status === 'done' && 'Your AR experience is ready. Redirecting...'}
          {status === 'error' && 'Redirecting to your order...'}
          {status === 'loading' && 'Initializing...'}
        </p>

        {(status === 'compiling' || status === 'uploading') && (
          <div className="w-full bg-[#2a2a2a] rounded-full h-2 mb-4">
            <motion.div
              className="h-2 bg-[#F5A900] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: status === 'uploading' ? '100%' : `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        )}

        {status === 'compiling' && (
          <p className="text-[#F5A900] text-sm font-mono">{progress}%</p>
        )}
      </motion.div>
    </div>
  );
}

export default function PrepareARPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1d1c1c] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F5A900] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PrepareARContent />
    </Suspense>
  );
}
