'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Coffee 
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import toast from 'react-hot-toast';

interface DishItem {
  id: string;
  name: string;
  desc: string;
  price: string;
  imageUrl: string;
  canteen: string;
}

const POPULAR_DISHES: DishItem[] = [
  {
    id: '1',
    name: 'Creamy Alfredo Pasta',
    desc: 'Rich and creamy white garlic sauce with button mushrooms, herbs, and parmesan.',
    price: '₹140',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600&q=80',
    canteen: "Tania'z Cafe",
  },
  {
    id: '2',
    name: 'Grilled Paneer Tikka Steak',
    desc: 'Juicy tandoori spiced cottage cheese steak served with seasoned bell peppers and mint chutney.',
    price: '₹180',
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80',
    canteen: "Narinder's Cafe",
  },
  {
    id: '3',
    name: 'Quinoa & Avocado Salad',
    desc: 'Crisp organic greens, ripe avocado, cherry tomatoes, cucumbers and lemon herb vinaigrette.',
    price: '₹120',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
    canteen: 'Student Adda',
  },
  {
    id: '4',
    name: 'Chocolate Molten Lava Cake',
    desc: 'Warm Belgian dark chocolate cake with a rich molten gooey center and powdered sugar.',
    price: '₹90',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
    canteen: 'Urban Bite',
  },
];

const SBBSU_CANTEENS = [
  { name: "Tania'z Cafe", hours: '08:30 AM – 08:30 PM', open: true, block: 'Central Food Court' },
  { name: "Narinder's Cafe", hours: '08:00 AM – 08:00 PM', open: true, block: 'Engineering Block' },
  { name: "Student Adda", hours: '09:00 AM – 09:00 PM', open: true, block: 'Main Library Lawn' },
  { name: "Hunger Cure", hours: '08:30 AM – 08:00 PM', open: true, block: 'Management Wing' },
  { name: "Aniket Canteen", hours: '08:00 AM – 07:30 PM', open: true, block: 'Sports Complex' },
  { name: "Urban Bite", hours: '09:00 AM – 08:30 PM', open: true, block: 'Hostel Square' },
];

