'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UtensilsCrossed, 
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
  Plus, 
  Phone, 
  Mail, 
  Truck, 
  CreditCard, 
  Tag, 
  Headphones, 
  ChefHat, 
  Leaf, 
  Coffee,
  Globe2,
  Lock,
  UserCheck
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getToken, decodeToken } from '@/lib/api';
import toast from 'react-hot-toast';

interface DishItem {
  id: string;
  name: string;
  desc: string;
  price: string;
  imageUrl: string;
  category: string;
}

const POPULAR_DISHES: DishItem[] = [
  {
    id: '1',
    name: 'Creamy Alfredo Pasta',
    desc: 'Rich and creamy white garlic sauce with button mushrooms, Italian herbs, and parmesan.',
    price: '₹140',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600&q=80',
    category: 'Italian & Pasta',
  },
  {
    id: '2',
    name: 'Grilled Paneer Tikka Steak',
    desc: 'Juicy tandoori spiced cottage cheese steak served with seasoned bell peppers and fresh mint chutney.',
    price: '₹180',
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80',
    category: 'Tandoori Special',
  },
  {
    id: '3',
    name: 'Quinoa & Avocado Salad',
    desc: 'Crisp organic greens, ripe avocado, cherry tomatoes, cucumbers and citrus herb vinaigrette.',
    price: '₹120',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
    category: 'Healthy Greens',
  },
  {
    id: '4',
    name: 'Chocolate Molten Lava Cake',
    desc: 'Warm Belgian dark chocolate cake with a rich molten gooey center and powdered sugar.',
    price: '₹90',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
    category: 'Bakery & Dessert',
  },
];

