'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sparkles } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error || !token || !userParam) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      login(user, token);
      router.replace('/');
    } catch {
      router.replace('/login?error=oauth_failed');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F5A900] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-white animate-pulse" />
        </div>
        <p className="text-gray-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F5A900] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
