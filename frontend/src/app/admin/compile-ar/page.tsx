'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Play } from 'lucide-react';
import api from '@/lib/api';

// Same CDN URL used by the official MindAR compiler tool docs (v1.1.5, IIFE build)
const MINDAR_CDN = 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.1.5/dist/mindar-image.prod.js';

interface AREntry {
  id: string;
  scannerImg: string;
  mindUrl: string;
  campaignName: string;
}

function loadMindARCompiler(): Promise<any> {
  return new Promise((resolve, reject) => {
    const getCompiler = () => (window as any).MINDAR?.IMAGE?.Compiler;
    if (getCompiler()) return resolve(getCompiler());

    const script = document.createElement('script');
    script.src = MINDAR_CDN;
    script.onload = () => {
      const poll = () => {
        const C = getCompiler();
        if (C) resolve(C);
        else setTimeout(poll, 100);
      };
      poll();
    };
    script.onerror = () => reject(new Error('Failed to load MindAR script'));
    document.head.appendChild(script);
  });
}

export default function CompileARPage() {
  const [entries, setEntries] = useState<AREntry[]>([]);
  const [compiling, setCompiling] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, 'done' | 'error'>>({});

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data } = await api.get('/ar/data.json');
    setEntries(data);
  };

  const compile = async (entry: AREntry) => {
    setCompiling(entry.id);
    setProgress(0);

    try {
      const Compiler = await loadMindARCompiler();

      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = entry.scannerImg;
      });

      const compiler = new Compiler();
      await compiler.compileImageTargets([img], (p: number) => setProgress(Math.round(p)));
      const buffer: ArrayBuffer = await compiler.exportData();

      const formData = new FormData();
      formData.append('mindFile', new Blob([buffer], { type: 'application/octet-stream' }), 'target.mind');
      await api.post(`/ar/target/${entry.id}/upload-mind`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResults((r) => ({ ...r, [entry.id]: 'done' }));
      fetchEntries();
    } catch (e) {
      console.error(e);
      setResults((r) => ({ ...r, [entry.id]: 'error' }));
    } finally {
      setCompiling(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Compile AR Mind Files</h1>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              {entry.scannerImg && (
                <img src={entry.scannerImg} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{entry.id}</p>
                <p className="text-gray-500 text-sm truncate">{entry.campaignName}</p>
                <p className="text-xs mt-1">
                  {entry.mindUrl
                    ? <span className="text-green-600 font-medium">✅ Mind file ready</span>
                    : <span className="text-amber-600 font-medium">⚠️ No mind file</span>
                  }
                </p>
                {compiling === entry.id && (
                  <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 bg-[#F5A900] rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                {results[entry.id] === 'done' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : results[entry.id] === 'error' ? (
                  <AlertCircle className="w-6 h-6 text-red-400" />
                ) : (
                  <button
                    onClick={() => compile(entry)}
                    disabled={!!compiling}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F5A900] text-white rounded-xl text-sm font-medium hover:bg-[#D97706] disabled:opacity-40 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {compiling === entry.id ? `${progress}%` : 'Compile'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
