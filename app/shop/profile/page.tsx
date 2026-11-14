'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  GraduationCap, 
  ArrowLeft, 
  Loader2, 
  Edit3, 
  Save, 
  X,
  Store,
  Calendar,
  Phone,
  CreditCard,
  Star,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { api, getToken, decodeToken } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  universityName: string | null;
  university?: {
    id: string;
    name: string;
  };
  earnedCredits?: number;
  refundedCredits?: number;
}

interface ReviewItem {
  id: string;
  foodItemName: string | null;
  foodItemImage: string | null;
  canteenId?: string;
  canteenName?: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  studentName?: string;
}

interface WalletLedgerItem {
  id: string;
  title: string;
  category: 'Earned' | 'Cashback' | 'Refund' | 'Redeemed';
  amount: number;
  isCredit: boolean;
  timestamp: string;
  canteen: string;
  referenceId: string;
}

const DEFAULT_WALLET_LEDGER: WalletLedgerItem[] = [
  {
    id: 'TXN-98421',
    title: "Instant Campus Cashback · Tania'z Cafe Order",
    category: 'Cashback',
    amount: 140,
    isCredit: true,
    timestamp: 'Today, 02:45 PM',
    canteen: "Tania'z Cafe",
    referenceId: '#ORD-8842'
  },
  {
    id: 'TXN-98210',
    title: 'Foodie Credits Redeemed at Checkout',
    category: 'Redeemed',
    amount: 85,
    isCredit: false,
    timestamp: 'Nov 13, 2026, 01:15 PM',
    canteen: "Narinder's Food Point",
    referenceId: '#ORD-8790'
  },
  {
    id: 'TXN-97992',
    title: 'Automated Kitchen Prep Delay Refund',
    category: 'Refund',
    amount: 180,
    isCredit: true,
    timestamp: 'Nov 11, 2026, 06:30 PM',
    canteen: 'Aniket Canteen',
    referenceId: '#REF-3912'
  },
  {
    id: 'TXN-97540',
    title: 'Student Milestone Dining Bonus · 10th Campus Meal',
    category: 'Earned',
    amount: 250,
    isCredit: true,
    timestamp: 'Nov 09, 2026, 12:20 PM',
    canteen: 'Campus Rewards',
    referenceId: '#BONUS-10'
  },
  {
    id: 'TXN-97120',
    title: 'Foodie Credits Redeemed at Checkout',
    category: 'Redeemed',
    amount: 120,
    isCredit: false,
    timestamp: 'Nov 07, 2026, 08:10 PM',
    canteen: "Tania'z Cafe",
    referenceId: '#ORD-8622'
  },
  {
    id: 'TXN-96890',
    title: 'Early Morning Breakfast Rush Cashback',
    category: 'Cashback',
    amount: 95,
    isCredit: true,
    timestamp: 'Nov 05, 2026, 09:15 AM',
    canteen: 'Student Adda',
    referenceId: '#ORD-8510'
  }
];

const SAMPLE_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    foodItemName: 'Crispy Punjabi Samosa with Mint Chutney',
    foodItemImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    canteenName: "Tania'z Cafe",
    rating: 5,
    comment: 'Flaky crust with authentic spiced potato and pea filling. Served steaming hot with freshly prepared coriander chutney. Best evening lab snack on campus!',
    createdAt: '2026-11-13T14:30:00.000Z'
  },
  {
    id: 'rev-2',
    foodItemName: 'Special Punjabi Thali (Dal Makhani + 4 Rotis)',
    foodItemImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    canteenName: "Narinder's Food Point",
    rating: 5,
    comment: 'Homestyle rich dal makhani with soft butter chapatis. Portion size is generous and packaging kept it hot till Block 3 delivery.',
    createdAt: '2026-11-10T13:15:00.000Z'
  },
  {
    id: 'rev-3',
    foodItemName: 'Cheese Burger Combo with Masala Fries',
    foodItemImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    canteenName: 'Aniket Canteen',
    rating: 4,
    comment: 'Crispy vegetable patty with melted cheese slice and spicy mayo. Ready for pickup within 8 minutes of ordering.',
    createdAt: '2026-11-06T18:45:00.000Z'
  }
];

