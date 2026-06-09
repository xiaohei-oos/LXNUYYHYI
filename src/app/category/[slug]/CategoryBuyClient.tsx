'use client';

import { useState } from 'react';

interface CategoryBuyClientProps {
  categoryId: string;
  categoryName: string;
  priceCents: number;
}

export default function CategoryBuyClient({ categoryId, categoryName, priceCents }: CategoryBuyClientProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, categoryName, priceCents }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
        setLoading(false);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? 'Redirecting...' : 'Buy & Download'}
    </button>
  );
}
