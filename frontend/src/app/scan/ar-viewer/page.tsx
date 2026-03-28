'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// This page redirects to the standalone ar-viewer.html in /public
// which loads MindAR directly without Next.js overhead
export default function ARViewerRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const target = searchParams.get('target') || '';
    const video = searchParams.get('video') || '';
    const params = new URLSearchParams({ target, video });
    window.location.replace(`/ar-viewer.html?${params.toString()}`);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">Loading AR Experience...</p>
        <p className="text-white/50 text-sm mt-2">Please allow camera access</p>
      </div>
    </div>
  );
}
