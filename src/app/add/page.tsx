'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AddPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get URL parameters
    const title = searchParams.get('title');
    const url = searchParams.get('url');
    const thumbnail = searchParams.get('thumbnail');

    // Build query string for main page
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (url) params.set('url', url);
    if (thumbnail) params.set('thumbnail', thumbnail);

    // Redirect to main page with parameters
    router.replace(`/?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Redirecting to add bookmark...</p>
      </div>
    </div>
  );
}
