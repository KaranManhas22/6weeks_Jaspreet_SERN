'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Store, 
  ChevronDown, 
  UtensilsCrossed, 
  Loader2, 
  Star, 
  Clock, 
  User, 
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Bell,
  Settings,
  Sparkles,
  Layers,
  FileText,
  CreditCard,
  Compass,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  X,
  Coffee,
  Pizza,
  Sandwich,
  Cake,
  Drumstick,
  Cookie,
  Check
} from 'lucide-react';
import { api, decodeToken, getToken } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getCanteenScheduleStatus } from '@/lib/schedule';
import { useCartStore } from '@/lib/store/cartStore';
import { CartSlideOver } from '@/components/CartSlideOver';
import { useCurrency } from '@/context/CurrencyContext';
import toast from 'react-hot-toast';

interface University {
  id: string;
  name: string;
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
  discount: {
    percent: number;
    validFrom: string;
    validTo: string;
    effectivePrice: number;
  } | null;
  averageRating?: number;
  reviewCount?: number;
  vendorId?: string;
  vendorName?: string;
}

interface Category {
  categoryId: string;
  categoryName: string;
  items: FoodItem[];
}

interface Vendor {
  vendorId: string;
  vendorName: string;
  vendorLogoUrl: string | null;
  canteenSchedule?: any;
  categories: Category[];
}

