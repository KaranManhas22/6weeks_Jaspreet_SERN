'use client';

import Link from 'next/link';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function RefundsPage() {
  const { brandName } = useBrand();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden font-sans transition-colors duration-300 relative">
      <div className="absolute inset-0 bg-[url('/foodzie_bg_pattern.jpg')] bg-repeat opacity-[0.03] dark:opacity-[0.08] pointer-events-none z-0" />
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-orange-600/5 dark:bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-orange-500/5 dark:bg-orange-500/8 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">{brandName}</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black mb-8">Refund & Cancellations</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="font-medium text-lg">Last Updated: July 2026</p>
          
          <h2 className="text-2xl font-bold mt-8">1. Order Cancellations</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Orders can only be cancelled before they are accepted by the canteen. Once a canteen has begun preparing your food, the order cannot be cancelled through the app.
          </p>

          <h2 className="text-2xl font-bold mt-8">2. Refunds for Failed Orders</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Because payments are processed directly to the canteen's UPI ID, {brandName} does not hold your funds. If an order fails or is rejected after payment, the canteen is responsible for initiating the refund to your original payment method. 
          </p>

          <h2 className="text-2xl font-bold mt-8">3. Quality Disputes</h2>
          <p className="text-gray-600 dark:text-gray-400">
            If you receive incorrect or unsatisfactory food, please contact the canteen directly via the contact details provided in your order receipt. {brandName} is not liable for food quality or preparation errors.
          </p>
        </div>
      </main>
    </div>
  );
}
