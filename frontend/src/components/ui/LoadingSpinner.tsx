'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  fullPage?: boolean;
  label?: string;
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
  xl: 'w-16 h-16 border-4',
};

const colorMap = {
  primary: 'border-[#fde68a] border-t-[#F5A900]',
  white: 'border-white/30 border-t-white',
  gray: 'border-gray-200 border-t-gray-600',
};

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  fullPage = false,
  label,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`rounded-full ${sizeMap[size]} ${colorMap[color]} animate-spin`}
      />
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-sm font-medium ${color === 'white' ? 'text-white/80' : 'text-gray-500'}`}
        >
          {label}
        </motion.p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" />
    </div>
  );
}
