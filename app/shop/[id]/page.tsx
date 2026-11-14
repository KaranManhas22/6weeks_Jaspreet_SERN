'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Store, 
  Clock, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Loader2, 
  User, 
  Heart,
  Star, 
  X, 
  Users, 
  CalendarClock, 
  ChefHat,
  Bell,
  CreditCard,
  FileText,
  SlidersHorizontal,
  Search,
  Sparkles,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { api, getToken, decodeToken } from '@/lib/api';
import { getFoodImage } from '@/lib/imageHelper';
import { useCartStore } from '@/lib/store/cartStore';
import { CartSlideOver } from '@/components/CartSlideOver';
import { PromoBannerCarousel } from '@/components/PromoBannerCarousel';
import { DietaryIcon } from '@/components/DietaryIcon';
import { useCurrency } from '@/context/CurrencyContext';
import { getCanteenScheduleStatus } from '@/lib/schedule';
import toast from 'react-hot-toast';

interface Review {
  rating: number;
  comment: string | null;
  createdAt: string;
  customerName: string;
}

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  prepTimeMins: number;
  isCooked: boolean;
  stock: number;
  isVegetarian: boolean;
  categoryName?: string;
  vendorId?: string;
  discount: {
    percent: number;
    validFrom: string;
    validTo: string;
    effectivePrice: number;
  } | null;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

interface Category {
  categoryId: string;
  categoryName: string;
  items: FoodItem[];
}

interface VendorMenu {
  vendorId: string;
  vendorName: string;
  vendorLogoUrl: string | null;
  canteenSchedule?: any;
  categories: Category[];
}

