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
  ChefHat,
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
  Check,
  Award
} from 'lucide-react';
import { api, decodeToken, getToken } from '@/lib/api';
import { getFoodImage } from '@/lib/imageHelper';
import { getCanteenScheduleStatus } from '@/lib/schedule';
import { useCartStore } from '@/lib/store/cartStore';
import { CartSlideOver } from '@/components/CartSlideOver';
import { PromoBannerCarousel } from '@/components/PromoBannerCarousel';
import { useCurrency } from '@/context/CurrencyContext';
import toast from 'react-hot-toast';

interface University {
  id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
}

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isVegetarian: boolean;
  categoryName?: string;
  vendorId?: string;
  vendorName?: string;
  averageRating?: number;
  discount?: {
    percent: number;
    effectivePrice: number;
  } | null;
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

export default function FoodzieShopPage() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('Foodie');
  const [userUniName, setUserUniName] = useState('Sant Baba Bhag Singh University');
  const [userCredits, setUserCredits] = useState(9132);

  // University state
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniId, setSelectedUniId] = useState<string>('');
  const [searchUniQuery, setSearchUniQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Data states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [allDishes, setAllDishes] = useState<FoodItem[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchFoodQuery, setSearchFoodQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under50' | '50-100' | '100+'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeNav, setActiveNav] = useState('Campus Canteens');

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

  // Dynamic time-of-day greeting (morning / afternoon / evening)
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return { text: 'Good morning', meal: 'breakfast' };
    if (hour >= 12 && hour < 17) return { text: 'Good afternoon', meal: 'lunch' };
    return { text: 'Good evening', meal: 'dinner' };
  }, []);

  // 1. Initial Load: User auth, campus location, reviews
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);

    const payload = decodeToken<{ universityName?: string; sub?: string; name?: string }>(token);
    if (payload?.universityName) {
      setUserUniName(payload.universityName);
      setSearchUniQuery(payload.universityName);
    }
    if (payload?.name) {
      setUserName(payload.name);
    }

    // Fetch user profile for credits
    api.get<any>('/api/auth/me')
      .then((me) => {
        if (me.name) setUserName(me.name);
        const totalC = (me.refundedCredits || 0) + (me.earnedCredits || 0);
        if (totalC > 0) setUserCredits(totalC);
        if (me.university?.name) {
          setUserUniName(me.university.name);
          setSearchUniQuery(me.university.name);
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
          setShowReviewModal(true);
        }
      }).catch(console.error);
    }
  }, []);

  // 2. Fetch Universities list
  useEffect(() => {
    if (isAuthenticated === false) return;

    api.get<any>('/api/universities')
      .then((res) => {
        const data: University[] = Array.isArray(res) ? res : (res?.universities || []);
        setUniversities(data);
        if (data.length > 0) {
          const matched = data.find(u => 
            u.name.toLowerCase().includes(userUniName.toLowerCase()) || 
            userUniName.toLowerCase().includes(u.name.toLowerCase())
          );
          if (matched) {
            setSelectedUniId(matched.id);
            setSearchUniQuery(matched.name);
          } else {
            setSelectedUniId(data[0].id);
            setSearchUniQuery(data[0].name);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch universities:', err);
        setError('Failed to load universities');
      });
  }, [userUniName, isAuthenticated]);

  // 3. Geolocation Campus Detection
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let nearestUni = universities[0];
        let minDistance = Infinity;

        universities.forEach((uni) => {
          if (uni.latitude && uni.longitude) {
            const dist = Math.hypot(uni.latitude - latitude, uni.longitude - longitude);
            if (dist < minDistance) {
              minDistance = dist;
              nearestUni = uni;
            }
          }
        });

        if (nearestUni) {
          setSelectedUniId(nearestUni.id);
          setSearchUniQuery(nearestUni.name);
          toast.success(`Campus detected: ${nearestUni.name}`);
        }
        setIsDetectingLocation(false);
      },
      (error) => {
        console.warn('Location detection error:', error);
        toast.error('Could not detect GPS location. Showing enrolled university.');
        setIsDetectingLocation(false);
      },
      { timeout: 7000 }
    );
  };

  // 4. Load Canteens & Dishes when university changes
  useEffect(() => {
    if (!selectedUniId) return;

    setIsLoadingVendors(true);
    setError(null);

    api.get<any>(`/api/menu/${selectedUniId}`)
      .then((data) => {
        const vendorList: Vendor[] = Array.isArray(data) ? data : (data?.vendors || []);
        setVendors(vendorList);
        
        // Flatten dishes across all canteens
        const dishes: FoodItem[] = [];
        vendorList.forEach((v) => {
          v.categories?.forEach((cat) => {
            cat.items?.forEach((item) => {
              dishes.push({
                ...item,
                categoryName: cat.categoryName,
                vendorId: v.vendorId,
                vendorName: v.vendorName,
                averageRating: 4.8 + (Math.random() * 0.2),
              });
            });
          });
        });

        setAllDishes(dishes);
        setIsLoadingVendors(false);
      })
      .catch((err) => {
        console.error('Failed to load campus canteens:', err);
        setError('Failed to load canteens for this campus');
        setIsLoadingVendors(false);
      });
  }, [selectedUniId]);

  // Filtered & Sorted Dishes
  const filteredDishes = useMemo(() => {
    let list = allDishes.filter((dish) => {
      // Search query
      if (searchFoodQuery.trim()) {
        const q = searchFoodQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(q);
        const matchesDesc = dish.description?.toLowerCase().includes(q);
        const matchesCanteen = dish.vendorName?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCanteen) return false;
      }

      // Category filter
      if (activeCategory !== 'All') {
        const catName = dish.categoryName?.toLowerCase() || '';
        const dishName = dish.name.toLowerCase();
        if (activeCategory === 'Bakery' && !catName.includes('bake') && !dishName.includes('puff') && !dishName.includes('donut') && !dishName.includes('pastry')) return false;
        if (activeCategory === 'Burger' && !catName.includes('burger') && !dishName.includes('burger') && !dishName.includes('sandwich')) return false;
        if (activeCategory === 'Beverage' && !catName.includes('drink') && !catName.includes('beverage') && !dishName.includes('tea') && !dishName.includes('coffee') && !dishName.includes('shake')) return false;
        if (activeCategory === 'Meals' && !catName.includes('meal') && !catName.includes('lunch') && !dishName.includes('thali') && !dishName.includes('rice') && !dishName.includes('dal') && !dishName.includes('dosa')) return false;
        if (activeCategory === 'Pizza' && !catName.includes('pizza') && !dishName.includes('pizza')) return false;
        if (activeCategory === 'Desserts' && !catName.includes('dessert') && !catName.includes('sweet') && !dishName.includes('gulab') && !dishName.includes('ice cream')) return false;
      }

      // Dietary filter
      if (dietaryFilter === 'veg' && !dish.isVegetarian) return false;
      if (dietaryFilter === 'non-veg' && dish.isVegetarian) return false;

      // Price filter
      if (priceFilter === 'under50' && dish.price >= 50) return false;
      if (priceFilter === '50-100' && (dish.price < 50 || dish.price > 100)) return false;
      if (priceFilter === '100+' && dish.price <= 100) return false;

      return true;
    });

    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list.sort((a, b) => (b.averageRating || 4.5) - (a.averageRating || 4.5));

    return list;
  }, [allDishes, searchFoodQuery, activeCategory, dietaryFilter, priceFilter, sortBy]);

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

    if (cartVendorId && cartVendorId !== dish.vendorId && Object.keys(cart).length > 0) {
      if (confirm("Adding this item will start a new order from this canteen. Clear current cart?")) {
        addItem(dish, dish.vendorId);
        toast.success(`Started new order with ${dish.name}!`);
      }
      return;
    }

    addItem(dish, dish.vendorId);
    toast.success(`Added ${dish.name} to meal tray!`);
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

  // Unauthenticated Barrier
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
          Sign in to view live canteen menus across your university campus
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-3 max-w-md">
          Foodzie serves colleges and universities worldwide. Sign in or create an account to discover campus dining spots, browse live menus, and place orders.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
          <Link
            href="/login?redirect=/shop"
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-[#E65100] hover:bg-[#D84315] text-white font-black text-sm shadow-lg shadow-orange-500/25 transition-all text-center"
          >
            Sign In
          </Link>
          <Link
            href="/signup?redirect=/shop"
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-white border border-gray-200 text-gray-900 font-black text-sm hover:bg-gray-50 transition-all text-center"
          >
            Create Account
          </Link>
        </div>
        <Link href="/" className="mt-6 text-xs font-bold text-gray-400 hover:text-[#E65100] transition-colors">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2C2723] flex flex-col xl:flex-row h-screen overflow-hidden font-sans">
      
      {/* ── 1. LEFT SIDEBAR (Sticky, Never Scrolls with Main Feed) ───────── */}
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

          {/* Navigation Links: Removed redundant Dashboard tab, Canteens is primary */}
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

        {/* Upgrade / Student Pass Box at Bottom of Sidebar */}
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
              onClick={() => toast.success("Student Campus Pass activated on your profile!")}
              className="w-full bg-white text-[#E65100] font-black text-xs py-2.5 rounded-xl hover:bg-orange-50 transition-all shadow-sm active:scale-95"
            >
              Get Campus Pass
            </button>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />
        </div>
      </aside>

      {/* ── 2. CENTER CONTENT (Middle Part Scrolls Independently) ───────── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen max-w-full scroll-smooth">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {timeGreeting.text}, {userName}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Ready to grab {timeGreeting.meal}? Choose your favorite campus canteen or order ahead.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Campus Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-white border border-[#F0E6D8] px-3.5 py-2 rounded-2xl shadow-xs hover:border-[#E65100]/40 transition-all text-xs font-bold text-gray-800"
              >
                <MapPin className="w-3.5 h-3.5 text-[#E65100] shrink-0" />
                <span className="max-w-[170px] truncate">
                  {universities.find(u => u.id === selectedUniId)?.name || userUniName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#F0E6D8] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2 bg-[#FFF8EE] px-3 py-1.5 rounded-xl mb-2">
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={searchUniQuery}
                      onChange={(e) => setSearchUniQuery(e.target.value)}
                      placeholder="Search university..."
                      className="bg-transparent text-xs w-full focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
                    />
                  </div>

                  <button
                    onClick={detectLocation}
                    disabled={isDetectingLocation}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-orange-50 text-[#E65100] text-xs font-bold hover:bg-orange-100 transition-colors mb-2"
                  >
                    {isDetectingLocation ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Detecting campus...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-3.5 h-3.5" />
                        <span>Use My Current Location</span>
                      </>
                    )}
                  </button>

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredUnis.length === 0 ? (
                      <p className="text-[11px] text-gray-400 text-center py-2">No matching university</p>
                    ) : (
                      filteredUnis.map((uni) => (
                        <div
                          key={uni.id}
                          onClick={() => {
                            setSelectedUniId(uni.id);
                            setSearchUniQuery(uni.name);
                            setShowDropdown(false);
                            toast.success(`Switched to ${uni.name}`);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                            selectedUniId === uni.id 
                              ? 'bg-orange-500/10 text-[#E65100] font-black' 
                              : 'hover:bg-[#FFF8EE] text-gray-700'
                          }`}
                        >
                          <span className="truncate">{uni.name}</span>
                          {selectedUniId === uni.id && <Check className="w-3 h-3 text-[#E65100]" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Quick-link */}
            <Link
              href="/shop/profile"
              className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#E65100] border border-orange-500/20 flex items-center justify-center font-black text-sm hover:scale-105 transition-transform"
              title="User Profile"
            >
              {userName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>

        {/* Global Food Search Bar */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFoodQuery}
            onChange={(e) => setSearchFoodQuery(e.target.value)}
            placeholder="What do you want to eat today? Search burgers, wraps, shakes, biryani, thalis..."
            className="w-full bg-white border border-[#F0E6D8] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-[#E65100] transition-all shadow-xs"
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

        {/* ── PROMOTIONAL SLIDESHOW BANNER (Multiple Discounts in Slideshow) ─ */}
        <PromoBannerCarousel />

        {/* ── 🌟 CAMPUS CANTEENS SHOWCASE (SHOWN FIRST!) ─────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Store className="w-5 h-5 text-[#E65100]" />
                <span>Campus Canteens &amp; Dining Spots</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Verified canteens active at {universities.find(u => u.id === selectedUniId)?.name || userUniName}
              </p>
            </div>
            <span className="text-xs font-bold text-[#E65100] cursor-pointer hover:underline">View all {vendors.length} spots &gt;</span>
          </div>

          {isLoadingVendors ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400 font-medium text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-[#E65100]" />
              <span>Fetching campus canteens...</span>
            </div>
          ) : vendors.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center text-gray-400">
              <Store className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#E65100]" />
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
                    className="bg-white border border-[#F0E6D8] rounded-3xl p-5 hover:border-[#E65100]/60 hover:shadow-[0_12px_32px_rgba(230,81,0,0.12)] transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden shadow-[0_4px_20px_rgba(230,81,0,0.05)]"
                  >
                    {/* Top ambient color shade */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-start gap-3.5 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#F0E6D8] p-1 shadow-md overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {v.vendorLogoUrl ? (
                            <img src={v.vendorLogoUrl} alt={v.vendorName} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Store className="w-6 h-6 text-[#E65100]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-base text-gray-900 truncate group-hover:text-[#E65100] transition-colors">
                            {v.vendorName}
                          </h4>
                          <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#E65100] shrink-0" />
                            <span className="truncate">{universities.find(u => u.id === selectedUniId)?.name || 'SBBSU Campus'}</span>
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${schedule.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              schedule.isOpen 
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {schedule.isOpen ? 'Open Now' : 'Closed (Pre-Order)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Canteen Stats & Tags */}
                      <div className="grid grid-cols-2 gap-2 bg-[#FFF8EE] rounded-2xl p-2.5 text-center text-xs border border-[#F0E6D8]/60 mb-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-500 block">Menu Categories</span>
                          <span className="font-extrabold text-gray-900">{v.categories?.length || 4} Sections</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-500 block">Total Items</span>
                          <span className="font-extrabold text-gray-900">
                            {v.categories?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 18}+ Dishes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 pt-3 border-t border-[#F0E6D8] flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>4.9</span>
                        <span className="text-gray-400">(120+ reviews)</span>
                      </div>
                      <span className="text-xs font-black text-[#E65100] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Order Now &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CATEGORY PILLS STRIP (GoMeal Style) ────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Category Filters</h3>
            <span className="text-xs font-bold text-[#E65100] cursor-pointer hover:underline">View all &gt;</span>
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
                      ? 'bg-gradient-to-b from-[#E65100] to-[#D84315] text-white border-[#E65100] shadow-md shadow-orange-500/25 -translate-y-1'
                      : 'bg-white text-gray-700 border-[#F0E6D8] hover:border-[#E65100]/50 hover:bg-[#FFF8EE]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FFF8EE] text-[#E65100]'
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

        {/* ── FILTER & SORT STRIP (Dietary, Price & Sorting) ─────────── */}
        <div className="mb-6 bg-white border border-[#F0E6D8] rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
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

        {/* ── 🍽️ POPULAR & RECOMMENDED DISHES (SHOWN AFTER CANTEENS!) ────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-[#E65100]" />
                <span>Recommended Dishes</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">Top student-rated campus meals ready for quick order</p>
            </div>
            <span className="text-xs font-bold text-[#E65100] cursor-pointer hover:underline">View all &gt;</span>
          </div>

          {filteredDishes.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center text-gray-400">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#E65100]" />
              <p className="font-bold text-sm">No dishes match your filter</p>
              <p className="text-xs mt-1">Try clearing your search or switching categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDishes.slice(0, 6).map((dish) => {
                const isFav = favorites.includes(dish.id);

                return (
                  <div
                    key={dish.id}
                    className="bg-white border border-[#F0E6D8] rounded-3xl p-5 shadow-[0_4px_20px_rgba(230,81,0,0.06)] hover:shadow-[0_12px_32px_rgba(230,81,0,0.12)] hover:border-[#E65100]/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges: Discount Pill + Canteen Venue Badge + Heart */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#E65100] text-white tracking-wider uppercase shadow-xs">
                            {dish.discount ? `${dish.discount.percent}% Off` : '15% Off'}
                          </span>
                          {dish.vendorName && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FFF8EE] text-[#E65100] border border-[#F0E6D8] truncate max-w-[130px] flex items-center gap-1">
                              <Store className="w-2.5 h-2.5 shrink-0" />
                              <span>{dish.vendorName}</span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(dish.id, e)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-rose-50 transition-colors shrink-0"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                        </button>
                      </div>

                      {/* Dish Image */}
                      <div className="w-full h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFF8EE] to-[#F5EBE1] mb-3 relative flex items-center justify-center shadow-inner">
                        <img
                          src={getFoodImage(dish.name, dish.imageUrl)}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 mb-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-xs font-bold text-gray-700 ml-1">
                          {dish.averageRating ? dish.averageRating.toFixed(1) : '4.9'}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-1 font-medium">(24 reviews)</span>
                      </div>

                      {/* Dish Title & Description with generous margins */}
                      <h4 className="font-extrabold text-base text-gray-900 line-clamp-1 group-hover:text-[#E65100] transition-colors">
                        {dish.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed font-medium">
                        {dish.description || 'Prepared fresh with campus quality ingredients by vendor chefs.'}
                      </p>
                    </div>

                    {/* Price and Add Button with ample internal margins */}
                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-[#F0E6D8] px-1">
                      <div>
                        <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider leading-none mb-0.5">Campus Price</span>
                        <span className="text-lg font-black text-gray-900">
                          {formatCurrency(dish.price)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(dish, e)}
                        className="w-10 h-10 rounded-2xl bg-[#E65100] hover:bg-[#D84315] text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 active:scale-95 hover:scale-105 transition-all"
                        title="Add to meal tray"
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

        {/* ── RECENT CAMPUS ORDERS / BOTTOM SHOWCASE ───────────────────── */}
        <div className="mb-6">
          <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Popular Campus Snacks</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {allDishes.slice(3, 7).map((dish) => (
              <div 
                key={dish.id}
                onClick={(e) => handleQuickAdd(dish, e)}
                className="bg-white border border-[#F0E6D8] rounded-2xl p-3 flex items-center gap-3 hover:border-[#E65100] cursor-pointer transition-all shadow-xs"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#FFF8EE]">
                  <img
                    src={getFoodImage(dish.name, dish.imageUrl)}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs truncate text-gray-900">{dish.name}</h5>
                  <p className="text-[11px] font-black text-[#E65100]">{formatCurrency(dish.price)}</p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-[#E65100] text-white flex items-center justify-center font-black text-xs shrink-0">
                  +
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── 3. RIGHT SIDEBAR (GoMeal Sticky Order & Checkout Panel) ───────── */}
      <aside className="w-full xl:w-84 bg-white border-l border-[#F0E6D8] shrink-0 p-5 flex flex-col justify-between sticky top-0 h-screen overflow-y-auto z-20">
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

          {/* Foodie Credit Points Card: High contrast black/orange light theme button */}
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
                          onClick={() => addItem(item, item.vendorId || cartVendorId || '')}
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
              setIsCartSlideOverOpen(true);
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

      {/* Complete Checkout Flow SlideOver (Online UPI QR, Scheduling, Address) */}
      <CartSlideOver
        isOpen={isCartSlideOverOpen}
        onClose={() => setIsCartSlideOverOpen(false)}
      />

      {/* Review Modal if prompt active */}
      {showReviewModal && pendingReviewOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#F0E6D8] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-gray-900">Rate your Food Experience</h3>
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
                className="w-full bg-[#FFF8EE] rounded-2xl p-3 text-sm border border-[#F0E6D8] outline-none focus:border-[#E65100] text-gray-900"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-[#E65100] text-white font-black py-3 rounded-2xl shadow-md hover:bg-[#D84315]"
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
