import { Suspense } from 'react';
import CheckoutSuccessClient from './CheckoutSuccessClient';

export const metadata = {
  title: 'Checkout Success - LXNUYYHYI',
};

function SuccessPageInner({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#C8956C]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-[#C8956C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#6B6B6B]">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessClient searchParams={searchParams} />
    </Suspense>
  );
}

export default function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <SuccessPageInner searchParams={searchParams} />;
}
