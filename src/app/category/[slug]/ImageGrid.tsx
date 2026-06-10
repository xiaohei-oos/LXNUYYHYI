'use client';

import { useState, useCallback } from 'react';

interface ImageItem {
  id: string;
  title: string;
  thumbnail_url: string;
  sort_order: number;
}

interface ImageGridProps {
  slug: string;
  initialImages: ImageItem[];
  totalCount: number;
  pageSize?: number;
}

export default function ImageGrid({ slug, initialImages, totalCount, pageSize = 24 }: ImageGridProps) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialImages.length);
  const hasMore = offset < totalCount;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/images?category=${slug}&limit=${pageSize}&offset=${offset}&resolve=true`);
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setImages((prev) => [...prev, ...data.images]);
        setOffset((prev) => prev + data.images.length);
      }
    } catch {
      // Silently fail, user can retry
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, slug, pageSize, offset]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Preview ({totalCount} images)
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-[210/297] rounded-xl overflow-hidden bg-secondary border border-border"
          >
            <img
              src={img.thumbnail_url}
              alt={`Vision board image - ${img.title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              width={400}
              height={566}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-medium truncate">{img.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-card border border-border rounded-full text-foreground font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              `Load More (${images.length}/${totalCount} loaded)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
