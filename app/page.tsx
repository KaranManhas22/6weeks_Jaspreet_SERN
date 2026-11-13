'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  UtensilsCrossed, 
  Flame, 
  Clock, 
  Heart, 
  ArrowRight, 
  CalendarClock, 
  Sparkles, 
  Store, 
  CheckCircle2, 
  Menu, 
  X, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useBrand } from '@/context/BrandContext';

interface SampleDish {
  id: string;
  name: string;
  category: string;
  prepTime: string;
  price: number;
  imageUrl: string;
  canteen: string;
  isVeg: boolean;
}

const SAMPLE_DISHES: SampleDish[] = [
  {
    id: '1',
    name: 'Spicy Crispy Paneer Burger with Fries',
    category: 'Snack & Fast Food',
    prepTime: '15 Mins',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    canteen: 'Central Canteen',
    isVeg: true,
  },
  {
    id: '2',
    name: 'Authentic Amritsari Chole Bhature',
    category: 'North Indian Meal',
    prepTime: '20 Mins',
    price: 70,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80',
    canteen: 'Punjabi Zaika',
    isVeg: true,
  },
  {
    id: '3',
    name: 'Butter Tossed Aloo Pyaz Paratha',
    category: 'Breakfast Special',
    prepTime: '12 Mins',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80',
    canteen: 'Hostel 3 Mess',
    isVeg: true,
  },
  {
    id: '4',
    name: 'Fresh Garden Veg Deluxe Thali',
    category: 'Full Thali',
    prepTime: '15 Mins',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    canteen: 'Student Hub Kitchen',
    isVeg: true,
  },
  {
    id: '5',
    name: 'Dum Hydrabadi Veg Biryani Bowl',
    category: 'Biryani Special',
    prepTime: '18 Mins',
    price: 130,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80',
    canteen: 'Biryani Express',
    isVeg: true,
  },
  {
    id: '6',
    name: 'Creamy Mango Lassi & Masala Chai',
    category: 'Cold Drinks & Tea',
    prepTime: '5 Mins',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1571556094541-01beeb958ce7?w=600&q=80',
    canteen: 'Verka Canteen',
    isVeg: true,
  },
];