export default function GoMealShopPage() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  // User state
  const [userUniName, setUserUniName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Foodie');
  const [userCredits, setUserCredits] = useState<number>(0);
  const [userAddress, setUserAddress] = useState<string>('Campus Delivery - Main Gate');

  // Universities & Vendors
  const [universities, setUniversities] = useState<University[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchUniQuery, setSearchUniQuery] = useState('');
  const [selectedUniId, setSelectedUniId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchFoodQuery, setSearchFoodQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeNav, setActiveNav] = useState('Dashboard');

  // Cart
  const cart = useCartStore((state) => state.items);
  const cartVendorId = useCartStore((state) => state.vendorId);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const totalCartPrice = useCartStore((state) => state.getTotalPrice());
  const [isCartSlideOverOpen, setIsCartSlideOverOpen] = useState(false);

  // Review prompt states
  const [pendingReviewOrder, setPendingReviewOrder] = useState<any | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Categories list with custom GoMeal icons
  const CATEGORIES = [
    { id: 'All', name: 'All Bites', icon: Sparkles },
    { id: 'Bakery', name: 'Bakery', icon: Cookie },
    { id: 'Burger', name: 'Burgers', icon: Sandwich },
    { id: 'Beverage', name: 'Beverages', icon: Coffee },
    { id: 'Meals', name: 'Rice & Meals', icon: Drumstick },
    { id: 'Pizza', name: 'Pizza', icon: Pizza },
    { id: 'Desserts', name: 'Desserts', icon: Cake },
  ];

  // 1. Initial Load: User auth, campus location, reviews
  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = decodeToken<{ universityName?: string; sub?: string; name?: string }>(token);
      if (payload?.universityName) {
        setUserUniName(payload.universityName);
        setSearchUniQuery(payload.universityName);
      }
      if (payload?.name) {
        setUserName(payload.name);
      }

      // Fetch user profile for credits and hostel address
      api.get<any>('/api/auth/me')
        .then((me) => {
          if (me.name) setUserName(me.name);
          const totalC = (me.refundedCredits || 0) + (me.earnedCredits || 0);
          setUserCredits(totalC);
          if (me.university?.name) {
            setUserUniName(me.university.name);
            setSearchUniQuery(me.university.name);
          }
          if (me.hostelRoom || me.address) {
            setUserAddress(me.hostelRoom || me.address);
          }
        })
        .catch(console.error);

      // Check review prompts
      const studentId = payload?.sub;
      if (studentId) {
        Promise.all([
          api.get<any[]>('/api/orders/customer'),
          api.get<any[]>(`/api/reviews?studentId=${studentId}`)
        ]).then(([ordersData, reviewsData]) => {
          const now = Date.now();
          const unreviewedDelivered = ordersData.find(order => {
            if (order.status !== 'Delivered' && order.status !== 'Completed') return false;
            const updatedAtTime = new Date(order.updatedAt || order.createdAt).getTime();
            const timeDiff = now - updatedAtTime;
            const isWithinWindow = timeDiff > 10 * 60 * 1000 && timeDiff < 6 * 60 * 60 * 1000;
            if (!isWithinWindow) return false;
            return !reviewsData.some(rev => rev.orderId === order.id);
          });
          if (unreviewedDelivered) {
            setPendingReviewOrder(unreviewedDelivered);
          }
        }).catch(err => console.error("Error loading review prompt data:", err));
      }
    }

    // Fetch Universities
    async function fetchUnis(lat?: number, lng?: number) {
      try {
        let url = '/api/menu/universities';
        if (lat !== undefined && lng !== undefined) {
          url += `?lat=${lat}&lng=${lng}`;
        }
        const data = await api.get<{ universities: University[] }>(url);
        setUniversities(data.universities);

        if (token) {
          const payload = decodeToken<{ universityName?: string }>(token);
          if (payload?.universityName) {
            const matchedUni = data.universities.find(u => u.name === payload.universityName);
            if (matchedUni) setSelectedUniId(matchedUni.id);
          }
        }
        if (!selectedUniId && data.universities.length > 0) {
          setSelectedUniId(data.universities[0].id);
          setSearchUniQuery(data.universities[0].name);
        }
      } catch (err) {
        console.error('Failed to load universities', err);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchUnis(pos.coords.latitude, pos.coords.longitude),
        () => fetchUnis()
      );
    } else {
      fetchUnis();
    }

    // Click outside handler for dropdown
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Fetch Vendors when campus changes
  useEffect(() => {
    if (!selectedUniId) {
      setVendors([]);
      return;
    }

    async function fetchVendors() {
      setIsLoadingVendors(true);
      setError(null);
      try {
        const data = await api.get<{ vendors: Vendor[] }>(`/api/menu/${selectedUniId}`);
        setVendors(data.vendors || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load canteens');
        setVendors([]);
      } finally {
        setIsLoadingVendors(false);
      }
    }

    fetchVendors();
  }, [selectedUniId]);

  // Flattened food items list with vendor information
  const allDishes = useMemo(() => {
    const list: FoodItem[] = [];
    vendors.forEach((v) => {
      v.categories?.forEach((c) => {
        c.items?.forEach((item) => {
          list.push({
            ...item,
            vendorId: v.vendorId,
            vendorName: v.vendorName,
          });
        });
      });
    });
    return list;
  }, [vendors]);

  // Filtered dishes according to search & category
  const filteredDishes = useMemo(() => {
    return allDishes.filter((dish) => {
      const matchesSearch = !searchFoodQuery.trim() || 
        dish.name.toLowerCase().includes(searchFoodQuery.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchFoodQuery.toLowerCase()) ||
        dish.vendorName?.toLowerCase().includes(searchFoodQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCategory === 'All') return true;
      if (activeCategory === 'Bakery') return /croissant|cake|muffin|bread|cookie|pastry|bake/i.test(dish.name);
      if (activeCategory === 'Burger') return /burger|sandwich|wrap|patty/i.test(dish.name);
      if (activeCategory === 'Beverage') return /tea|coffee|shake|juice|soda|latte|smoothie|coke|water/i.test(dish.name);
      if (activeCategory === 'Meals') return /rice|thali|curry|roti|dal|biryani|paneer|lunch|meal/i.test(dish.name);
      if (activeCategory === 'Pizza') return /pizza|slice|crust/i.test(dish.name);
      if (activeCategory === 'Desserts') return /ice cream|sweet|halwa|gulab|dessert|brownie|lava/i.test(dish.name);

      return true;
    });
  }, [allDishes, searchFoodQuery, activeCategory]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites ❤️');
  };

  const handleQuickAdd = (dish: FoodItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dish.vendorId) return;

    // Check if adding from different vendor
    if (cartVendorId && cartVendorId !== dish.vendorId && Object.keys(cart).length > 0) {
      if (confirm("Adding this item will start a new order from this canteen. Clear current cart?")) {
        addItem(dish, dish.vendorId);
        toast.success(`Started new order with ${dish.name}!`);
      }
      return;
    }

    addItem(dish, dish.vendorId);
    toast.success(`Added ${dish.name} to tray!`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingReviewOrder) return;
    setSubmittingReview(true);
    try {
      await api.post('/api/reviews', {
        type: 'Canteen',
        canteenId: pendingReviewOrder.vendorId,
        orderId: pendingReviewOrder.id,
        rating,
        comment: comment.trim()
      });
      toast.success("Thank you for your rating!");
      setPendingReviewOrder(null);
      setShowReviewModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredUnis = (searchUniQuery === userUniName || searchUniQuery.trim() === "") 
    ? universities 
    : universities.filter(u => u.name.toLowerCase().includes(searchUniQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0E17] text-gray-900 dark:text-gray-100 flex flex-col xl:flex-row font-sans selection:bg-amber-400 selection:text-gray-900">
      
      {/* ── 1. LEFT SIDEBAR NAVIGATION (GoMeal Style) ────────────────────── */}
      <aside className="w-full xl:w-64 bg-white dark:bg-[#111622] border-r border-gray-200/80 dark:border-gray-800/80 shrink-0 p-5 flex flex-col justify-between z-20">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-gray-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  Go<span className="text-amber-500">Meal</span><span className="text-amber-500">.</span>
                </span>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Campus Food Portal</span>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {[
              { id: 'Dashboard', label: 'Dashboard', icon: Layers, href: '/shop' },
              { id: 'Food Order', label: 'Canteens', icon: Store, href: '/shop' },
              { id: 'Favorite', label: 'Favorites', icon: Heart, count: favorites.length },
              { id: 'Order History', label: 'Order History', icon: FileText, href: '/shop/orders' },
              { id: 'Bills', label: 'Campus Wallet', icon: CreditCard, count: `₹${userCredits}` },
              { id: 'Setting', label: 'Settings', icon: Settings, href: '/shop/profile' },
            ].map((item) => {
              const isActive = activeNav === item.id;
              const Icon = item.icon;

              const content = (
                <div
                  onClick={() => setActiveNav(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-gray-950 shadow-md shadow-amber-400/20'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-gray-950 stroke-[2.5]' : 'stroke-2'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-gray-950 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
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

        {/* Upgrade / Voucher Promo Box at Bottom of Sidebar */}
        <div className="mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 p-5 text-gray-950 shadow-lg shadow-amber-500/15">
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-gray-950 fill-current" />
            </div>
            <h4 className="font-extrabold text-sm leading-snug">Upgrade your Account</h4>
            <p className="text-[11px] font-medium text-gray-900/80 mt-1 mb-4 leading-relaxed">
              Unlock campus student vouchers, zero delivery charges & fast checkout!
            </p>
            <button 
              onClick={() => toast.success("Student VIP Pass activated on your campus account!")}
              className="w-full bg-white text-gray-950 font-black text-xs py-2.5 rounded-xl hover:bg-gray-100 transition-all shadow-sm active:scale-95"
            >
              Get Voucher
            </button>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />
        </div>
      </aside>

      {/* ── 2. CENTER CONTENT (Browse, Categories, Dishes & Canteens) ───── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              Hello, {userName} <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Ready to grab lunch? Choose your favorite canteen or order ahead.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Campus Selector Combobox */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 shadow-sm hover:border-amber-400 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {universities.find(u => u.id === selectedUniId)?.name || 'Select Campus'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
              </button>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 py-1.5">Campuses</p>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {filteredUnis.map((uni) => (
                      <button
                        key={uni.id}
                        onClick={() => {
                          setSelectedUniId(uni.id);
                          setUserUniName(uni.name);
                          setShowDropdown(false);
                          toast.success(`Switched to ${uni.name}`);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                          selectedUniId === uni.id 
                            ? 'bg-amber-400 text-gray-950' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="truncate">{uni.name}</span>
                        {selectedUniId === uni.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle & Profile link */}
            <ThemeToggle />
            <Link
              href="/shop/profile"
              className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 flex items-center justify-center font-black text-sm hover:scale-105 transition-transform"
              title="Profile"
            >
              {userName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchFoodQuery}
            onChange={(e) => setSearchFoodQuery(e.target.value)}
            placeholder="What do you want to eat today? Search burgers, wraps, shakes, biryani..."
            className="w-full bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all shadow-xs"
          />
          {searchFoodQuery && (
            <button 
              onClick={() => setSearchFoodQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── PROMOTIONAL VOUCHER BANNER (GoMeal Signature) ─────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 p-6 sm:p-8 mb-8 text-gray-950 shadow-xl shadow-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl z-10 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white/40 text-gray-950 font-black text-[10px] uppercase tracking-wider mb-3">
              Campus Specials Today
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Get Discount Voucher <br className="hidden sm:inline" /> Up To 20% Off!
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-950/80 mt-2 max-w-md">
              Order fresh canteen favorites across campus. Skip waiting lines and pick up right when ready!
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-gray-950 text-white rounded-xl text-xs font-bold">Code: CAMPUS20</span>
              <span className="px-3 py-1 bg-white/60 text-gray-950 rounded-xl text-xs font-bold">100% Online UPI</span>
            </div>
          </div>

          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/30 backdrop-blur-md p-3 shadow-inner flex items-center justify-center animate-pulse">
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
                alt="Delicious Burger"
                className="w-full h-full object-cover rounded-full shadow-lg"
              />
            </div>
          </div>
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ── CATEGORY PILLS STRIP (GoMeal Style) ────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Category</h3>
            <span className="text-xs font-bold text-amber-500 cursor-pointer hover:underline">View all &gt;</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex flex-col items-center justify-center min-w-[88px] sm:min-w-[100px] h-24 rounded-2xl p-2 transition-all border ${
                    isSelected
                      ? 'bg-amber-400 text-gray-950 border-amber-400 shadow-md shadow-amber-400/20 -translate-y-1'
                      : 'bg-white dark:bg-[#111622] text-gray-600 dark:text-gray-300 border-gray-200/80 dark:border-gray-800/80 hover:border-amber-400/50 hover:bg-amber-50/30 dark:hover:bg-amber-400/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    isSelected ? 'bg-gray-950 text-white' : 'bg-gray-100 dark:bg-gray-800 text-amber-500'
                  }`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-extrabold tracking-tight truncate max-w-full">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── POPULAR DISHES GRID (GoMeal 3-Column Card Layout) ───────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Popular Dishes</h3>
              <p className="text-xs text-gray-400 font-medium">Top student-rated campus meals ready for quick order</p>
            </div>
            <span className="text-xs font-bold text-amber-500 cursor-pointer hover:underline">View all &gt;</span>
          </div>

          {filteredDishes.length === 0 ? (
            <div className="bg-white dark:bg-[#111622] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-10 text-center text-gray-400">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-500" />
              <p className="font-bold text-sm">No dishes match your filter</p>
              <p className="text-xs mt-1">Try clearing your search or switching categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {filteredDishes.slice(0, 6).map((dish) => {
                const isFav = favorites.includes(dish.id);

                return (
                  <div
                    key={dish.id}
                    className="bg-white dark:bg-[#111622] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-4.5 shadow-sm hover:shadow-xl hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges: Discount Pill + Heart */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white tracking-wider uppercase">
                          {dish.discount ? `${dish.discount.percent}% Off` : '15% Off'}
                        </span>
                        <button
                          onClick={(e) => toggleFavorite(dish.id, e)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                        </button>
                      </div>

                      {/* Dish Image */}
                      <div className="w-full h-36 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 relative flex items-center justify-center">
                        {dish.imageUrl ? (
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <UtensilsCrossed className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        )}
                        {dish.vendorName && (
                          <span className="absolute bottom-2 left-2 bg-gray-950/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-lg">
                            {dish.vendorName}
                          </span>
                        )}
                      </div>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 ml-1">
                          {dish.averageRating ? dish.averageRating.toFixed(1) : '4.9'}
                        </span>
                      </div>

                      {/* Dish Title */}
                      <h4 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                        {dish.name}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5 font-medium">
                        {dish.description || 'Prepared fresh with campus quality ingredients'}
                      </p>
                    </div>

                    {/* Price and Yellow Plus Button */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-400 block leading-none">Price</span>
                        <span className="text-base font-black text-gray-900 dark:text-white">
                          {formatCurrency(dish.price)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(dish, e)}
                        className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20 active:scale-95 transition-all"
                        title="Add to tray"
                      >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CAMPUS CANTEENS SHOWCASE (With Live Timings) ───────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Campus Canteens</h3>
              <p className="text-xs text-gray-400 font-medium">Browse verified dining spots at {universities.find(u => u.id === selectedUniId)?.name || 'your campus'}</p>
            </div>
          </div>

          {isLoadingVendors ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400 font-medium text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span>Fetching campus canteens...</span>
            </div>
          ) : vendors.length === 0 ? (
            <div className="bg-white dark:bg-[#111622] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 text-center text-gray-400">
              <Store className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-500" />
              <p className="font-bold">No canteens listed yet for this campus</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vendors.map((v) => {
                const schedule = getCanteenScheduleStatus(v.canteenSchedule);

                return (
                  <div
                    key={v.vendorId}
                    onClick={() => router.push(`/shop/${v.vendorId}`)}
                    className="bg-white dark:bg-[#111622] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 hover:border-amber-400/50 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3.5 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 overflow-hidden flex items-center justify-center shrink-0">
                          {v.vendorLogoUrl ? (
                            <img src={v.vendorLogoUrl} alt={v.vendorName} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-6 h-6 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-base text-gray-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                            {v.vendorName}
                          </h4>
                          <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">{universities.find(u => u.id === selectedUniId)?.name}</span>
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${schedule.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              schedule.isOpen 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}>
                              {schedule.isOpen ? 'Open Now' : 'Closed (Pre-Order)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Canteen Stats */}
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-2.5 text-center text-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Menu Categories</span>
                          <span className="font-extrabold text-gray-800 dark:text-gray-200">{v.categories?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Total Items</span>
                          <span className="font-extrabold text-gray-800 dark:text-gray-200">
                            {v.categories?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
                      <span>Explore Canteen Menu</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RECENT ORDER STRIP (GoMeal Bottom Row) ─────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Recent Campus Favorites</h3>
            <span className="text-xs font-bold text-amber-500 cursor-pointer hover:underline">View all &gt;</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {allDishes.slice(3, 7).map((dish) => (
              <div 
                key={dish.id}
                onClick={(e) => handleQuickAdd(dish, e)}
                className="bg-white dark:bg-[#111622] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-3 flex items-center gap-3 hover:border-amber-400 cursor-pointer transition-all shadow-xs"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                  {dish.imageUrl ? (
                    <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                  ) : (
                    <UtensilsCrossed className="w-5 h-5 text-gray-400 m-auto mt-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs truncate text-gray-900 dark:text-white">{dish.name}</h5>
                  <p className="text-[11px] font-black text-amber-500">{formatCurrency(dish.price)}</p>
                </div>
                <div className="w-6 h-6 rounded-lg bg-amber-400 text-gray-950 flex items-center justify-center font-black text-xs shrink-0">
                  +
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── 3. RIGHT SIDEBAR (GoMeal Sticky Order & Checkout Panel) ───────── */}
      <aside className="w-full xl:w-80 bg-white dark:bg-[#111622] border-l border-gray-200/80 dark:border-gray-800/80 shrink-0 p-5 flex flex-col justify-between z-20">
        <div>
          {/* User Profile Mini Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-gray-950 font-black text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-black text-sm text-gray-900 dark:text-white leading-none">{userName}</h4>
                <span className="text-[10px] font-bold text-gray-400">Campus Foodie</span>
              </div>
            </div>
            <Link href="/shop/orders" className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-amber-500 transition-colors" title="Notifications">
              <Bell className="w-4 h-4" />
            </Link>
          </div>

          {/* Your Balance Card */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-4 text-gray-950 shadow-md shadow-amber-500/15 mb-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-950/70 block mb-1">Your Balance</span>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight">{formatCurrency(userCredits)}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("Use Campus Cash or UPI during checkout!")}
                  className="px-3 py-1.5 rounded-xl bg-gray-950 text-white text-[11px] font-bold hover:bg-gray-900 transition-all shadow-xs"
                >
                  Top Up
                </button>
              </div>
            </div>
          </div>

          {/* Your Address */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" /> Your Address
              </span>
              <button 
                onClick={() => {
                  const newAddr = prompt("Enter your campus hostel block or room #:", userAddress);
                  if (newAddr) setUserAddress(newAddr);
                }}
                className="text-[11px] font-bold text-amber-500 hover:underline"
              >
                Change
              </button>
            </div>
            <p className="font-bold text-xs text-gray-800 dark:text-gray-200 line-clamp-1">{userAddress}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <button 
                onClick={() => toast.success("Added landmark to order!")}
                className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              >
                Add Details
              </button>
              <button 
                onClick={() => toast.success("Delivery note saved!")}
                className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              >
                Add Note
              </button>
            </div>
          </div>

          {/* Order Menu (Itemized Live Cart) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-sm text-gray-900 dark:text-white">Order Menu</h4>
              <span className="text-[11px] font-bold text-gray-400">{totalCartItems} items</span>
            </div>

            {totalCartItems === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">Your meal tray is empty</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Click + on any dish to add here!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {Object.values(cart).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <UtensilsCrossed className="w-4 h-4 text-gray-400 m-auto mt-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs truncate text-gray-900 dark:text-white">{item.name}</h5>
                      <span className="text-[10px] text-gray-400">x{item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900 dark:text-white block">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-black"
                        >
                          -
                        </button>
                        <button
                          onClick={() => addItem(item, item.vendorId || cartVendorId || '')}
                          className="w-5 h-5 rounded-md bg-amber-400 text-gray-950 flex items-center justify-center text-xs font-black"
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
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span>Service &amp; Campus Delivery</span>
            <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(10)}</span>
          </div>

          <div className="flex items-center justify-between text-base font-black text-gray-900 dark:text-white">
            <span>Total</span>
            <span className="text-amber-500 text-lg">
              {formatCurrency(totalCartPrice > 0 ? totalCartPrice + 10 : 0)}
            </span>
          </div>

          {/* Coupon Code Input */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span className="text-gray-500 dark:text-gray-400">Have a coupon code?</span>
            <span className="text-amber-500 font-extrabold">&gt;</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => {
              if (totalCartItems === 0) {
                toast.error("Please add items to your tray before checkout!");
                return;
              }
              setIsCartSlideOverOpen(true);
            }}
            disabled={totalCartItems === 0}
            className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg ${
              totalCartItems > 0
                ? 'bg-amber-400 hover:bg-amber-500 text-gray-950 shadow-amber-400/25 active:scale-98 cursor-pointer'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            Checkout ({formatCurrency(totalCartPrice > 0 ? totalCartPrice + 10 : 0)})
          </button>
        </div>
      </aside>

      {/* Complete Checkout Flow SlideOver (Online UPI QR, Scheduling, Address) */}
      <CartSlideOver
        isOpen={isCartSlideOverOpen}
        onClose={() => setIsCartSlideOverOpen(false)}
      />

      {/* Review Modal if prompt active */}
      {showReviewModal && pendingReviewOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111622] rounded-3xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-gray-900 dark:text-white">Rate your Food Experience</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star className={`w-8 h-8 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the taste and packaging?"
                rows={3}
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-sm border border-gray-200 dark:border-gray-700 outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-amber-400 text-gray-950 font-black py-3 rounded-2xl shadow-md hover:bg-amber-500"
              >
                {submittingReview ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