export default function FlavoriaLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingPeople, setBookingPeople] = useState('2');
  const [bookingCanteen, setBookingCanteen] = useState("Tania'z Cafe");

  const handleBookTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      toast.error('Please select both date and time for pre-scheduling.');
      return;
    }
    toast.success(`Pre-order / table reserved at ${bookingCanteen} for ${bookingPeople} guests on ${bookingDate} at ${bookingTime}!`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-[#0D1117] text-[#2C2723] dark:text-[#E6EDF3] font-sans transition-colors duration-300">
      
      {/* ── TOP UTILITY BAR (Flavoria Style) ───────────────────────────── */}
      <div className="bg-[#FFF8EE] dark:bg-[#161B22] border-b border-[#F0E6D8] dark:border-gray-800 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Left: Location & Hours */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#E65100]" />
              Sant Baba Bhag Singh University Campus, Jalandhar
            </span>
            <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#E65100]" />
              Mon - Sat: 08:00 AM - 09:00 PM (Canteens Schedule)
            </span>
          </div>

          {/* Right: Phone Contact & Theme Toggle */}
          <div className="flex items-center gap-4">
            <a href="tel:+911812711111" className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200 hover:text-[#E65100] transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#E65100]" />
              +91 181 271 1111
            </a>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <ThemeToggle />
          </div>

        </div>
      </div>

      {/* ── MAIN NAVBAR (Flavoria Style) ───────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#0D1117]/95 backdrop-blur-md border-b border-[#F0E6D8] dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          
          {/* Logo with Chef Hat & Serif Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-[#E65100] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#1A1412] dark:text-white flex items-center">
                Flavoria<span className="text-[#E65100]">.</span>
              </span>
              <span className="block text-[9px] font-black tracking-[0.2em] text-[#A66E38] dark:text-orange-400 uppercase -mt-1">
                RESTAURANT & CANTEENS
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
              MENU
            </Link>
            <Link href="#canteen-timings" className="hover:text-[#E65100] transition-colors">
              CANTEEN TIMINGS
            </Link>
            <Link href="/contact" className="hover:text-[#E65100] transition-colors">
              CONTACT
            </Link>
          </div>

          {/* Right Button: Book a Table / Pre-Order */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-extrabold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/shop"
              className="bg-[#E65100] hover:bg-[#D84315] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-md shadow-orange-500/25 hover:scale-105 active:scale-95"
            >
              BOOK A TABLE / ORDER
            </Link>
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
              <span className="font-serif font-black text-xl">Flavoria<span className="text-[#E65100]">.</span></span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm font-bold">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>Menu & Canteens</Link>
              <Link href="#canteen-timings" onClick={() => setMobileMenuOpen(false)}>Canteen Timings</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            </div>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-[#E65100] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full shadow-lg"
            >
              Book a Table / Order Now
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
                  GOOD FOOD | GOOD MOOD
                </span>
              </div>

              {/* Headline with Serif & Italic Accent */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif text-[#1F1713] dark:text-white leading-[1.08] tracking-tight">
                Delicious Food <br />
                for <span className="italic font-serif font-normal text-[#C2410C] dark:text-orange-400">Every Mood</span>
              </h1>

              {/* Subparagraph */}
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl font-medium">
                Experience a perfect blend of taste, quality, and campus ambience. Every dish is crafted with love and passion to bring joy to your university table.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#E65100] hover:bg-[#D84315] text-white text-xs sm:text-sm font-black uppercase tracking-wider px-7 py-4 rounded-full transition-all shadow-xl shadow-orange-500/25 hover:scale-105 active:scale-95"
                >
                  <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
                  EXPLORE MENU
                </Link>

                <Link
                  href="#canteen-timings"
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 text-[#1F1713] dark:text-white border-2 border-[#E65100] text-xs sm:text-sm font-black uppercase tracking-wider px-7 py-3.5 rounded-full transition-all shadow-sm active:scale-95"
                >
                  <CalendarClock className="w-4 h-4 text-[#E65100]" />
                  BOOK A TABLE / TIMINGS
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

      {/* ── 2. WELCOME TO FLAVORIA (Good Food, Good Life) ──────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#F0E6D8] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Warm Restaurant Ambience Photo with "10+ Years" */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                  alt="Cozy Dining Ambience"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Badge: 10+ Years of Experience */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#E65100] text-white p-5 rounded-3xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <span className="text-xl font-black block leading-none">10+</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 block mt-1">
                    Years of Campus Service
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative & Values */}
            <div className="lg:col-span-7 space-y-6 text-left lg:pl-8">
              
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E65100]">
                WELCOME TO FLAVORIA
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#1F1713] dark:text-white leading-tight">
                Good Food, <br />
                <span className="italic font-serif font-normal text-[#C2410C] dark:text-orange-400">Good Life</span>
              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                At Flavoria, we believe that great food brings people together. Our campus menu is inspired by rich Punjabi culinary heritage and global flavors, crafted with the freshest farm-to-table ingredients.
              </p>

              {/* Handwritten Brand Script */}
              <div className="font-serif italic text-2xl text-[#E65100] tracking-wide py-1">
                Flavoria ♡
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
                    <p className="text-[11px] text-gray-500 mt-0.5">Locally sourced daily dairy and fresh vegetables.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#E65100] flex items-center justify-center shrink-0">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white">Skilled Chefs</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Master culinary cooks with deep passion.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#E65100] flex items-center justify-center shrink-0">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white">Cozy Ambience</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Vibrant space for students, faculty & friends.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 3. CHEF'S SPECIAL - OUR POPULAR DISHES ─────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#F0E6D8] dark:border-gray-800 bg-[#FFFDF9] dark:bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E65100] block mb-1">
                CHEF&apos;S SPECIAL
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F1713] dark:text-white tracking-tight">
                — Our Popular Dishes —
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-[#E65100] hover:text-[#C2410C] transition-colors"
            >
              VIEW FULL MENU <ChevronRight className="w-4 h-4" />
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
                    <span className="text-[10px] text-gray-400 block font-bold">{dish.canteen}</span>
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

      {/* ── 4. SPECIAL OFFER BANNER & BOOK YOUR TABLE / PRE-SCHEDULE ──── */}
      <section className="py-16 sm:py-24 border-b border-[#F0E6D8] dark:border-gray-800 bg-[#FFF8EE] dark:bg-[#161B22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Card: Special Offer Banner (#153226 Dark Forest Green) */}
            <div className="lg:col-span-7 bg-[#153226] text-white rounded-[36px] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="space-y-4 relative z-10">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#A3E635]">
                  SPECIAL OFFER
                </span>
                <h3 className="text-3xl sm:text-5xl font-serif font-black leading-tight tracking-tight">
                  Get 20% Off <br />
                  <span className="italic font-normal">On Your First Order</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 max-w-md leading-relaxed">
                  Apply coupon code <span className="font-mono font-black text-amber-300">CAMPUS20</span> at checkout to unlock direct student discounts on all university canteens.
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

            {/* Right Card: Book Your Table / Pre-Schedule Order Form */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0D1117] rounded-[36px] p-8 sm:p-10 border border-[#F0E6D8] dark:border-gray-800 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#E65100] block mb-1">
                  RESERVATION & PRE-ORDERS
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 dark:text-white mb-2">
                  Book Your Table
                </h3>
                <p className="text-xs text-gray-500 mb-6">
                  Reserve a table in advance or pre-schedule a hot meal delivery during canteen open timings.
                </p>

                <form onSubmit={handleBookTable} className="space-y-4">
                  {/* Select Canteen */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                      Select Canteen
                    </label>
                    <select
                      value={bookingCanteen}
                      onChange={(e) => setBookingCanteen(e.target.value)}
                      className="w-full bg-[#FFFDF9] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#E65100]"
                    >
                      {SBBSU_CANTEENS.map(c => (
                        <option key={c.name} value={c.name}>{c.name} ({c.block})</option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-[#FFFDF9] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-3 py-3 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#E65100]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                        Select Time
                      </label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-[#FFFDF9] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-3 py-3 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#E65100]"
                      />
                    </div>
                  </div>

                  {/* Guests / People */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                      Number of People
                    </label>
                    <select
                      value={bookingPeople}
                      onChange={(e) => setBookingPeople(e.target.value)}
                      className="w-full bg-[#FFFDF9] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#E65100]"
                    >
                      <option value="1">1 Person (Quick Meal)</option>
                      <option value="2">2 People (Pair)</option>
                      <option value="4">4 People (Small Group)</option>
                      <option value="6">6 People (Team Lunch)</option>
                      <option value="8+">8+ People (Class / Society Gathering)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#E65100] hover:bg-[#D84315] text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-95 mt-2"
                  >
                    FIND A TABLE / PRE-SCHEDULE
                  </button>
                </form>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-[11px] text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Instant confirmation via SMS & in-app notifications.</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. CANTEEN TIMINGS & PRE-SCHEDULE FEATURE SECTION ───────── */}
      <section id="canteen-timings" className="py-16 sm:py-24 border-b border-[#F0E6D8] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E65100]">
              CAMPUS SCHEDULES
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1F1713] dark:text-white tracking-tight">
              Canteens Aren&apos;t Open 24/7
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Sant Baba Bhag Singh University canteens follow active campus hours. You can place pre-scheduled orders during off-hours, and canteens will prepare them immediately upon opening!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SBBSU_CANTEENS.map((canteen) => (
              <div
                key={canteen.name}
                className="bg-white dark:bg-[#161B22] rounded-3xl p-6 border border-[#F0E6D8] dark:border-gray-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#E65100] flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{canteen.name}</h3>
                      <span className="text-[10px] text-gray-400 font-bold">{canteen.block}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    🟢 Open
                  </span>
                </div>

                <div className="space-y-2 text-xs border-t border-b border-gray-100 dark:border-gray-800 py-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Operating Hours:</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{canteen.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Weekly Off Day:</span>
                    <span className="font-bold text-rose-500">Sunday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pre-Orders:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Accepted 24/7</span>
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="block text-center w-full py-2.5 rounded-xl bg-[#FFF8EE] dark:bg-gray-800 text-[#E65100] hover:bg-[#E65100] hover:text-white text-xs font-bold transition-colors"
                >
                  View Canteen Menu
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. 4 VALUE PROPS BAR (Flavoria Style) ─────────────────────── */}
      <section className="py-12 bg-white dark:bg-[#0D1117] border-b border-[#F0E6D8] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Free Delivery */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#E65100] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Free Delivery</h4>
                <p className="text-[11px] text-gray-400">On campus orders over ₹150</p>
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
                <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Best Offers</h4>
                <p className="text-[11px] text-gray-400">Daily student combos & deals</p>
              </div>
            </div>

            {/* Support 24/7 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#E65100] flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Support 24/7</h4>
                <p className="text-[11px] text-gray-400">We are always here to assist</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. FOOTER (Without Instagram or Newsletter Card) ──────────── */}
      <footer className="bg-[#1A1412] text-white pt-16 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E65100] flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-2xl font-serif font-black tracking-tight text-white">
                Flavoria<span className="text-[#E65100]">.</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Good food, good mood! Visit us and enjoy an unforgettable campus dining experience with authentic flavors and dedicated Punjabi student delivery.
            </p>
            <p className="text-[11px] font-bold text-orange-400">
              Sant Baba Bhag Singh University, Jalandhar, Punjab
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">QUICK LINKS</h4>
            <ul className="space-y-2 text-xs font-bold text-gray-300">
              <li><Link href="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link href="/shop" className="hover:text-orange-400 transition-colors">Menu</Link></li>
              <li><Link href="#canteen-timings" className="hover:text-orange-400 transition-colors">Reservation & Timings</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Our Menu */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">OUR MENU</h4>
            <ul className="space-y-2 text-xs font-bold text-gray-300">
              <li><Link href="/shop" className="hover:text-orange-400 transition-colors">Breakfast Specials</Link></li>
              <li><Link href="/shop" className="hover:text-orange-400 transition-colors">Lunch Thalis</Link></li>
              <li><Link href="/shop" className="hover:text-orange-400 transition-colors">Dinner Combos</Link></li>
              <li><Link href="/shop" className="hover:text-orange-400 transition-colors">Desserts & Shakes</Link></li>
              <li><Link href="/shop" className="hover:text-orange-400 transition-colors">Chef&apos;s Specials</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">CONTACT INFO</h4>
            <div className="space-y-2 text-xs text-gray-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>SBBSU Campus, Padhiana, Jalandhar, Punjab 144030</span>
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
          <p>© {new Date().getFullYear()} Flavoria Restaurant & Foodzie Campus Dining. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/refunds" className="hover:text-white transition-colors">Refunds & Cancellation</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