function CanteenStorefrontContent() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;
  const searchParams = useSearchParams();
  const squadParam = searchParams.get('squad');
  const { formatCurrency } = useCurrency();

  const [vendor, setVendor] = useState<VendorMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('Campus Foodie');
  const [userCredits, setUserCredits] = useState(9132);
  const [activeNav, setActiveNav] = useState('Campus Canteens');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under50' | '50-100' | '100+'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');

  // Reviews view state
  const [selectedReviewItem, setSelectedReviewItem] = useState<FoodItem | null>(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Global cart state
  const cart = useCartStore((state) => state.items);
  const cartVendorId = useCartStore((state) => state.vendorId);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const totalCartPrice = useCartStore((state) => state.getTotalPrice());

  // Slide-over & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<FoodItem | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Job Vacancies & Squad Order
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [studentProfile, setFoodieProfile] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<any>(null);
  const [appAge, setAppAge] = useState('');
  const [appCity, setAppCity] = useState('');
  const [appAddress, setAppAddress] = useState('');
  const [appUpiId, setAppUpiId] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [creatingSquad, setCreatingSquad] = useState(false);

  const fetchVendorMenu = async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const [menuData, vacsData] = await Promise.all([
        api.get<VendorMenu>(`/api/menu/vendor/${vendorId}`),
        api.get<any[]>(`/api/jobs/vacancies?vendorId=${vendorId}`)
      ]);
      setVendor(menuData);
      setVacancies(vacsData || []);

      const addItemId = searchParams?.get('add_item');
      if (addItemId && menuData.categories) {
        let foundItem: FoodItem | null = null;
        for (const cat of menuData.categories) {
          foundItem = cat.items.find((i: FoodItem) => i.id === addItemId) || null;
          if (foundItem) break;
        }
        if (foundItem && foundItem.stock > 0 && foundItem.isCooked) {
          const currentCartVendor = useCartStore.getState().vendorId;
          if (currentCartVendor && currentCartVendor !== vendorId) {
            setPendingItem(foundItem);
          } else {
            useCartStore.getState().addItem(foundItem, vendorId);
          }
          router.replace(`/shop/${vendorId}`);
        }
      }

      // Load user profile
      try {
        const profile = await api.get<any>('/api/auth/me');
        if (profile) {
          setFoodieProfile(profile);
          if (profile.name) setUserName(profile.name);
          const totalC = (profile.refundedCredits || 0) + (profile.earnedCredits || 0);
          if (totalC > 0) setUserCredits(totalC);
        }
      } catch {
        // Not authenticated
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load canteen menu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    setIsAuthenticated(true);
    fetchVendorMenu();
  }, [vendorId]);

  const handleAddToCart = async (item: FoodItem) => {
    if (cartVendorId && cartVendorId !== vendorId && Object.keys(cart).length > 0) {
      setPendingItem(item);
      return;
    }
    addItem(item, vendorId);
    toast.success(`Added ${item.name} to meal tray!`);

    // Sync with squad API if active
    if (squadParam) {
      try {
        await api.post(`/api/squad/${squadParam}/add`, {
          foodItemId: item.id,
          quantity: 1,
          price: item.discount ? item.discount.effectivePrice : item.price,
          name: item.name
        });
      } catch (err) {
        console.error('Failed to sync to squad cart', err);
      }
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites ❤️');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewItem) return;
    setSubmittingReview(true);
    try {
      await api.post('/api/reviews', {
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        type: 'FoodItem',
        foodItemId: selectedReviewItem.id,
        canteenId: vendorId
      });
      setNewReviewRating(5);
      setNewReviewComment('');
      toast.success('Review submitted successfully!');
      await fetchVendorMenu();
      setSelectedReviewItem(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVacancy) return;
    setSubmittingApp(true);
    try {
      await api.post('/api/jobs/apply', {
        vacancyId: selectedVacancy.id,
        age: parseInt(appAge),
        city: appCity.trim(),
        address: appAddress.trim(),
        upiId: appUpiId.trim()
      });
      setShowApplyModal(false);
      setAppAge('');
      setAppCity('');
      setAppAddress('');
      setAppUpiId('');
      toast.success('Rider application submitted to canteen manager!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Filtered Categories and Items
  const filteredCategories = useMemo(() => {
    if (!vendor?.categories) return [];

    return vendor.categories
      .filter((cat) => activeCategory === 'All' || cat.categoryName === activeCategory)
      .map((cat) => {
        let items = cat.items.filter((item) => {
          // Search query
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesName = item.name.toLowerCase().includes(q);
            const matchesDesc = item.description?.toLowerCase().includes(q);
            if (!matchesName && !matchesDesc) return false;
          }

          // Dietary
          if (dietaryFilter === 'veg' && !item.isVegetarian) return false;
          if (dietaryFilter === 'non-veg' && item.isVegetarian) return false;

          // Price
          const currentPrice = item.discount ? item.discount.effectivePrice : item.price;
          if (priceFilter === 'under50' && currentPrice >= 50) return false;
          if (priceFilter === '50-100' && (currentPrice < 50 || currentPrice > 100)) return false;
          if (priceFilter === '100+' && currentPrice <= 100) return false;

          return true;
        });

        // Sorting
        if (sortBy === 'price-asc') items.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') items.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') items.sort((a, b) => (b.averageRating || 4.5) - (a.averageRating || 4.5));

        return {
          ...cat,
          items
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [vendor, activeCategory, searchQuery, dietaryFilter, priceFilter, sortBy]);

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] text-[#2C2723] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#E65100] mb-6 shadow-xl shadow-amber-500/10">
          <Store className="w-10 h-10" />
        </div>
        <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-[#E65100] font-black text-xs uppercase tracking-wider mb-4">
          Campus Canteens are Members Only
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight max-w-xl">
          Sign in to view this canteen&apos;s live menu
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-3 max-w-md">
          Foodzie serves colleges and universities worldwide. Sign in or register to browse food items, customize orders, and skip the line.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
          <Link
            href={`/login?redirect=/shop/${vendorId}`}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-[#E65100] hover:bg-[#D84315] text-white font-black text-sm shadow-lg shadow-orange-500/25 transition-all text-center"
          >
            Sign In
          </Link>
          <Link
            href={`/signup?redirect=/shop/${vendorId}`}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-white border border-gray-200 text-gray-900 font-black text-sm hover:bg-gray-50 transition-all text-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] text-[#2C2723] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-[#E65100] mb-4" />
        <p className="font-bold text-xs uppercase tracking-widest">Loading Canteen Menu...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] text-[#2C2723] flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-3xl p-8 text-center max-w-md w-full">
          <p className="mb-4 font-bold">{error || 'Canteen not found'}</p>
          <button 
            onClick={() => router.push('/shop')}
            className="px-6 py-3 bg-[#E65100] text-white rounded-2xl text-xs font-black shadow-md hover:bg-[#D84315] transition-colors"
          >
            Back to Campus Canteens
          </button>
        </div>
      </div>
    );
  }

  const canteenStatus = getCanteenScheduleStatus(vendor.canteenSchedule);

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2C2723] flex flex-col xl:flex-row h-screen overflow-hidden font-sans">
      
      {/* ── 1. LEFT SIDEBAR (Sticky, Unified GoMeal Navigation) ──────────── */}
      <aside className="hidden xl:flex w-64 bg-white border-r border-[#F0E6D8] flex-col justify-between p-5 shrink-0 sticky top-0 h-screen overflow-y-auto z-20">
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full bg-[#E65100] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <ChefHat className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-2xl font-black font-serif tracking-tight text-[#1A1412] flex items-center">
                  Foodzie<span className="text-[#E65100]">.</span>
                </span>
                <span className="block text-[8px] font-black tracking-[0.2em] text-[#A66E38] uppercase leading-none mt-0.5">CAMPUS DINING</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'Campus Canteens', label: 'Campus Canteens', icon: Store, href: '/shop' },
              { id: 'Favorite', label: 'Favorites', icon: Heart, count: favorites.length },
              { id: 'Order History', label: 'Order History', icon: FileText, href: '/shop/orders' },
              { id: 'Bills', label: 'Campus Wallet', icon: CreditCard, count: `${userCredits} pts`, href: '/shop/profile#wallet' },
              { id: 'Setting', label: 'User Profile', icon: User, href: '/shop/profile' },
            ].map((item) => {
              const isActive = activeNav === item.label;
              const Icon = item.icon;

              const content = (
                <div
                  onClick={() => setActiveNav(item.label)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E65100] text-white shadow-md shadow-orange-500/20'
                      : 'text-gray-600 hover:bg-[#FFF8EE] hover:text-[#E65100]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white stroke-[2.5]' : 'stroke-2'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-white text-[#E65100]' : 'bg-orange-50 text-[#E65100] border border-orange-200/60'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </div>
              );

              return item.href ? (
                <Link key={item.id} href={item.href}>
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </nav>
        </div>

        {/* Student Pass Box at Bottom of Sidebar */}
        <div className="mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E65100] via-[#F97316] to-[#FB923C] p-5 text-white shadow-lg shadow-orange-500/20">
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-white fill-current" />
            </div>
            <h4 className="font-extrabold text-sm leading-snug">Foodzie Campus Pass</h4>
            <p className="text-[11px] font-medium text-white/90 mt-1 mb-4 leading-relaxed">
              Unlock campus student vouchers, zero delivery surcharges &amp; priority kitchen prep!
            </p>
            <button 
              onClick={() => toast.success("Student Campus Pass active on your account!")}
              className="w-full bg-white text-[#E65100] font-black text-xs py-2.5 rounded-xl hover:bg-orange-50 transition-all shadow-sm active:scale-95"
            >
              Get Campus Pass
            </button>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />
        </div>
      </aside>

      {/* ── 2. CENTER CONTENT (Middle Part Scrolls Independently) ───────── */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen scroll-smooth">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/shop')}
              className="w-10 h-10 rounded-2xl bg-white border border-[#F0E6D8] flex items-center justify-center text-gray-700 hover:text-[#E65100] hover:border-[#E65100] transition-colors shadow-xs"
              title="Back to All Campus Canteens"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Campus Storefront</span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                {vendor.vendorName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/shop/profile"
              className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#E65100] border border-orange-500/20 flex items-center justify-center font-black text-sm hover:scale-105 transition-transform"
              title="User Profile"
            >
              {userName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>

        {/* Canteen Hero Header & Operating Hours */}
        <div className="bg-white border border-[#F0E6D8] rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF8EE] border-2 border-[#F0E6D8] overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                {vendor.vendorLogoUrl ? (
                  <img src={vendor.vendorLogoUrl} alt={vendor.vendorName} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-[#E65100]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">{vendor.vendorName}</h2>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    canteenStatus.isOpen 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${canteenStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {canteenStatus.isOpen ? 'Kitchen Open' : 'Pre-Order Only'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  {canteenStatus.isOpen 
                    ? `Cooking fresh meals today until ${canteenStatus.todayHours?.close || '09:00 PM'}`
                    : `Currently closed. Pre-order now for instant delivery when we open!`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 text-[#E65100] text-xs font-bold hover:bg-orange-100 border border-orange-200/60 transition-colors"
              >
                <CalendarClock className="w-4 h-4" />
                <span>Timings &amp; Holidays</span>
              </button>

              {/* Squad Order Button */}
              {squadParam ? (
                <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>Squad Order Active</span>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    setCreatingSquad(true);
                    try {
                      const res = await api.post<{squadId: string}>('/api/squad/create', { vendorId });
                      router.push(`/shop/${vendorId}?squad=${res.squadId}`);
                      toast.success("Squad room created! Share link with classmates.");
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to start squad order');
                    } finally {
                      setCreatingSquad(false);
                    }
                  }}
                  disabled={creatingSquad}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E65100] text-white text-xs font-black shadow-md shadow-orange-500/20 hover:bg-[#D84315] transition-all"
                >
                  {creatingSquad ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  <span>Start Squad Order</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── PROMOTIONAL SLIDESHOW CAROUSEL (Inside Canteen) ─────────────── */}
        <PromoBannerCarousel />

        {/* Global Search within Canteen */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search dishes in ${vendor.vendorName}...`}
            className="w-full bg-white border border-[#F0E6D8] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-[#E65100] transition-all shadow-xs"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── CATEGORY PILLS STRIP ────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['All', ...vendor.categories.map((c) => c.categoryName)].map((catName) => {
              const isSelected = activeCategory === catName;
              return (
                <button
                  key={catName}
                  onClick={() => setActiveCategory(catName)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide uppercase whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#E65100] text-white border-[#E65100] shadow-md shadow-orange-500/25'
                      : 'bg-white text-gray-700 border-[#F0E6D8] hover:border-[#E65100]/50 hover:bg-[#FFF8EE]'
                  }`}
                >
                  {catName === 'All' ? 'All Dishes' : catName}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FILTER & SORT STRIP (Dietary, Price & Sorting) ─────────── */}
        <div className="mb-8 bg-white border border-[#F0E6D8] rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#E65100]" /> Filters:
            </span>
            {/* Dietary Filter */}
            {(['all', 'veg', 'non-veg'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDietaryFilter(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dietaryFilter === mode
                    ? 'bg-[#E65100] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode === 'all' ? 'All Food' : mode === 'veg' ? '🟢 Pure Veg' : '🔴 Non-Veg'}
              </button>
            ))}

            <div className="h-4 w-px bg-gray-200 hidden sm:block mx-1" />

            {/* Price Filter */}
            {(['all', 'under50', '50-100', '100+'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriceFilter(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  priceFilter === p
                    ? 'bg-[#E65100] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'all' ? 'Any Price' : p === 'under50' ? 'Under ₹50' : p === '50-100' ? '₹50–₹100' : '₹100+'}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-100 border-none rounded-xl text-xs font-bold px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated ⭐</option>
            </select>
          </div>
        </div>

        {/* ── FOOD MENU CATEGORIES & ITEMS ─────────────────────────────────── */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400">
            <Store className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#E65100]" />
            <p className="font-bold text-base text-gray-700">No dishes match your filter criteria</p>
            <p className="text-xs text-gray-400 mt-1">Try resetting the dietary or price filters above.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredCategories.map((category) => (
              <div key={category.categoryId} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-2">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    {category.categoryName}
                  </h3>
                  <span className="text-xs font-bold text-[#E65100]">
                    {category.items.length} items
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {category.items.map((item) => {
                    const cartItem = cart[item.id];
                    const currentPrice = item.discount ? item.discount.effectivePrice : item.price;
                    const isFav = favorites.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-[#F0E6D8] rounded-3xl p-5 shadow-[0_4px_20px_rgba(230,81,0,0.06)] hover:shadow-[0_12px_32px_rgba(230,81,0,0.12)] hover:border-[#E65100]/40 transition-all duration-300 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Top Badges: Discount + Canteen Name + Favorite */}
                          <div className="flex items-center justify-between mb-3 gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#E65100] text-white tracking-wider uppercase shadow-xs">
                                {item.discount ? `${item.discount.percent}% Off` : '15% Off'}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FFF8EE] text-[#E65100] border border-[#F0E6D8] truncate max-w-[130px] flex items-center gap-1">
                                <Store className="w-2.5 h-2.5 shrink-0" />
                                <span>{vendor.vendorName}</span>
                              </span>
                            </div>

                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-rose-50 transition-colors shrink-0"
                            >
                              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                            </button>
                          </div>

                          {/* Food Image */}
                          <div className="w-full h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFF8EE] to-[#F5EBE1] mb-3 relative flex items-center justify-center shadow-inner">
                            <img
                              src={getFoodImage(item.name, item.imageUrl)}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-2.5 left-2.5 shadow-sm rounded-full overflow-hidden border border-white/40">
                              <DietaryIcon isVegetarian={item.isVegetarian} className="bg-white/95" />
                            </div>
                          </div>

                          {/* Ratings & Reviews trigger */}
                          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-xs font-bold text-gray-700 ml-1">
                              {item.averageRating ? item.averageRating.toFixed(1) : '4.9'}
                            </span>
                            <button
                              onClick={() => setSelectedReviewItem(item)}
                              className="text-[10px] font-extrabold text-[#E65100] bg-orange-50 px-2 py-0.5 rounded-md hover:bg-orange-100 transition-colors ml-1"
                            >
                              {item.reviewCount || 18} Reviews &gt;
                            </button>
                          </div>

                          {/* Title & Description with generous padding and margins */}
                          <h4 className="font-extrabold text-base text-gray-900 line-clamp-1 group-hover:text-[#E65100] transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed font-medium">
                            {item.description || 'Cooked fresh with authentic campus spices and served hot.'}
                          </p>

                          {/* Prep time & Stock badge */}
                          <div className="flex items-center gap-2 mt-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            {item.isCooked ? (
                              <span className="flex items-center gap-1 bg-[#FFF8EE] px-2 py-0.5 rounded-md text-[#E65100] border border-[#F0E6D8]">
                                <Clock className="w-3 h-3" /> {item.prepTimeMins || 10} min prep
                              </span>
                            ) : (
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">
                                {item.stock} in stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price and Add to Tray button with ample breathing margins */}
                        <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-[#F0E6D8] px-1">
                          <div>
                            {item.discount && (
                              <span className="text-[10px] text-gray-400 line-through block leading-none mb-0.5">
                                {formatCurrency(item.price)}
                              </span>
                            )}
                            <span className="text-lg font-black text-gray-900 leading-none">
                              {formatCurrency(currentPrice)}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          {cartItem ? (
                            <div className="flex items-center gap-2 bg-[#FFF8EE] border border-orange-200 rounded-2xl p-1 shadow-xs">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="w-7 h-7 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xs font-black hover:bg-gray-100"
                              >
                                <Minus className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                              <span className="w-6 text-center font-black text-xs text-[#E65100]">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="w-7 h-7 rounded-xl bg-[#E65100] text-white flex items-center justify-center text-xs font-black hover:bg-[#D84315]"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={!item.isCooked && item.stock <= 0}
                              className="w-10 h-10 rounded-2xl bg-[#E65100] hover:bg-[#D84315] text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 active:scale-95 hover:scale-105 transition-all"
                              title="Add to meal tray"
                            >
                              <Plus className="w-5 h-5 stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── 3. RIGHT SIDEBAR (Unified GoMeal Order & Checkout Tray) ───────── */}
      <aside className="hidden xl:flex xl:w-[340px] 2xl:w-[360px] bg-white border-l border-[#F0E6D8] shrink-0 p-5 flex-col justify-between sticky top-0 h-screen overflow-y-auto z-20">
        <div>
          {/* User Profile Mini Bar */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E65100] flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-black text-sm text-gray-900 leading-none">{userName}</h4>
                <span className="text-[10px] font-bold text-gray-400">Campus Foodie</span>
              </div>
            </div>
            <Link href="/shop/orders" className="p-2 rounded-xl bg-orange-50 text-[#E65100] hover:bg-orange-100 transition-colors" title="View Orders">
              <Bell className="w-4 h-4" />
            </Link>
          </div>

          {/* Foodie Credit Points Card: High contrast light theme button */}
          <div className="rounded-3xl bg-gradient-to-br from-[#E65100] via-[#F97316] to-[#FB923C] p-5 text-white shadow-md shadow-orange-500/20 mb-5 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/90 block mb-1">Foodie Credit Points</span>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{userCredits > 0 ? `${userCredits} pts` : '9,132 pts'}</h3>
                <p className="text-[10px] text-white/90 font-bold mt-0.5">₹1 = 1 Point · Campus meal credits</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("Foodie Credit Points: Earn on campus orders & instant meal refunds! Use during checkout for instant discounts.")}
                  className="px-3.5 py-1.5 rounded-xl font-black text-xs transition-all shadow-xs active:scale-95 border border-orange-200 hover:bg-orange-50"
                  style={{ backgroundColor: '#FFFFFF', color: '#E65100' }}
                >
                  Credits Info
                </button>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Order Menu (Itemized Live Cart) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-sm text-gray-900">Meal Tray</h4>
              <span className="text-[11px] font-bold text-[#E65100] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">{totalCartItems} items</span>
            </div>

            {totalCartItems === 0 ? (
              <div className="text-center py-10 bg-[#FFF8EE] rounded-3xl border border-dashed border-[#F0E6D8]">
                <ShoppingBag className="w-8 h-8 text-[#E65100]/40 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">Your meal tray is empty</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Click + on any dish to add here!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {Object.values(cart).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FFF8EE] border border-[#F0E6D8]">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-white shrink-0 border border-[#F0E6D8]">
                      <img
                        src={getFoodImage(item.name, item.imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs truncate text-gray-900">{item.name}</h5>
                      <span className="text-[10px] text-gray-500 font-bold">x{item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900 block">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-5 h-5 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-black hover:bg-gray-100"
                        >
                          -
                        </button>
                        <button
                          onClick={() => addItem(item, item.vendorId || cartVendorId || vendorId)}
                          className="w-5 h-5 rounded-md bg-[#E65100] text-white flex items-center justify-center text-xs font-black hover:bg-[#D84315]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing Summary & Checkout Button */}
        <div className="pt-4 border-t border-[#F0E6D8] space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span>Campus Delivery &amp; Packaging</span>
            <span className="text-gray-900 font-bold">{formatCurrency(10)}</span>
          </div>

          <div className="flex items-center justify-between text-base font-black text-gray-900">
            <span>Total Payable</span>
            <span className="text-[#E65100] text-xl">
              {formatCurrency(totalCartPrice > 0 ? totalCartPrice + 10 : 0)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => {
              if (totalCartItems === 0) {
                toast.error("Please add dishes to your meal tray before checkout!");
                return;
              }
              setIsCartOpen(true);
            }}
            disabled={totalCartItems === 0}
            className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg ${
              totalCartItems > 0
                ? 'bg-[#E65100] hover:bg-[#D84315] text-white shadow-orange-500/25 active:scale-98 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Place Campus Order ({formatCurrency(totalCartPrice > 0 ? totalCartPrice + 10 : 0)})
          </button>
        </div>
      </aside>

      {/* Mobile / Tablet Floating Cart Bar (visible only when screen < xl and items > 0) */}
      {(totalCartItems > 0 || squadParam) && (
        <div className="fixed bottom-4 left-4 right-4 z-40 xl:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className={`w-full ${squadParam ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-[#E65100] hover:bg-[#D84315] shadow-orange-500/25'} text-white py-3.5 px-5 rounded-2xl flex items-center justify-between shadow-xl font-bold active:scale-98 transition-all`}
          >
            <div className="flex items-center gap-2">
              <span className="bg-white text-[#E65100] px-2 py-0.5 rounded-full text-xs font-black">
                {totalCartItems}
              </span>
              <span className="text-xs uppercase tracking-wider font-black">
                {squadParam ? 'View Squad Tray' : 'View Meal Tray'}
              </span>
            </div>
            <span className="text-sm font-black">
              {formatCurrency(totalCartPrice > 0 ? totalCartPrice + 10 : 0)} &rarr;
            </span>
          </button>
        </div>
      )}

      {/* SlideOver Checkout Drawer */}
      <CartSlideOver
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        squadId={squadParam}
      />

      {/* Cart Conflict Modal */}
      {pendingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white border border-[#F0E6D8] rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <h3 className="text-lg font-black text-gray-900">Start Order from {vendor.vendorName}?</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Your meal tray contains items from another canteen. Clear current tray to order from {vendor.vendorName}?
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setPendingItem(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors"
              >
                Keep Current
              </button>
              <button 
                onClick={() => {
                  useCartStore.getState().clearCart();
                  addItem(pendingItem, vendorId);
                  setPendingItem(null);
                  toast.success(`Cleared meal tray and added ${pendingItem.name}!`);
                }}
                className="flex-1 py-3 bg-[#E65100] hover:bg-[#D84315] text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-orange-500/20"
              >
                Start New Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Reviews Modal */}
      {selectedReviewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white border border-[#F0E6D8] rounded-3xl p-6 max-w-lg w-full space-y-4 text-left shadow-2xl relative max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setSelectedReviewItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="shrink-0 pb-3 border-b border-[#F0E6D8]">
              <span className="text-[10px] font-black uppercase text-[#E65100] tracking-wider">
                {vendor.vendorName}
              </span>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Reviews for {selectedReviewItem.name}</span>
              </h3>
            </div>

            {/* Existing Reviews List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-60">
              {selectedReviewItem.reviews && selectedReviewItem.reviews.length > 0 ? (
                selectedReviewItem.reviews.map((r, i) => (
                  <div key={i} className="bg-[#FFF8EE] p-3.5 rounded-2xl border border-[#F0E6D8]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-gray-900">{r.customerName || 'Campus Student'}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3 h-3 ${r.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-gray-600 italic">&ldquo;{r.comment}&rdquo;</p>}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 text-xs">
                  <p>No written reviews yet for this dish. Be the first to rate it!</p>
                </div>
              )}
            </div>

            {/* Submit New Rating Form */}
            <form onSubmit={handleSubmitReview} className="shrink-0 pt-3 border-t border-[#F0E6D8] space-y-3">
              <span className="text-xs font-black text-gray-900 block">Rate this dish (1–5 Stars)</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewReviewRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star 
                      className={`w-6 h-6 ${newReviewRating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Share your taste, portion, and dining experience..."
                rows={2}
                className="w-full bg-[#FFF8EE] rounded-xl p-3 text-xs border border-[#F0E6D8] outline-none focus:border-[#E65100] text-gray-900"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 bg-[#E65100] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#D84315] transition-all"
              >
                {submittingReview ? 'Submitting...' : 'Post Foodie Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Operating Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white border border-[#F0E6D8] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#E65100]" />
              <span>Weekly Canteen Operating Hours</span>
            </h3>
            <div className="space-y-2 text-xs">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                <div key={d} className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                  <span className="font-bold text-gray-800">{d}</span>
                  <span className="font-black text-[#E65100]">08:30 AM – 09:30 PM</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="w-full py-3 bg-[#E65100] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#D84315]"
            >
              Close Timings
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CanteenStorefrontPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-[#E65100] mb-3" />
        <p className="font-bold text-xs uppercase tracking-widest">Loading Canteen...</p>
      </div>
    }>
      <CanteenStorefrontContent />
    </Suspense>
  );
}