export default function FoodzieLandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [preOrderDate, setPreOrderDate] = useState('');
  const [mealWindow, setMealWindow] = useState('Lunch Rush (12:30 PM – 2:30 PM)');
  const [deliveryTarget, setDeliveryTarget] = useState('Hostel Room Delivery');

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
      const payload = decodeToken<{ name?: string }>(token);
      if (payload?.name) setUserName(payload.name);
    }
  }, []);

  const handlePreScheduleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please sign in or create an account to view and order from campus canteens!');
      router.push('/login?redirect=/shop');
      return;
    }
    toast.success(`Pre-scheduled for ${mealWindow} (${deliveryTarget})!`);
    router.push('/shop');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-[#0D1117] text-[#2C2723] dark:text-[#E6EDF3] font-sans transition-colors duration-300">
      
      {/* ── TOP UTILITY BAR (Global Universities Network) ───────────────── */}
      <div className="bg-[#FFF8EE] dark:bg-[#161B22] border-b border-[#F0E6D8] dark:border-gray-800 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Left: Global Coverage & Schedule */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe2 className="w-3.5 h-3.5 text-[#E65100]" />
              Serving Colleges & Universities Worldwide
            </span>
            <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#E65100]" />
              Multi-Campus Operating Schedules & 24/7 Pre-Ordering
            </span>
          </div>

          {/* Right: Contact & Theme Toggle */}
          <div className="flex items-center gap-4">
            <a href="tel:+911812711111" className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200 hover:text-[#E65100] transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#E65100]" />
              Support: +91 181 271 1111
            </a>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <ThemeToggle />
          </div>

        </div>
      </div>

      {/* ── MAIN NAVBAR (Foodzie Branding) ─────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#0D1117]/95 backdrop-blur-md border-b border-[#F0E6D8] dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          
          {/* Brand Logo with Chef Hat */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-[#E65100] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#1A1412] dark:text-white flex items-center">
                Foodzie<span className="text-[#E65100]">.</span>
              </span>
              <span className="block text-[9px] font-black tracking-[0.2em] text-[#A66E38] dark:text-orange-400 uppercase -mt-1">
                CAMPUS DINING NETWORK
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-black tracking-wider uppercase text-gray-700 dark:text-gray-300">
            <Link href="/" className="text-[#E65100] border-b-2 border-[#E65100] pb-0.5">
              HOME
            </Link>
            <Link href="/about" className="hover:text-[#E65100] transition-colors">
              ABOUT US
            </Link>
            <Link href="/shop" className="hover:text-[#E65100] transition-colors">
              CANTEENS & MENU
            </Link>
            <Link href="#canteen-timings" className="hover:text-[#E65100] transition-colors">
              OPERATING TIMINGS
            </Link>
            <Link href="/contact" className="hover:text-[#E65100] transition-colors">
              CONTACT
            </Link>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/shop"
                  className="flex items-center gap-2 text-xs font-extrabold text-gray-800 dark:text-gray-200 bg-orange-500/10 px-4 py-2.5 rounded-full"
                >
                  <UserCheck className="w-4 h-4 text-orange-500" />
                  <span>Hi, {userName || 'Foodie'}</span>
                </Link>
                <Link
                  href="/shop"
                  className="bg-[#E65100] hover:bg-[#D84315] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-md shadow-orange-500/25 hover:scale-105 active:scale-95"
                >
                  GO TO CANTEENS
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-extrabold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#E65100] hover:bg-[#D84315] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-md shadow-orange-500/25 hover:scale-105 active:scale-95"
                >
                  SIGN UP FREE
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:hidden flex flex-col justify-end">
          <div className="bg-[#FFFDF9] dark:bg-[#161B22] rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
              <span className="font-serif font-black text-xl">Foodzie<span className="text-[#E65100]">.</span></span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm font-bold">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>Browse Campus Canteens</Link>
              <Link href="#canteen-timings" onClick={() => setMobileMenuOpen(false)}>Operating Timings</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Support</Link>
              {!isLoggedIn && <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>}
            </div>
            <Link
              href={isLoggedIn ? "/shop" : "/signup"}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-[#E65100] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full shadow-lg"
            >
              {isLoggedIn ? "Open Canteens" : "Join Your Campus (Free)"}
            </Link>
          </div>
        </div>
      )}

      {/* ── 1. HERO SECTION (Delicious Food for Every Mood) ───────────── */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:py-20 lg:py-24 border-b border-[#F0E6D8] dark:border-gray-800 bg-gradient-to-b from-[#FFFDF9] via-[#FFF8EE] to-[#FFFDF9] dark:from-[#0D1117] dark:via-[#161B22] dark:to-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
              
              {/* Subtitle */}
              <div className="inline-block">
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#E65100]">
                  GLOBAL CAMPUS FOOD NETWORK
                </span>
              </div>

              {/* Headline with Serif & Italic Accent */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif text-[#1F1713] dark:text-white leading-[1.08] tracking-tight">
                Delicious Food <br />
                for <span className="italic font-serif font-normal text-[#C2410C] dark:text-orange-400">Every Mood</span>
              </h1>

              {/* Subparagraph */}
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl font-medium">
                Connecting students and verified campus dining spots across colleges and universities worldwide. Fresh meals, zero commission markups, and hot delivery right to your university block.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#E65100] hover:bg-[#D84315] text-white text-xs sm:text-sm font-black uppercase tracking-wider px-7 py-4 rounded-full transition-all shadow-xl shadow-orange-500/25 hover:scale-105 active:scale-95"
                >
                  <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
                  EXPLORE CANTEENS
                </Link>

                <Link
                  href="#canteen-timings"
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 text-[#1F1713] dark:text-white border-2 border-[#E65100] text-xs sm:text-sm font-black uppercase tracking-wider px-7 py-3.5 rounded-full transition-all shadow-sm active:scale-95"
                >
                  <CalendarClock className="w-4 h-4 text-[#E65100]" />
                  OPERATING TIMINGS
                </Link>
              </div>

              {/* 3 Key Badges Row */}
              <div className="pt-6 border-t border-[#F0E6D8] dark:border-gray-800 grid grid-cols-3 gap-4 max-w-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight">Fresh</h4>
                    <span className="text-[10px] text-gray-500 font-medium">Ingredients</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight">Expert</h4>
                    <span className="text-[10px] text-gray-500 font-medium">Chefs</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight">Made with</h4>
                    <span className="text-[10px] text-gray-500 font-medium">Love</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Side: Signature Large Food Plate with "30+ Signature Dishes" */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              
              {/* Outer decorative glow */}
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#E65100]/10 blur-3xl pointer-events-none" />

              {/* Hero Circular Dish Presentation */}
              <div className="relative w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-full p-3 bg-white dark:bg-gray-800 shadow-2xl shadow-orange-900/15 border border-[#F0E6D8] dark:border-gray-700">
                <div className="w-full h-full rounded-full overflow-hidden shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80"
                    alt="Signature Gourmet Dish Presentation"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Floating "30+ Signature Dishes" Pill Badge */}
              <div className="absolute top-4 right-2 sm:right-6 bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-xl border border-[#F0E6D8] dark:border-gray-800 flex items-center gap-3 animate-bounce duration-1000">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#E65100] flex items-center justify-center font-black">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-base font-black text-gray-900 dark:text-white leading-tight block">30+</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Signature Dishes</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 2. WELCOME TO FOODZIE (Good Food, Good Life) ──────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#F0E6D8] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Campus Dining Ambience Photo */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                  alt="Cozy Campus Dining Ambience"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Badge: Global Campus Service */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#E65100] text-white p-5 rounded-3xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Globe2 className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <span className="text-xl font-black block leading-none">Global</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 block mt-1">
                    Universities Network
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative & Values */}
            <div className="lg:col-span-7 space-y-6 text-left lg:pl-8">
              
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E65100]">
                WELCOME TO FOODZIE
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#1F1713] dark:text-white leading-tight">
                Good Food, <br />
                <span className="italic font-serif font-normal text-[#C2410C] dark:text-orange-400">Good Life</span>
              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                At Foodzie, we believe great food brings campus communities together. Designed for students, faculty, and canteens across colleges and universities worldwide, our platform makes food ordering instant, affordable, and transparent.
              </p>

              {/* Handwritten Brand Script */}
              <div className="font-serif italic text-2xl text-[#E65100] tracking-wide py-1">
                Foodzie ♡
              </div>

              <div>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-[#1A1412] dark:bg-white dark:text-black text-white hover:bg-[#332A25] text-xs font-black uppercase tracking-wider px-7 py-3.5 rounded-full transition-all"
                >
                  LEARN MORE ABOUT US <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#F0E6D8] dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#E65100] flex items-center justify-center shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white">Quality Ingredients</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Fresh kitchen supplies and hygienic standards.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#E65100] flex items-center justify-center shrink-0">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white">Campus Chefs</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Prepared fresh to order right on your campus.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#E65100] flex items-center justify-center shrink-0">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white">Direct Pricing</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Zero aggregator commissions or surge pricing.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 3. CHEF'S SPECIAL - POPULAR CAMPUS DISHES ──────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#F0E6D8] dark:border-gray-800 bg-[#FFFDF9] dark:bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E65100] block mb-1">
                CHEF&apos;S SPECIAL
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F1713] dark:text-white tracking-tight">
                — Popular Campus Dishes —
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-[#E65100] hover:text-[#C2410C] transition-colors"
            >
              VIEW ALL DISHES <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_DISHES.map((dish) => (
              <div
                key={dish.id}
                className="bg-white dark:bg-[#161B22] rounded-3xl p-5 border border-[#F0E6D8] dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-1">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3">
                    {dish.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0E6D8] dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold">{dish.category}</span>
                    <span className="text-lg font-black text-[#E65100]">
                      {dish.price}
                    </span>
                  </div>

                  <Link
                    href="/shop"
                    className="w-9 h-9 rounded-full bg-[#1A1412] dark:bg-white dark:text-black text-white hover:bg-[#E65100] dark:hover:bg-[#E65100] dark:hover:text-white flex items-center justify-center transition-colors shadow-md"
                    title="Order Now"
                  >
                    <Plus className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. SPECIAL OFFER BANNER & PRE-SCHEDULE FORM ───────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#F0E6D8] dark:border-gray-800 bg-[#FFF8EE] dark:bg-[#161B22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Card: Special Offer Banner (#153226 Dark Forest Green) */}
            <div className="lg:col-span-7 bg-[#153226] text-white rounded-[36px] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="space-y-4 relative z-10">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#A3E635]">
                  STUDENT DISCOUNT
                </span>
                <h3 className="text-3xl sm:text-5xl font-serif font-black leading-tight tracking-tight">
                  Get 20% Off <br />
                  <span className="italic font-normal">On Your Campus Orders</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 max-w-md leading-relaxed">
                  Use coupon code <span className="font-mono font-black text-amber-300">CAMPUS20</span> at checkout to unlock student discounts on all participating college canteens.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 bg-white text-[#153226] hover:bg-emerald-50 text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    ORDER NOW <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Food Photos inside offer banner */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-emerald-800/60 relative z-10">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/20 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80"
                    alt="Fresh Pizza"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/20 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80"
                    alt="Cold Mocktail"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Right Card: Express Campus Pre-Schedule Order Form (Image 0 Layout, Foodzie Logic) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0D1117] rounded-[36px] p-8 sm:p-10 border border-[#F0E6D8] dark:border-gray-800 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#E65100] block mb-1">
                  CAMPUS PRE-ORDERS &amp; ROOM DELIVERY
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 dark:text-white mb-2">
                  Pre-Schedule Your Meal
                </h3>
                <p className="text-xs text-gray-500 mb-6">
                  Skip canteen lines between lectures. Pre-schedule your favorite hot meal for hostel delivery or express counter pickup.
                </p>

                <form onSubmit={handlePreScheduleOrder} className="space-y-4">
                  {/* Delivery Location / Drop-off */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                      Campus Drop-off or Pickup Point
                    </label>
                    <select
                      value={deliveryTarget}
                      onChange={(e) => setDeliveryTarget(e.target.value)}
                      className="w-full bg-[#FFFDF9] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#E65100]"
                    >
                      <option value="Hostel Room Delivery">Hostel Room Delivery (Direct to Block)</option>
                      <option value="Canteen Express Counter Pickup">Canteen Express Counter Pickup</option>
                      <option value="Faculty / Department Building">Faculty / Department Building</option>
                      <option value="Central Library / Student Center">Central Library / Student Center</option>
                    </select>
                  </div>

                  {/* Meal Window & Date Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={preOrderDate}
                        onChange={(e) => setPreOrderDate(e.target.value)}
                        className="w-full bg-[#FFFDF9] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-3 py-3 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#E65100]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                        Meal Window
                      </label>
                      <select
                        value={mealWindow}
                        onChange={(e) => setMealWindow(e.target.value)}
                        className="w-full bg-[#FFFDF9] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-3 py-3 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#E65100]"
                      >
                        <option value="Breakfast Rush (8:30 AM – 10:30 AM)">Breakfast (8:30 – 10:30 AM)</option>
                        <option value="Lunch Rush (12:30 PM – 2:30 PM)">Lunch (12:30 – 2:30 PM)</option>
                        <option value="Evening Snacks (4:30 PM – 6:30 PM)">Evening (4:30 – 6:30 PM)</option>
                        <option value="Dinner & Late Study (7:30 PM – 10:30 PM)">Dinner (7:30 – 10:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#E65100] hover:bg-[#D84315] text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-95 mt-2 cursor-pointer"
                  >
                    {isLoggedIn ? "BROWSE CANTEENS & PRE-ORDER NOW →" : "SIGN IN TO PRE-SCHEDULE →"}
                  </button>
                </form>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-[11px] text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Requires active campus account for verified delivery.</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. CANTEENS OPERATING HOURS & PROTECTED ACCESS ─────────────── */}
      <section id="canteen-timings" className="py-16 sm:py-24 border-b border-[#F0E6D8] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E65100]">
              CAMPUS SCHEDULES WORLDWIDE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1F1713] dark:text-white tracking-tight">
              Canteens Aren&apos;t Open 24/7
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Every college canteen manages daily open/close hours, weekly off-days, and holiday calendars. Pre-schedule meals during off-time, and kitchens prepare them immediately upon opening!
            </p>
          </div>

          {/* Members-only Gate if not logged in */}
          {!isLoggedIn ? (
            <div className="bg-white dark:bg-[#161B22] rounded-[36px] p-8 sm:p-14 border border-[#F0E6D8] dark:border-gray-800 shadow-xl text-center max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-[#E65100] flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-black text-gray-900 dark:text-white">
                  Campus Canteens & Menus are Protected
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                  To view verified canteens, live food availability, operating hours, and rider delivery at your college or university, please sign in or create your student account.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  href="/login?redirect=/shop"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#E65100] hover:bg-[#D84315] text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  Sign In to Your Campus
                </Link>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1412] dark:bg-white dark:text-black text-white hover:bg-[#332A25] font-black text-xs uppercase tracking-wider rounded-full transition-all"
                >
                  Create Student Account
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161B22] rounded-[36px] p-8 sm:p-12 border border-[#F0E6D8] dark:border-gray-800 shadow-sm text-center max-w-3xl mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <Store className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-black text-gray-900 dark:text-white">
                  Your Campus Dining Portal is Unlocked
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  You are signed in! Jump straight to your university canteens to see live open/closed statuses, daily menus, and order with instant UPI payment.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#E65100] hover:bg-[#D84315] text-white font-black text-xs uppercase tracking-wider rounded-full shadow-xl shadow-orange-500/25 transition-all hover:scale-105"
              >
                BROWSE CAMPUS CANTEENS <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* ── 6. 4 VALUE PROPS BAR ───────────────────────────────────────── */}
      <section className="py-12 bg-white dark:bg-[#0D1117] border-b border-[#F0E6D8] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Free Delivery */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#E65100] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Fast Campus Delivery</h4>
                <p className="text-[11px] text-gray-400">Direct to hostel or college lawn</p>
              </div>
            </div>

            {/* Easy Payment */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#E65100] flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Easy Payment</h4>
                <p className="text-[11px] text-gray-400">100% secure online UPI & cards</p>
              </div>
            </div>

            {/* Best Offers */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#E65100] flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Student Deals</h4>
                <p className="text-[11px] text-gray-400">Daily combo offers & vouchers</p>
              </div>
            </div>

            {/* Support 24/7 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#E65100] flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Support 24/7</h4>
                <p className="text-[11px] text-gray-400">Campus helpdesk always active</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. FOOTER (Foodzie Branding, No Instagram or Newsletter) ──── */}
      <footer className="bg-[#1A1412] text-white pt-16 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E65100] flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-2xl font-serif font-black tracking-tight text-white">
                Foodzie<span className="text-[#E65100]">.</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              The smart food delivery and dining network for colleges and universities worldwide. Fresh food, transparent prices, and dedicated student campus delivery.
            </p>
            <p className="text-[11px] font-bold text-orange-400">
              Colleges & Universities Worldwide
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">QUICK LINKS</h4>
            <ul className="space-y-2 text-xs font-bold text-gray-300">
              <li><Link href="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link href="/shop" className="hover:text-orange-400 transition-colors">Browse Canteens</Link></li>
              <li><Link href="#canteen-timings" className="hover:text-orange-400 transition-colors">Operating Timings</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">CAMPUS ROLES</h4>
            <ul className="space-y-2 text-xs font-bold text-gray-300">
              <li><Link href="/signup?role=Foodie" className="hover:text-orange-400 transition-colors">Student Foodie</Link></li>
              <li><Link href="/signup?role=Vendor" className="hover:text-orange-400 transition-colors">Canteen Merchant</Link></li>
              <li><Link href="/signup?role=Delivery" className="hover:text-orange-400 transition-colors">Campus Delivery Rider</Link></li>
              <li><Link href="/login" className="hover:text-orange-400 transition-colors">Staff / Admin Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">CONTACT</h4>
            <div className="space-y-2 text-xs text-gray-300">
              <p className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Global Multi-Campus Network</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>+91 181 271 1111</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>support@foodzie.store</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Legal bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Foodzie Campus Dining Network. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/refunds" className="hover:text-white transition-colors">Refunds & Cancellation</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