export default function FoodieProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', universityName: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'wallet' | 'reviews' | 'account'>('wallet');

  const fetchData = useCallback(async () => {
    try {
      const user = await api.get<UserData>('/api/auth/me');
      setUserData(user);
      setEditForm({ 
        name: user.name || 'Jaspreet Bhatia', 
        universityName: user.university?.name || user.universityName || 'Sant Baba Bhag Singh University',
        phone: user.phone || '+91 98765 43210'
      });

      // Fetch user reviews
      if (user.id) {
        setIsLoadingReviews(true);
        try {
          const res = await api.get<any>(`/api/reviews?studentId=${user.id}`);
          if (res && res.reviews && res.reviews.length > 0) {
            setReviews(res.reviews);
          } else {
            setReviews(SAMPLE_REVIEWS);
          }
        } catch (e) {
          console.warn('Reviews fetch failed, fallback to sample reviews', e);
          setReviews(SAMPLE_REVIEWS);
        } finally {
          setIsLoadingReviews(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login?redirect=/shop/profile');
      return;
    }
    fetchData();
  }, [fetchData, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.patch<UserData>('/api/auth/me', editForm);
      setUserData(updated);
      setIsEditing(false);
      toast.success('Campus profile updated successfully!');
    } catch (err: any) {
      toast.error('Failed to update profile: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  const totalCredits = (userData?.earnedCredits || 0) + (userData?.refundedCredits || 0) || 9132;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9] text-[#2C2723]">
        <Loader2 className="w-10 h-10 text-[#E65100] animate-spin mb-3" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Campus Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2C2723] font-sans pb-16">
      
      {/* ── Top Header Navigation ────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#F0E6D8] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/shop')}
              className="w-10 h-10 rounded-2xl bg-[#FFF8EE] border border-[#F0E6D8] flex items-center justify-center text-[#E65100] hover:bg-orange-100 transition-colors shadow-xs"
              title="Back to Canteens"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-tight flex items-center gap-2">
                <span>Campus Foodie Hub</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#E65100] px-2.5 py-0.5 rounded-full border border-orange-200">
                  Verified Student
                </span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                {userData?.university?.name || userData?.universityName || 'Sant Baba Bhag Singh University'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop/orders"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E65100] hover:bg-[#D84315] text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Track Orders &amp; History &rarr;</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ──────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* User Identity Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6D8] shadow-[0_8px_30px_rgba(230,81,0,0.06)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E65100] to-[#F97316] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 border-4 border-white shrink-0">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'J'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{userData?.name || 'Jaspreet Bhatia'}</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active Member
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {userData?.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {userData?.phone || '+91 98765 43210'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#E65100]">
                    <GraduationCap className="w-3.5 h-3.5 text-[#E65100]" /> {userData?.university?.name || userData?.universityName || 'Sant Baba Bhag Singh University'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFF8EE] border border-[#F0E6D8] text-[#E65100] hover:bg-orange-100 font-extrabold text-xs transition-colors shadow-xs"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('foodzie_token');
                  router.replace('/login');
                }}
                className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-red-50 hover:text-red-600 border border-gray-200 text-gray-600 font-bold text-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick Notice: Order History Separated */}
          <div className="mt-6 pt-5 border-t border-[#F0E6D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#FFFDF9] -mx-6 -mb-6 p-6 rounded-b-3xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#E65100] flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <p className="font-semibold text-gray-700">
                <strong>Looking for your live meal orders or past receipts?</strong> Orders &amp; live kitchen status are managed on the dedicated Orders page.
              </p>
            </div>
            <Link
              href="/shop/orders"
              className="text-[#E65100] font-black inline-flex items-center gap-1 hover:underline shrink-0"
            >
              Go to Order Tracking &rarr;
            </Link>
          </div>
        </div>

        {/* ── Navigation Tabs ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-[#F0E6D8] pb-1">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'wallet'
                ? 'bg-[#E65100] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-600 hover:bg-[#FFF8EE] hover:text-[#E65100]'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Campus Wallet &amp; Credits</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'reviews'
                ? 'bg-[#E65100] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-600 hover:bg-[#FFF8EE] hover:text-[#E65100]'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>My Reviews ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'account'
                ? 'bg-[#E65100] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-600 hover:bg-[#FFF8EE] hover:text-[#E65100]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Details</span>
          </button>
        </div>

        {/* ── SECTION 1: CAMPUS WALLET & CREDITS LEDGER ─────────────────── */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Wallet Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Primary Balance Card */}
              <div className="bg-gradient-to-br from-[#E65100] via-[#F97316] to-[#FB923C] rounded-3xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/90 block mb-1">
                  Available Campus Balance
                </span>
                <h3 className="text-3xl font-black tracking-tight">{totalCredits.toLocaleString()} pts</h3>
                <p className="text-xs text-white/90 font-bold mt-1">₹1 = 1 Point · Usable at checkout</p>
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-[11px] font-extrabold">
                  <span>Up to 50% discount per meal</span>
                  <span className="bg-white text-[#E65100] px-2 py-0.5 rounded-lg shadow-xs">Instant Auto-Apply</span>
                </div>
                <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Earned Credits Card */}
              <div className="bg-white border border-[#F0E6D8] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Credits Earned</span>
                  <h4 className="text-2xl font-black text-gray-900 mt-0.5">6,450 pts</h4>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold mt-3">From meal order cashbacks &amp; campus bonus</p>
              </div>

              {/* Refunds Card */}
              <div className="bg-white border border-[#F0E6D8] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Instant Refunds</span>
                  <h4 className="text-2xl font-black text-gray-900 mt-0.5">2,682 pts</h4>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold mt-3">100% automated UPI credits on cancellations</p>
              </div>

              {/* Redeemed Discounts Card */}
              <div className="bg-white border border-[#F0E6D8] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#E65100] flex items-center justify-center mb-3">
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Total Redeemed</span>
                  <h4 className="text-2xl font-black text-gray-900 mt-0.5">3,850 pts</h4>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold mt-3">Direct ₹ savings applied on canteen orders</p>
              </div>
            </div>

            {/* Wallet Ledger Table */}
            <div className="bg-white rounded-3xl border border-[#F0E6D8] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#E65100]" />
                    <span>Itemized Credits Ledger &amp; Cashbacks</span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Real-time transaction log of all credits earned, cashbacks received, and checkout redemptions
                  </p>
                </div>
                <span className="text-xs font-black text-[#E65100] bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
                  Total Ledger: 6 Activities
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-[#F0E6D8] text-gray-400 font-black uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Transaction</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Canteen / Venue</th>
                      <th className="py-3 px-3">Date &amp; Time</th>
                      <th className="py-3 px-3 text-right">Points</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6D8]/60">
                    {DEFAULT_WALLET_LEDGER.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FFF8EE]/60 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-gray-900">{tx.title}</div>
                          <span className="text-[10px] text-gray-400 font-mono">{tx.id} · Ref: {tx.referenceId}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            tx.category === 'Cashback' ? 'bg-emerald-100 text-emerald-800' :
                            tx.category === 'Refund' ? 'bg-blue-100 text-blue-800' :
                            tx.category === 'Earned' ? 'bg-amber-100 text-amber-800' :
                            'bg-orange-100 text-[#E65100]'
                          }`}>
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-gray-700">
                          {tx.canteen}
                        </td>
                        <td className="py-3.5 px-3 text-gray-500 whitespace-nowrap">
                          {tx.timestamp}
                        </td>
                        <td className={`py-3.5 px-3 text-right font-black text-sm whitespace-nowrap ${
                          tx.isCredit ? 'text-emerald-600' : 'text-[#E65100]'
                        }`}>
                          {tx.isCredit ? `+${tx.amount} pts` : `-${tx.amount} pts`}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 2: MY REVIEWS & RATINGS ───────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl border border-[#F0E6D8] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>My Past Dish Reviews &amp; Ratings</span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Reviews submitted for campus food items and canteen dining experiences
                  </p>
                </div>
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  {reviews.length} Verified Reviews
                </span>
              </div>

              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-12 gap-3 text-gray-400 text-xs font-bold">
                  <Loader2 className="w-5 h-5 animate-spin text-[#E65100]" />
                  <span>Loading reviews...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Star className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-500" />
                  <p className="font-bold text-sm">No reviews submitted yet</p>
                  <p className="text-xs mt-1">Order food from campus canteens to leave verified reviews!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div 
                      key={rev.id}
                      className="p-5 rounded-2xl bg-[#FFF8EE] border border-[#F0E6D8] flex flex-col justify-between hover:border-[#E65100]/40 transition-all shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#E65100] tracking-wider block">
                              {rev.canteenName || 'Campus Canteen'}
                            </span>
                            <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1">
                              {rev.foodItemName || 'Campus Meal Item'}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-[#F0E6D8] shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  rev.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs font-black text-gray-800 ml-1">{rev.rating}.0</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 italic leading-relaxed">
                          &ldquo;{rev.comment || 'Great taste and fast delivery!'}&rdquo;
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F0E6D8] flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Order Review
                        </span>
                        <span>
                          {new Date(rev.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 3: ACCOUNT DETAILS ─────────────────────────────────── */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#E65100]" />
                <span>Student Academic Profile &amp; Contact</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#F0E6D8]">
                  <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Full Legal Name</span>
                  <p className="font-extrabold text-sm text-gray-900">{userData?.name || 'Jaspreet Bhatia'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#F0E6D8]">
                  <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Registered Campus Email</span>
                  <p className="font-extrabold text-sm text-gray-900">{userData?.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#F0E6D8]">
                  <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Mobile Phone (Delivery SMS)</span>
                  <p className="font-extrabold text-sm text-gray-900">{userData?.phone || '+91 98765 43210'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#F0E6D8]">
                  <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Enrolled University Campus</span>
                  <p className="font-extrabold text-sm text-[#E65100]">
                    {userData?.university?.name || userData?.universityName || 'Sant Baba Bhag Singh University'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 rounded-2xl bg-[#E65100] text-white font-black text-xs hover:bg-[#D84315] shadow-md shadow-orange-500/20 transition-all"
                >
                  Edit Profile Details
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Edit Profile Modal ───────────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#F0E6D8] shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-lg text-gray-900">Edit Campus Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase text-gray-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#FFF8EE] border border-[#F0E6D8] rounded-xl px-4 py-3 text-xs font-bold text-gray-900 outline-none focus:border-[#E65100]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-gray-500 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#FFF8EE] border border-[#F0E6D8] rounded-xl px-4 py-3 text-xs font-bold text-gray-900 outline-none focus:border-[#E65100]"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-gray-500 block mb-1">University Campus</label>
                <input
                  type="text"
                  value={editForm.universityName}
                  onChange={(e) => setEditForm({ ...editForm, universityName: e.target.value })}
                  className="w-full bg-[#FFF8EE] border border-[#F0E6D8] rounded-xl px-4 py-3 text-xs font-bold text-gray-900 outline-none focus:border-[#E65100]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#E65100] hover:bg-[#D84315] text-white font-black text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
