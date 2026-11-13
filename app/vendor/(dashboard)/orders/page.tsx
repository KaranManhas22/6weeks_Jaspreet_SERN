'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { io, Socket } from 'socket.io-client';
import { api, getToken } from '@/lib/api';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Bell, 
  User, 
  Receipt,
  Loader2,
  AlertCircle,
  Play,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Bike,
  Sparkles,
  Calendar,
  Eye,
  Check
} from 'lucide-react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const TrackingMap = dynamic(() => import('@/components/TrackingMap'), { ssr: false });

interface OrderItem {
  id: string;
  foodItemId: string;
  quantity: number;
  priceAtTime: number;
  foodItem: {
    name: string;
    imageUrl: string | null;
  };
}

interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'OutForDelivery' | 'Completed' | 'Cancelled';
  paymentReceived: boolean;
  createdAt: string;
  deliveryAddress: string;
  isCOD: boolean;
  appliedCredits?: number;
  scheduledTime?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  deliveryPerson?: {
    id: string;
    name: string;
    phone?: string;
  } | null;
  items: OrderItem[];
}

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

// Generate consistent token code and badge color for orders like Bitepoint (A4, B2, TA, etc.)
function getOrderBadge(order: Order, index: number) {
  const isTakeaway = !order.deliveryAddress || order.deliveryAddress.toLowerCase().includes('counter') || order.deliveryAddress.toLowerCase().includes('takeaway');
  if (isTakeaway) {
    return { code: `TA${index % 10 || 1}`, color: 'bg-amber-400 text-gray-950 font-black' };
  }
  const prefixes = ['A', 'B', 'C', 'D'];
  const colors = [
    'bg-[#104F55] text-white',
    'bg-[#19647E] text-white',
    'bg-[#28536B] text-white',
    'bg-[#1D2D44] text-white',
  ];
  const char = prefixes[index % prefixes.length];
  const num = (index % 9) + 1;
  const color = colors[index % colors.length];
  return { code: `${char}${num}`, color };
}