const CATEGORIES = [
  { name: 'Breakfast', icon: '🥞', count: '14 Dishes', gradient: 'from-amber-50 to-amber-100/70 dark:from-amber-950/30 dark:to-amber-900/20' },
  { name: 'Vegetarian', icon: '🥗', count: '28 Dishes', gradient: 'from-emerald-50 to-emerald-100/70 dark:from-emerald-950/30 dark:to-emerald-900/20' },
  { name: 'Parathas', icon: '🫓', count: '10 Dishes', gradient: 'from-orange-50 to-orange-100/70 dark:from-orange-950/30 dark:to-orange-900/20' },
  { name: 'Thalis & Meals', icon: '🍛', count: '8 Combos', gradient: 'from-red-50 to-red-100/70 dark:from-red-950/30 dark:to-red-900/20' },
  { name: 'Fast Food', icon: '🍔', count: '22 Dishes', gradient: 'from-rose-50 to-rose-100/70 dark:from-rose-950/30 dark:to-rose-900/20' },
  { name: 'Beverages', icon: '🧋', count: '16 Drinks', gradient: 'from-sky-50 to-sky-100/70 dark:from-sky-950/30 dark:to-sky-900/20' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const { brandName } = useBrand();

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F17] text-gray-900 dark:text-white transition-colors duration-300 font-sans">
      
      {/* ── Top Minimalist Navigation (Flowbase Style) ──────────────── */}
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80 transition-colors">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo with stylish period */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white font-mono">
              {brandName}<span className="text-orange-500">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <Link href="/shop" className="hover:text-orange-500 transition-colors">
              Canteens
            </Link>
            <Link href="#menu-special" className="hover:text-orange-500 transition-colors">
              Trending Dishes
            </Link>
            <Link href="#canteen-timings" className="hover:text-orange-500 transition-colors flex items-center gap-1">
              <CalendarClock className="w-4 h-4 text-orange-500" />
              Operating Hours
            </Link>
            <Link href="/about" className="hover:text-orange-500 transition-colors">
              About Us
            </Link>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-black dark:bg-white dark:text-black text-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex flex-col justify-end">
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="font-black text-lg">{brandName}<span className="text-orange-500">.</span></span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4 text-base font-bold">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>Browse Canteens</Link>
              <Link href="#canteen-timings" onClick={() => setMobileMenuOpen(false)}>Canteen Operating Hours</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Story</Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            </div>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-orange-500 text-white font-bold py-3.5 rounded-2xl shadow-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">

        {/* ── 1. SIGNATURE PASTEL ICE-BLUE HERO CARD (Flowbase #E7FAFE) ─ */}
        <section className="relative bg-[#E7FAFE] dark:bg-slate-900/70 rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 lg:p-16 overflow-hidden border border-sky-100 dark:border-slate-800 shadow-xl shadow-sky-500/5">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-14">
            
            {/* Left Content Column */}
            <div className="space-y-6 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-black/5 dark:border-white/5">
                <span className="text-orange-500 text-sm">🔥</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                  Today&apos;s Campus Special
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                Spicy Crispy Paneer Deluxe
              </h1>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                Freshly prepared to order on your campus. Crispy paneer patty topped with fresh slaw, house mint chutney, and spiced fries. 100% direct-to-vendor dining.
              </p>

              {/* Editorial Metadata Tags */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                <span className="bg-black/5 dark:bg-white/10 px-4 py-2 rounded-full flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" /> 15 Minutes
                </span>
                <span className="bg-black/5 dark:bg-white/10 px-4 py-2 rounded-full flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-gray-500" /> Fast Food Special
                </span>
              </div>

              {/* Author & Action Pill */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                    CC
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Central Canteen</h4>
                    <span className="text-xs text-gray-500">SBBS University Campus</span>
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="bg-black dark:bg-white dark:text-black text-white hover:bg-neutral-800 dark:hover:bg-neutral-200 font-bold text-xs sm:text-sm px-7 py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
                >
                  Order Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Food Plate Hero Graphic */}
            <div className="relative w-full lg:w-1/2 flex items-center justify-center">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                <img 
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" 
                  alt="Today Special Dish"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                />
              </div>

              {/* Floating Circular Seal Badge */}
              <div className="absolute top-2 left-4 sm:left-10 w-24 h-24 bg-black text-white rounded-full flex flex-col items-center justify-center text-center p-2 shadow-2xl rotate-12 border-2 border-white/20">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">★ 100% ★</span>
                <span className="text-[10px] font-black uppercase leading-tight mt-0.5">CAMPUS<br/>FRESH</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── 2. CATEGORIES ROW WITH PASTEL GRADIENTS ─────────────────── */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Categories
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Explore what your university canteens are serving today</p>
            </div>

            <Link
              href="/shop"
              className="bg-[#E7FAFE] hover:bg-[#d8f5fc] text-gray-900 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              View All Categories
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href="/shop"
                className={`bg-gradient-to-b ${cat.gradient} p-6 rounded-3xl flex flex-col items-center text-center space-y-2 border border-black/5 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {cat.name}
                </h3>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 3. SIMPLE AND TASTY DISHES (3-Column Grid + Green Tile) ─── */}
        <section id="menu-special" className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Simple and tasty campus recipes
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
              Made to order by canteen chefs. Delivered directly to your hostel gate, department block, or campus lawn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SAMPLE_DISHES.slice(0, 5).map((dish) => (
              <div
                key={dish.id}
                className="bg-white dark:bg-gray-900/80 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  {/* Food Photo Container */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={dish.imageUrl} 
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />

                    {/* Bookmark Heart Pill */}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(dish.id)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-md"
                      title="Favorite dish"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          bookmarked[dish.id] ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`} 
                      />
                    </button>
                  </div>

                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-1 mb-1">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{dish.canteen}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-semibold text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> {dish.prepTime}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-orange-600 dark:text-orange-400 text-base">
                      ₹{dish.price}
                    </span>
                    <Link
                      href="/shop"
                      className="bg-black dark:bg-white dark:text-black text-white hover:bg-neutral-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                    >
                      Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Signature Flowbase Organic Green Value Card */}
            <div className="bg-[#1E3A2F] rounded-3xl p-8 text-white flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
              
              <div className="space-y-2 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  ★ HEALTHY CAMPUS LIVING ★
                </span>
                <h3 className="text-2xl font-black leading-tight tracking-tight">
                  Don&apos;t forget to eat healthy food
                </h3>
              </div>

              <div className="my-6 relative z-10 w-36 h-36 rounded-full overflow-hidden shadow-2xl border-2 border-emerald-400/30">
                <img 
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" 
                  alt="Healthy Bowl" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 relative z-10">
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Clean cooking, certified ingredients, and direct canteen pricing.
                </p>
                <span className="text-xs font-mono font-bold text-emerald-300 block">
                  www.foodzie.store
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. CANTEEN TIMINGS & PRE-SCHEDULE FEATURE SECTION ───────── */}
        <section id="canteen-timings" className="bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent border border-orange-200/60 dark:border-gray-800 rounded-[36px] p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Description Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                <CalendarClock className="w-4 h-4" />
                Canteen Operating Hours & Pre-Scheduling
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                Canteens aren&apos;t open 24/7. <br />
                <span className="text-orange-500">Pre-schedule your meals during off-time!</span>
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                Each campus canteen sets its daily opening and closing hours, weekly off-days, and upcoming holiday schedules. When canteens are closed, you can build your order and pre-schedule it so it arrives as soon as the kitchen fires up.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-lg">🟢</span>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">Live Open / Closed</h4>
                  <p className="text-[11px] text-gray-500">Know instantly before placing an order.</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-lg">⏰</span>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">Pre-Schedule Orders</h4>
                  <p className="text-[11px] text-gray-500">Order at midnight for 9:00 AM breakfast.</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-lg">📅</span>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">Holiday Advance Notice</h4>
                  <p className="text-[11px] text-gray-500">Vendors log festivals & exam closures.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  Browse Open Campus Canteens <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Schedule Preview Card */}
            <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Store className="w-5 h-5 text-orange-500" />
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white">Sant Baba Bhag Singh Canteen</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  🟢 Open Now
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { day: 'Monday', hours: '08:00 — 21:00', status: 'Open' },
                  { day: 'Tuesday', hours: '08:00 — 21:00', status: 'Open' },
                  { day: 'Wednesday', hours: '08:00 — 21:00', status: 'Open' },
                  { day: 'Thursday', hours: '08:00 — 21:00', status: 'Open' },
                  { day: 'Friday', hours: '08:00 — 21:00', status: 'Open' },
                  { day: 'Saturday', hours: '09:00 — 19:00', status: 'Open' },
                  { day: 'Sunday', hours: 'Closed (Weekly Off)', status: 'Closed' },
                ].map((row) => (
                  <div key={row.day} className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{row.day}</span>
                    <span className={`font-mono text-[11px] font-bold ${row.status === 'Closed' ? 'text-rose-500' : 'text-gray-500'}`}>
                      {row.hours}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                💡 Canteens can edit their weekly hours and post advance holidays anytime in the vendor dashboard.
              </div>
            </div>

          </div>
        </section>

        {/* ── 5. CHEF & VALUE BANNER ("Everyone can be a chef...") ─────── */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[36px] p-8 sm:p-12 overflow-hidden shadow-sm flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-lg text-left">
            <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Campus Merchants & Student Riders
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Direct campus dining with zero middleman commissions.
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              Unlike commercial delivery aggregators who take 30% from small cooks, {brandName} connects students directly with canteen vendors through UPI. Transparent pricing, hot food, and flexible part-time earnings for campus riders.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/signup?role=Vendor"
                className="bg-black dark:bg-white dark:text-black text-white hover:bg-neutral-800 text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-md active:scale-95"
              >
                Register Your Canteen
              </Link>
              <Link
                href="/shop"
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all"
              >
                Find Canteens
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 aspect-video rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md">
            <img 
              src="/campus_food_menu.jpg" 
              alt="Campus Canteen Cooking" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
            />
          </div>
        </section>

      </main>

      {/* ── 6. CLEAN MINIMALIST EDITORIAL FOOTER ───────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pt-16 pb-12 mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-4 text-left">
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white font-mono">
              {brandName}<span className="text-orange-500">.</span>
            </span>
            <p className="text-xs text-gray-500 leading-relaxed">
              The direct campus food delivery network. Enjoy fresh canteen dishes, transparent prices, and smart pre-scheduled delivery.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-gray-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Serving University Campuses in Punjab & India
            </div>
          </div>

          <div className="text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Navigation</h4>
            <ul className="space-y-2 text-xs font-bold text-gray-600 dark:text-gray-400">
              <li><Link href="/shop" className="hover:text-orange-500 transition-colors">Explore Canteens</Link></li>
              <li><Link href="#canteen-timings" className="hover:text-orange-500 transition-colors">Canteen Operating Hours</Link></li>
              <li><Link href="/about" className="hover:text-orange-500 transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-orange-500 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div className="text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Portals & Roles</h4>
            <ul className="space-y-2 text-xs font-bold text-gray-600 dark:text-gray-400">
              <li><Link href="/signup?role=Foodie" className="hover:text-orange-500 transition-colors">Student Foodie Portal</Link></li>
              <li><Link href="/signup?role=Vendor" className="hover:text-orange-500 transition-colors">Canteen Merchant Portal</Link></li>
              <li><Link href="/signup?role=Delivery" className="hover:text-orange-500 transition-colors">Campus Delivery Rider</Link></li>
              <li><Link href="/login" className="hover:text-orange-500 transition-colors">Staff Login</Link></li>
            </ul>
          </div>

          <div className="text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Legal & Terms</h4>
            <ul className="space-y-2 text-xs font-bold text-gray-600 dark:text-gray-400">
              <li><Link href="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refunds" className="hover:text-orange-500 transition-colors">Cancellation & Refund Policy</Link></li>
              <li><Link href="/rider-code" className="hover:text-orange-500 transition-colors">Rider Code of Conduct</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {brandName}. Crafted with ❤️ for college campus dining.</p>
          <p>Direct Online UPI Pre-Paid Orders Only.</p>
        </div>
      </footer>

    </div>
  );
}
