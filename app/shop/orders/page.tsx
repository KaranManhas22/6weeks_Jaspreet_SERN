'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api, getToken } from '@/lib/api';
import { 
  CheckCircle2, 
  Package, 
  ArrowLeft, 
  Loader2, 
  Clock, 
  Store, 
  PartyPopper,
  ShoppingBag,
  QrCode,
  Star,
  Download,
  Send,
  X
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface FoodItem {
  id: string;
  name: string;
  isVegetarian: boolean;
}

interface OrderItem {
  id: string;
  quantity: number;
  priceAtTime: number;
  foodItemId: string;
  foodItem: FoodItem;
}

import dynamic from 'next/dynamic';

const TrackingMap = dynamic(() => import('@/components/TrackingMap'), { ssr: false });

interface Order {
  id: string;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  totalAmount: number;
  deliveryAddress: string;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
  };
  vendor: {
    vendorName: string;
  };
  items: OrderItem[];
  rider?: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

const SUCCESS_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';

export default function OrdersPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [riderCoords, setRiderCoords] = useState<{ lat: number; lng: number } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Review states
  const [activeReviewItem, setActiveReviewItem] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedItemIds, setReviewedItemIds] = useState<string[]>([]);

  const fetchLatestOrder = useCallback(async () => {
    try {
      const orders = await api.get<Order[]>('/api/orders/customer');
      if (orders.length > 0) {
        setOrder(orders[0]); // Show the most recent order
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestOrder();
    audioRef.current = new Audio(SUCCESS_SOUND);
  }, [fetchLatestOrder]);

  useEffect(() => {
    if (!order) return;

    // Fetch initial rider location if assigned
    if (order.rider?.id) {
      api.get<{ lat: number; lng: number }>(`/api/delivery/location/${order.rider.id}`)
        .then(coords => {
          setRiderCoords(coords);
        })
        .catch(err => {
          console.warn("Rider location not cached yet:", err.message);
        });
    }

    const token = getToken();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const socket = io(API_URL, {
      auth: { token: `Bearer ${token}` }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket, subscribing to order:', order.id);
      socket.emit('track:subscribe', { orderId: order.id });
    });

    socket.on('orderStatusUpdate', (data: { orderId: string, status: Order['status'] }) => {
      console.log('Status update received:', data);
      if (data.orderId === order.id) {
        setOrder(prev => prev ? { ...prev, status: data.status } : null);
        
        if (data.status === 'Ready') {
          setShowCelebration(true);
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
          }
          setTimeout(() => setShowCelebration(false), 5000);
        }
      }
    });

    socket.on('delivery:location', (data: { orderId: string; lat: number; lng: number }) => {
      console.log('Rider live location update:', data);
      if (data.orderId === order.id) {
        setRiderCoords({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [order?.id, order?.rider?.id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewItem) return;

    setIsSubmittingReview(true);
    try {
      await api.post('/api/orders/review', {
        foodItemId: activeReviewItem.foodItemId,
        rating,
        comment
      });
      setReviewedItemIds(prev => [...prev, activeReviewItem.foodItemId]);
      setActiveReviewItem(null);
      setRating(5);
      setComment('');
      alert('Thank you! Your review has been submitted.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-6 text-center">
      <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold mb-2">No active orders</h1>
      <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
      <button 
        onClick={() => router.push('/shop')}
        className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20"
      >
        Order Now
      </button>
    </div>
  );

  const steps = [
    { key: 'Confirmed', label: 'Order Placed', icon: Package },
    { key: 'Preparing', label: 'Preparing', icon: Clock },
    { key: 'Ready', label: 'Ready for Delivery', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const activeIndex = currentStepIndex === -1 && order.status === 'Completed' ? 2 : currentStepIndex;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  
  const receiptUrl = `${API_URL}/api/orders/${order.id}/receipt`;
  const verificationLink = `${FRONTEND_URL}/vendor/verify-delivery/${order.id}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/shop')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Shop</span>
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full border border-orange-500/20">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Tracking</span>
            </div>
          </div>
        </div>

        {/* Status Timeline Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl shadow-orange-500/5 relative overflow-hidden">
          
          {showCelebration && (
            <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
              <PartyPopper className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
              <h2 className="text-2xl font-black text-green-600 dark:text-green-400">YOUR FOOD IS READY!</h2>
            </div>
          )}

          <div className="mb-10 text-center">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Order Status</h2>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {order.status === 'Confirmed' ? 'Confirmed' : 
               order.status === 'Preparing' ? 'In the Kitchen' :
               order.status === 'Ready' ? 'Out for Delivery' :
               order.status === 'Completed' ? 'Delivered' : order.status}
            </div>
          </div>

          <div className="relative flex justify-between">
            {/* Timeline Line */}
            <div className="absolute top-6 left-[10%] w-[80%] h-0.5 bg-gray-100 dark:bg-gray-800 -z-0">
              <div 
                className="h-full bg-orange-500 transition-all duration-1000 ease-in-out" 
                style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= activeIndex;
              const isActive = idx === activeIndex;

              return (
                <div key={step.key} className="flex flex-col items-center gap-3 relative z-10 w-24">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 
                    'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  } ${isActive ? 'scale-125 ring-4 ring-orange-500/20' : ''}`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                    isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Location Map */}
        {riderCoords && order.status !== 'Completed' && order.status !== 'Cancelled' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl shadow-orange-500/5 space-y-4 animate-in zoom-in duration-300">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" /> Live Delivery tracking Map
            </h3>
            <TrackingMap 
              riderLat={riderCoords.lat}
              riderLng={riderCoords.lng}
              canteenName={order.vendor.vendorName}
            />
          </div>
        )}

        {/* Verification QR Code (Shown when Confirming/Delivering) */}
        {order.status !== 'Completed' && order.status !== 'Cancelled' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl shadow-orange-500/5 flex flex-col items-center text-center space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-500" /> Delivery Verification QR
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
              Show this QR code to the delivery driver upon arrival. Once they scan it from their account, the delivery will be securely verified.
            </p>
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-md">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verificationLink)}`} 
                alt="Delivery verification QR" 
                className="w-48 h-48"
              />
            </div>
          </div>
        )}

        {/* Order Details & PDF Download Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl shadow-orange-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <Store className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{order.vendor.vendorName}</h3>
                <p className="text-sm text-gray-500">Order ID: #F-{order.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            
            <a 
              href={receiptUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-orange-500 border border-orange-500/20 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF Receipt
            </a>
          </div>

          {/* Student Recipient Info */}
          {order.customer && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl text-xs space-y-1 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
              <p className="font-bold text-gray-900 dark:text-white">Recipient Details:</p>
              <p>Name: <span className="font-semibold text-gray-800 dark:text-gray-300">{order.customer.name}</span></p>
              <p>Email: <span className="font-semibold text-gray-800 dark:text-gray-300">{order.customer.email}</span></p>
            </div>
          )}

          {/* Detailed Items List */}
          <div className="space-y-4 mb-8">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-3">
                  <span className="text-orange-500 font-bold">x{item.quantity}</span>
                  <span className="text-gray-700 dark:text-gray-300">{item.foodItem.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    item.foodItem.isVegetarian 
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                  }`}>
                    {item.foodItem.isVegetarian ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
                <span className="text-gray-500">${(item.priceAtTime * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Delivery Location Section */}
          <div className="mb-8 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
            <h4 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1.5">Delivery Address Info</h4>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-relaxed">{order.deliveryAddress}</p>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="font-bold text-gray-500">Total Paid</span>
            <span className="text-2xl font-black text-orange-500">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Feedback / Review Modal Trigger Section (Only shown when order is Completed) */}
        {order.status === 'Completed' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl shadow-orange-500/5 space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Share Your Feedback
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rate the food items in your order to reflect on the canteen's rating</p>
            </div>

            <div className="space-y-4">
              {order.items.map(item => {
                const isReviewed = reviewedItemIds.includes(item.foodItemId);
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.foodItem.name}</span>
                      <p className="text-[10px] text-gray-400 uppercase">Rate and review this item</p>
                    </div>

                    {isReviewed ? (
                      <span className="text-xs font-bold text-green-600 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
                        Review Submitted ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveReviewItem(item)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-orange-500/20"
                      >
                        Rate Item
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Star Rating Dialog */}
      {activeReviewItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[99] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-sm w-full space-y-6 text-center shadow-2xl relative">
            <button 
              onClick={() => setActiveReviewItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Item</h3>
              <p className="text-xs text-orange-500 font-bold">{activeReviewItem.foodItem.name}</p>
            </div>

            <form onSubmit={submitReview} className="space-y-6">
              {/* Star rating selector */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star 
                      className="w-8 h-8" 
                      fill={num <= rating ? "currentColor" : "none"} 
                    />
                  </button>
                ))}
              </div>

              {/* Comment field */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Write your feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Delicious! Highly recommended..."
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm min-h-[100px]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isSubmittingReview ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Review
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