export default function BitepointVendorOrdersPage() {
  const { formatCurrency } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riderCoords, setRiderCoords] = useState<Record<string, { lat: number; lng: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'on_process' | 'completed'>('on_process');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get<Order[]>('/api/orders/vendor');
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    audioRef.current = new Audio(NOTIFICATION_SOUND);
    const token = getToken();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const socket = io(API_URL, {
      auth: { token: `Bearer ${token}` }
    });
    socketRef.current = socket;

    socket.on('newOrder', (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`New order received from ${newOrder.customer.name}!`);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
      }
    });

    socket.on('delivery:location', (data: { orderId: string; lat: number; lng: number }) => {
      setRiderCoords((prev) => ({
        ...prev,
        [data.orderId]: { lat: data.lat, lng: data.lng }
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    const originalOrders = [...orders];
    setOrders((prev) => 
      prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
    );

    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId.slice(-4)} updated to ${newStatus}`);
    } catch (err: any) {
      setOrders(originalOrders);
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter orders by tab & search query
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab filter
      if (activeTab === 'on_process') {
        if (!['Pending', 'Confirmed', 'Preparing', 'Ready', 'OutForDelivery'].includes(order.status)) return false;
      } else if (activeTab === 'completed') {
        if (order.status !== 'Completed' && order.status !== 'Cancelled') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = order.customer?.name?.toLowerCase().includes(q);
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesItem = order.items.some(i => i.foodItem.name.toLowerCase().includes(q));
        if (!matchesName && !matchesId && !matchesItem) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Current formatted date for Bitepoint header
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      <p className="text-gray-500 font-bold text-sm">Loading Kitchen Orders Terminal...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full font-sans animate-in fade-in duration-300">
      
      {/* ── BITEPOINT TOP HEADER ROW ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Orders</h1>
          <p className="text-xs font-bold text-gray-400 mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Kitchen Terminal Live · {orders.filter(o => ['Preparing', 'Confirmed'].includes(o.status)).length} active on grill
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* ── BITEPOINT TABS & SEARCH ROW ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-2.5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        
        {/* Bitepoint Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/60 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'all'
                ? 'bg-[#104F55] text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('on_process')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'on_process'
                ? 'bg-[#104F55] text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            On Process ({orders.filter(o => ['Pending', 'Confirmed', 'Preparing', 'Ready', 'OutForDelivery'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'completed'
                ? 'bg-[#104F55] text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Completed ({orders.filter(o => o.status === 'Completed').length})
          </button>
        </div>

        {/* Search input with icons */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a name, order #, or item..."
              className="w-full bg-gray-50 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            />
          </div>
          <button 
            onClick={() => setSearchQuery('')}
            className="p-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500"
            title="Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── BITEPOINT 3-COLUMN ORDER CARDS GRID ─────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-500" />
          <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-200">No Orders in this queue</h3>
          <p className="text-xs mt-1 text-gray-400">Incoming student orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order, idx) => {
            const badge = getOrderBadge(order, idx);
            const isExpanded = !!expandedOrders[order.id];

            // Bitepoint Status badge styling
            let statusPill = { text: 'In Progress', sub: 'Cooking Now', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' };
            if (order.status === 'Ready') {
              statusPill = { text: 'Ready', sub: 'Ready to serve', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' };
            } else if (order.status === 'OutForDelivery') {
              statusPill = { text: 'In Transit', sub: 'Rider Delivering', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' };
            } else if (order.status === 'Completed') {
              statusPill = { text: 'Completed', sub: 'Handed Over', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' };
            } else if (order.status === 'Pending') {
              statusPill = { text: 'Pending', sub: 'Needs Confirm', color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400' };
            }

            const isDelivery = order.deliveryAddress && !order.deliveryAddress.toLowerCase().includes('counter');

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-200/80 dark:border-gray-800/80 shadow-sm hover:shadow-xl hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header (Bitepoint Style) */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Code Badge (e.g. A4, B2, TA) */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${badge.color}`}>
                        {badge.code}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                          {order.customer.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-gray-400 block leading-tight">
                          Order #{order.id.slice(-4)} / {isDelivery ? 'Campus Delivery' : 'Counter Pickup'}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className={`px-2.5 py-1 rounded-xl text-right shrink-0 ${statusPill.color}`}>
                      <span className="font-black text-[10px] uppercase block leading-tight">
                        {statusPill.text}
                      </span>
                      <span className="text-[9px] font-semibold opacity-80 block leading-tight">
                        • {statusPill.sub}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time Row */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <span>{new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Dedicated Delivery Rider Badge */}
                  {order.deliveryPerson && (
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Bike className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Rider: {order.deliveryPerson.name}</span>
                      </div>
                      {order.deliveryPerson.phone && (
                        <span className="text-[10px] text-gray-400 shrink-0">{order.deliveryPerson.phone}</span>
                      )}
                    </div>
                  )}

                  {/* Scheduled Alert if any */}
                  {order.scheduledTime && (
                    <div className="mb-3 flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold p-2.5 rounded-2xl text-xs border border-rose-200 dark:border-rose-900/40">
                      <Clock className="w-4 h-4 animate-pulse shrink-0" />
                      <span>Pre-Scheduled for {new Date(order.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}

                  {/* Itemized Table (Bitepoint Items | Qty | Price) */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-wider pb-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="w-1/2">Items</span>
                      <span className="w-1/6 text-center">Qty</span>
                      <span className="w-1/3 text-right">Price</span>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-gray-800/40 text-xs font-semibold">
                      {(isExpanded ? order.items : order.items.slice(0, 3)).map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 text-gray-700 dark:text-gray-300">
                          <span className="w-1/2 truncate font-bold text-gray-900 dark:text-white">
                            {item.foodItem.name}
                          </span>
                          <span className="w-1/6 text-center text-gray-500">
                            {item.quantity}
                          </span>
                          <span className="w-1/3 text-right text-gray-900 dark:text-white font-bold">
                            {formatCurrency(item.priceAtTime * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.items.length > 3 && (
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="text-[11px] font-bold text-amber-500 hover:underline mt-1 block"
                      >
                        {isExpanded ? 'Show less' : `+${order.items.length - 3} more items`}
                      </button>
                    )}
                  </div>

                  {/* Expanded Detail Info: Delivery Address, Phone, Map */}
                  {isExpanded && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-4 space-y-2 text-xs animate-in fade-in">
                      <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-400 block">Delivery Drop-off</span>
                          <p className="font-bold text-gray-900 dark:text-white">{order.deliveryAddress}</p>
                        </div>
                      </div>
                      {order.customer.phone && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <a href={`tel:${order.customer.phone}`} className="font-bold text-amber-500 hover:underline">
                            {order.customer.phone}
                          </a>
                        </div>
                      )}
                      {order.deliveryPerson && (
                        <div className="flex items-center justify-between p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs">
                          <div className="flex items-center gap-2">
                            <Bike className="w-4 h-4 text-amber-500" />
                            <div>
                              <span className="text-[10px] font-bold uppercase text-gray-400 block">Assigned Delivery Rider</span>
                              <span className="font-extrabold text-gray-900 dark:text-white">{order.deliveryPerson.name}</span>
                            </div>
                          </div>
                          {order.deliveryPerson.phone && (
                            <a href={`tel:${order.deliveryPerson.phone}`} className="text-xs font-bold text-amber-500 hover:underline">
                              {order.deliveryPerson.phone}
                            </a>
                          )}
                        </div>
                      )}
                      {order.status === 'OutForDelivery' && riderCoords[order.id] && (
                        <div className="mt-2 h-28 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <TrackingMap
                            riderLat={riderCoords[order.id].lat}
                            riderLng={riderCoords[order.id].lng}
                            canteenName="Campus Rider"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Total & Bitepoint Pill Action Buttons */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-gray-400">Total</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Paid Online ✓
                      </span>
                    </div>
                    <span className="text-lg font-black text-gray-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bitepoint "See Details" pill button */}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="flex-1 py-2.5 px-3 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-center"
                    >
                      {isExpanded ? 'Hide Info' : 'See Details'}
                    </button>

                    {/* Bitepoint Yellow Main Action Button */}
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => updateStatus(order.id, 'Confirmed')}
                        className="flex-1 py-2.5 px-3 rounded-full text-xs font-black bg-amber-400 hover:bg-amber-500 text-gray-950 transition-all shadow-sm active:scale-95 text-center"
                      >
                        Confirm Order
                      </button>
                    )}

                    {order.status === 'Confirmed' && (
                      <button
                        onClick={() => updateStatus(order.id, 'Preparing')}
                        className="flex-1 py-2.5 px-3 rounded-full text-xs font-black bg-amber-400 hover:bg-amber-500 text-gray-950 transition-all shadow-sm active:scale-95 text-center flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" /> Start Prep
                      </button>
                    )}

                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => updateStatus(order.id, 'Ready')}
                        className="flex-1 py-2.5 px-3 rounded-full text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm active:scale-95 text-center flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Mark Ready
                      </button>
                    )}

                    {order.status === 'Ready' && (
                      <div className="flex-1 flex gap-1.5">
                        <button
                          onClick={() => updateStatus(order.id, 'Completed')}
                          className="flex-1 py-2 px-2 rounded-full text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-center"
                          title="Student is picking up food directly at canteen counter"
                        >
                          Handover
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'OutForDelivery')}
                          className="flex-1 py-2 px-2 rounded-full text-[11px] font-black bg-amber-400 hover:bg-amber-500 text-gray-950 transition-all text-center"
                          title="Dispatch rider for campus delivery"
                        >
                          Dispatch
                        </button>
                      </div>
                    )}

                    {order.status === 'OutForDelivery' && (
                      <button
                        onClick={() => updateStatus(order.id, 'Completed')}
                        className="flex-1 py-2.5 px-3 rounded-full text-xs font-black bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 text-gray-800 dark:text-gray-200 transition-colors text-center"
                      >
                        Archive
                      </button>
                    )}

                    {order.status === 'Completed' && (
                      <span className="flex-1 py-2.5 px-3 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
