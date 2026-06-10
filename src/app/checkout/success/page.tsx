import Link from 'next/link';
import CheckoutSuccessClient from './CheckoutSuccessClient';

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-4">Invalid Session</h1>
            <Link href="/" className="text-[#C8956C] hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return <CheckoutSuccessClient token={token} />;
}
