'use client';

import React, { useState, useEffect } from 'react';
import { Inter, Poppins } from 'next/font/google';
import { useTheme } from 'next-themes';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import {
  LayoutDashboard, Store, Users, ShoppingBag, FileEdit, Settings,
  Search, Bell, Moon, Sun, Menu, X, Plus, Edit2, Trash2, CheckCircle,
  XCircle, Clock, AlertTriangle, ChevronRight, Eye, GripVertical, Check
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' });

// --- Mock Data ---
const MOCK_SALES = Array.from({ length: 7 }, (_, i) => ({
  name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  sales: Math.floor(Math.random() * 5000) + 1000,
}));

const MOCK_CATEGORIES = [
  { name: 'Fast Food', value: 400 },
  { name: 'Beverages', value: 300 },
  { name: 'Healthy', value: 300 },
  { name: 'Desserts', value: 200 },
];
const COLORS = ['#EA580C', '#F59E0B', '#10B981', '#3B82F6'];

const MOCK_ORDERS = [
  { id: 'ORD-001', state: 'New', item: 'Spicy Chicken Burger', total: '$12.50', time: '10:42 AM' },
  { id: 'ORD-002', state: 'New', item: 'Iced Latte', total: '$4.50', time: '10:45 AM' },
  { id: 'ORD-003', state: 'Preparing', item: 'Vegan Wrap', total: '$9.00', time: '10:30 AM' },
  { id: 'ORD-004', state: 'Out for Delivery', item: 'Pepperoni Pizza', total: '$15.00', time: '10:15 AM' },
  { id: 'ORD-005', state: 'Completed', item: 'Caesar Salad', total: '$8.50', time: '09:50 AM' },
];

const MOCK_USERS = [
  { id: 'STU-9921', name: 'Alice Johnson', role: 'Super Admin', status: 'Active' },
  { id: 'VEN-4410', name: 'Campus Bites', role: 'Canteen Vendor', status: 'Active' },
  { id: 'DEL-8832', name: 'Bob Smith', role: 'Delivery Personnel', status: 'Offline' },
];

const MOCK_MENU = [
  { id: 1, name: 'Spicy Chicken Burger', price: '$12.50', stock: true },
  { id: 2, name: 'Iced Latte', price: '$4.50', stock: true },
  { id: 3, name: 'Vegan Wrap', price: '$9.00', stock: false },
];

// --- Subcomponents ---
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50";
  const variants = {
    primary: "bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
    danger: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Main Views ---
const DashboardView = ({ isLoading }: { isLoading: boolean }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: 'Active Students', value: '2,405', trend: '+12%', color: 'text-emerald-500' },
        { title: 'Total Revenue', value: '$14,230', trend: '+8%', color: 'text-emerald-500' },
        { title: 'Pending Deliveries', value: '34', trend: '-2%', color: 'text-red-500' },
      ].map((metric, i) => (
        <Card key={i} className="flex flex-col justify-center">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            </div>
          ) : (
            <>
              <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm font-poppins">{metric.title}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white font-inter">{metric.value}</span>
                <span className={`text-sm font-medium ${metric.color}`}>{metric.trend}</span>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 font-poppins">Weekly Campus Sales Volume</h3>
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="w-full h-full animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_SALES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#F97316' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 font-poppins">Popular Categories</h3>
        <div className="h-[300px] w-full flex items-center justify-center">
          {isLoading ? (
            <div className="w-48 h-48 animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-full"></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={MOCK_CATEGORIES} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {MOCK_CATEGORIES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {!isLoading && (
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {MOCK_CATEGORIES.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                {cat.name}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  </div>
);

const KanbanBoard = () => {
  const columns = ['New', 'Preparing', 'Out for Delivery', 'Completed'];
  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6 overflow-x-auto pb-4 animate-in fade-in duration-500">
      {columns.map(col => (
        <div key={col} className="flex-shrink-0 w-80 flex flex-col bg-slate-100/50 dark:bg-slate-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 font-poppins">{col}</h3>
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs py-1 px-2 rounded-full font-medium">
              {MOCK_ORDERS.filter(o => o.state === col).length}
            </span>
          </div>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
            {MOCK_ORDERS.filter(o => o.state === col).map(order => (
              <div key={order.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-500 font-inter">{order.id}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> {order.time}</span>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">{order.item}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{order.total}</span>
                  <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
            {MOCK_ORDERS.filter(o => o.state === col).length === 0 && (
              <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                Drop orders here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const AccountsManager = () => (
  <Card className="animate-in fade-in duration-500">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-poppins">Accounts Manager</h2>
      <Button><Plus size={18} className="mr-2" /> Add User</Button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium">
            <th className="pb-3 pl-4">ID</th>
            <th className="pb-3">Name</th>
            <th className="pb-3">Role</th>
            <th className="pb-3">Status</th>
            <th className="pb-3 text-right pr-4">Actions</th>
          </tr>
        </thead>
        <tbody className="font-inter">
          {MOCK_USERS.map((user, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
              <td className="py-4 pl-4 text-sm font-medium text-slate-900 dark:text-slate-300">{user.id}</td>
              <td className="py-4 text-sm text-slate-700 dark:text-slate-400">{user.name}</td>
              <td className="py-4 text-sm">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  user.role === 'Super Admin' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                  user.role === 'Canteen Vendor' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-4 text-sm">
                <span className={`flex items-center gap-1.5 ${user.status === 'Active' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                  {user.status}
                </span>
              </td>
              <td className="py-4 pr-4 text-right">
                <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-lg">
                  <Edit2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const ContentCMS = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-poppins">Content CMS</h2>
        <p className="text-slate-500 text-sm mt-1">Drag and drop menu items to reorder</p>
      </div>
      <Button><Plus size={18} className="mr-2" /> Add Item</Button>
    </div>
    
    <div className="grid gap-4">
      {MOCK_MENU.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:-translate-y-0.5 transition-all">
          <div className="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <GripVertical size={20} />
          </div>
          <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={20} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 dark:text-white font-poppins">{item.name}</h4>
            <p className="text-slate-500 text-sm font-inter">{item.price}</p>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center cursor-pointer gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">In Stock</span>
              <div className={`relative w-10 h-6 rounded-full transition-colors ${item.stock ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${item.stock ? 'translate-x-4' : ''}`}></div>
              </div>
            </label>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/30 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                <Edit2 size={16} />
              </button>
              <button className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/30 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- Layout & Shell ---
export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      setError('Invalid ID or Password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>Foodzie Admin</h1>
            <p className="text-slate-500 mt-2">Restricted Access Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Admin ID</label>
              <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="Enter Admin ID" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="Enter password" />
            </div>
            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/30 mt-4">
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, setTheme } = useTheme();

  // Mounted check for theme to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Simulate initial data fetching
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const NAV_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Live Orders', icon: Clock },
    { name: 'Canteen Manager', icon: Store },
    { name: 'Student Accounts', icon: Users },
    { name: 'Content CMS', icon: FileEdit },
    { name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <DashboardView isLoading={isLoading} />;
      case 'Live Orders': return <KanbanBoard />;
      case 'Student Accounts': return <AccountsManager />;
      case 'Content CMS': return <ContentCMS />;
      default: return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in">
          <Store size={48} className="mb-4 opacity-20" />
          <p className="font-poppins">The {activeTab} view is currently under construction.</p>
        </div>
      );
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-inter transition-colors duration-300 ${inter.variable} ${poppins.variable}`}>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
            <ShoppingBag className="text-orange-600 dark:text-orange-500 mr-3" size={24} />
            <h1 className="text-xl font-bold font-poppins text-slate-900 dark:text-white">Foodzie Admin</h1>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => { setActiveTab(item.name); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                    isActive 
                      ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500 font-medium' 
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} className={`mr-3 ${isActive ? 'text-orange-600 dark:text-orange-500' : ''}`} />
                  <span className="font-poppins text-sm">{item.name}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-500 font-bold text-sm">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Admin User</p>
                <p className="text-xs text-slate-500 truncate">admin@foodzie.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders, menu items..." 
                className="w-64 pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm font-inter text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            {/* Notification Slide-out Panel */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40 bg-slate-900/20 dark:bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute top-14 right-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white font-poppins">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {[
                      { title: 'High-Volume Order Alert', desc: '15 orders placed in the last 10 minutes at Canteen A.', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                      { title: 'New Student Reviews', desc: '3 new 5-star reviews for the Vegan Wrap.', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
                    ].map((notif, i) => (
                      <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-full ${notif.bg} h-fit`}>
                            <notif.icon size={16} className={notif.color} />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white font-poppins">{notif.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center">
                    <button className="text-xs font-medium text-orange-600 dark:text-orange-500 hover:underline">View All Notifications</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
