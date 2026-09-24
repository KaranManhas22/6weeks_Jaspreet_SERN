'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function GuestCheckout() {
  const router = useRouter();
  const { fetchUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<any[]>('/api/universities').then(res => {
      setUniversities(res || []);
      if (res && res.length > 0) setUniversityId(res[0].id);
    });
  }, []);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.post<any>('/api/auth/guest', { name, phone, universityId });
      localStorage.setItem('token', data.token);
      await fetchUser();
      router.push('/shop');
    } catch (err: any) {
      setError(err.message || 'Failed to start guest session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
        <h1 className="text-2xl font-black mb-2 dark:text-white">Guest Checkout</h1>
        <p className="text-gray-500 mb-6 text-sm">No account needed. Just your name and phone number to track your order.</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-500 p-4 rounded-xl text-sm mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleGuestSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-orange-500/20" placeholder="e.g. John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-orange-500/20" placeholder="e.g. 9876543210" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Campus</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select required value={universityId} onChange={e => setUniversityId(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl py-3 pl-12 pr-4 appearance-none focus:ring-2 focus:ring-orange-500/20">
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold flex justify-center disabled:opacity-50 transition-all">
            {loading ? 'Starting...' : 'Continue to Menu'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium">
          <Link href="/login" className="text-gray-500 hover:text-orange-500 flex items-center justify-center gap-1 transition-all">
            I actually have an account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
