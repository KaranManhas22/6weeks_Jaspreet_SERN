'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  MessageSquare, 
  Search, 
  SlidersHorizontal, 
  ThumbsUp, 
  CheckCircle2, 
  UtensilsCrossed,
  Store,
  Calendar,
  Sparkles,
  Loader2,
  TrendingUp,
  Award
} from 'lucide-react';
import { api, getToken, decodeToken } from '@/lib/api';

interface Review {
  id: string;
  studentId: string;
  canteenId?: string;
  foodItemId?: string;
  orderId?: string;
  rating: number;
  comment: string | null;
  type: string;
  createdAt: string;
  studentName: string;
  studentPic?: string;
  foodItemName?: string | null;
  foodItemImage?: string | null;
}

interface ReviewsResponse {
  reviews: Review[];
  summary: {
    total: number;
    average: number;
  };
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState({ total: 0, average: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'FoodItem' | 'Canteen'>('All');
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');

  useEffect(() => {
    async function loadReviews() {
      try {
        const token = getToken();
        let vendorId = '';
        if (token) {
          const payload = decodeToken<{ sub?: string }>(token);
          if (payload?.sub) vendorId = payload.sub;
        }

        const endpoint = vendorId ? `/api/reviews?canteenId=${vendorId}` : '/api/reviews';
        const res = await api.get<ReviewsResponse>(endpoint);
        setReviews(res.reviews || []);
        setSummary(res.summary || { total: res.reviews?.length || 0, average: 0 });
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadReviews();
  }, []);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (filterType !== 'All' && r.type !== filterType) return false;
      if (ratingFilter !== 'All' && r.rating !== ratingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.studentName?.toLowerCase().includes(q);
        const matchesComment = r.comment?.toLowerCase().includes(q);
        const matchesItem = r.foodItemName?.toLowerCase().includes(q);
        if (!matchesName && !matchesComment && !matchesItem) return false;
      }
      return true;
    });
  }, [reviews, filterType, ratingFilter, searchQuery]);

  // Star breakdown calculation
  const starBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* ── TOP HEADER SECTION ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161B22] p-6 rounded-3xl border border-[#F0E6D8] dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Customer Reviews &amp; Feedback
            </h1>
            <span className="text-xs font-black px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              {reviews.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Ratings and authentic feedback from Sant Baba Bhag Singh University students
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Verified Campus Orders</span>
          </div>
        </div>
      </div>

      {/* ── RATING SUMMARY HERO CARD ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Col: Overall Score */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-orange-500/15">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Overall Campus Rating</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-black tracking-tight">{summary.average.toFixed(1)}</span>
              <span className="text-xl font-bold opacity-80">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(summary.average)
                      ? 'fill-white text-white'
                      : 'text-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs font-bold">
            <span>Based on {summary.total} student reviews</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> 98% Positive
            </span>
          </div>
        </div>

        {/* Right 2 Cols: Star Breakdown Bars */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161B22] rounded-3xl p-6 sm:p-8 border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <h3 className="text-base font-black text-gray-900 dark:text-white mb-4">Rating Breakdown</h3>
          
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starBreakdown[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-14 font-extrabold text-gray-700 dark:text-gray-300">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold text-gray-400 text-[11px]">{pct}%</span>
                  <span className="w-12 text-right font-black text-gray-900 dark:text-white text-[11px]">({count})</span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>Student reviews help boost canteen visibility in campus search.</span>
            <span className="font-bold text-orange-500 flex items-center gap-1">
              <Award className="w-4 h-4" /> Top Quality
            </span>
          </div>
        </div>

      </div>

      {/* ── FILTER & SEARCH TOOLBAR ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161B22] p-4 rounded-3xl border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by dish or student..."
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Review Type */}
          {(['All', 'FoodItem', 'Canteen'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                filterType === t
                  ? 'bg-[#E65100] text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {t === 'All' ? 'All Reviews' : t === 'FoodItem' ? 'Dish Reviews' : 'Canteen Service'}
            </button>
          ))}

          {/* Star Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
            className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="All">All Stars</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>
        </div>
      </div>

      {/* ── REVIEWS GRID ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#161B22] rounded-3xl border border-[#F0E6D8] dark:border-gray-800">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h3 className="text-base font-black text-gray-900 dark:text-white">No reviews match your filters</h3>
            <p className="text-xs text-gray-400 mt-1">Try clearing your search query or selecting &quot;All Reviews&quot;.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-[#161B22] rounded-3xl p-5 border border-[#F0E6D8] dark:border-gray-800/80 shadow-xs hover:border-[#E65100]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Student & Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black flex items-center justify-center shrink-0">
                      {rev.studentName ? rev.studentName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {rev.studentName}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium block">
                        Sant Baba Bhag Singh Student
                      </span>
                    </div>
                  </div>

                  {/* Stars Pill */}
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 rounded-xl">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">{rev.rating}.0</span>
                  </div>
                </div>

                {/* Food Item Tag if applicable */}
                {rev.foodItemName && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#E65100]/5 dark:bg-[#E65100]/10 border border-orange-500/15 text-xs">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="font-extrabold text-gray-900 dark:text-white truncate">
                      {rev.foodItemName}
                    </span>
                  </div>
                )}

                {/* Comment Body */}
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Card Footer: Date & Verified Order Badge */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                <span>{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
