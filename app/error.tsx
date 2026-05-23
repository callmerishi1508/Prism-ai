'use client';

import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-gray-200 p-4">
      <div className="bg-white/5 border border-red-500/30 p-8 rounded-2xl backdrop-blur-xl max-w-md text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong!</h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          The PRISM AI engine encountered an unexpected error while processing your request. Our team has been notified.
        </p>
        <button
          onClick={() => reset()}
          className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2.5 rounded-lg transition-colors border border-white/10"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
