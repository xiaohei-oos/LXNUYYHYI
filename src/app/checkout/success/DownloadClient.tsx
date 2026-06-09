'use client';

import { useState } from 'react';

interface DownloadClientProps {
  downloadToken: string;
  categoryName: string;
}

export default function DownloadClient({ downloadToken, categoryName }: DownloadClientProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/download/${downloadToken}`);
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Download failed');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${categoryName.replace(/\s+/g, '-').toLowerCase()}-vision-board-pack.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="w-full px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {downloading ? 'Preparing Download...' : 'Download ZIP Pack'}
    </button>
  );
}
