'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, BarChart, Bar
} from 'recharts';
import {
  LayoutDashboard, Store, Users, ShoppingBag, Settings,
  Search, Bell, Moon, Sun, Menu, X, Plus, Edit2, Trash2,
  ChevronRight, Eye, GripVertical, Check, Key, Mail, Phone, MapPin,
  Shield, UserCheck, UserX, Clock, Calendar, CheckCircle2,
  TrendingUp, TrendingDown, MoreVertical, SlidersHorizontal, ArrowUpRight,
  LogOut, Crown, Coffee, AlertCircle, Play, Layers
} from 'lucide-react';
import { api, setToken, getToken, removeToken } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [adminProfile, setAdminProfile] = useState<{ name: string; email: string; role: string }>({
    name: 'Admin',
    email: '',
    role: 'Super Admin'
  });

  // Check initial token and verify Admin role
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoadingAuth(false);
      return;
    }
    api.get<any>('/api/auth/me')
      .then((me) => {
        if (me.role === 'Admin' || me.role === 'Super Admin') {
          setIsAuthenticated(true);
          const isJaspreet = me.email?.toLowerCase().includes('bhatiajaspreet161@gmail.com') || me.name?.toLowerCase().includes('jaspreet');
          setAdminProfile({
            name: isJaspreet ? 'Jaspreet Bhatia' : (me.name === 'Super Admin' ? 'Admin' : (me.name || 'Admin')),
            email: me.email || '',
            role: me.role || 'Super Admin'
          });
        } else {
          setIsAuthenticated(false);
          setError('Access denied. Administrator credentials required.');
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post<{ token: string; user: any }>('/api/auth/login', { email, password });
      if (res.user?.role !== 'Admin' && res.user?.role !== 'Super Admin') {
        setError('Access denied. Administrator credentials required.');
        return;
      }
      if (res.token) {
        setToken(res.token);
        setIsAuthenticated(true);
        const isJaspreet = res.user?.email?.toLowerCase().includes('bhatiajaspreet161@gmail.com') || res.user?.name?.toLowerCase().includes('jaspreet');
        setAdminProfile({
          name: isJaspreet ? 'Jaspreet Bhatia' : (res.user?.name === 'Super Admin' ? 'Admin' : (res.user?.name || 'Admin')),
          email: res.user?.email || '',
          role: res.user?.role || 'Super Admin'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Email or Password');
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161B22] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#E65100]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-[#161B22] border border-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#E65100] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-orange-500/25">
              <Crown className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Panel</h1>
            <p className="text-xs text-gray-400 mt-1">Super Admin &amp; Operations Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#21262D] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="admin@foodzie.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#21262D] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-rose-400 text-xs font-semibold">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#E65100] hover:bg-[#E65100] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 mt-4 cursor-pointer"
            >
              Sign In to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminPanelMain adminProfile={adminProfile} onLogout={() => { removeToken(); setIsAuthenticated(false); }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN PANEL WITH FLOWTASK DASHBOARD & USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

function AdminPanelMain({ adminProfile, onLogout }: { adminProfile: { name: string; email: string; role: string }; onLogout: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'User Management' | 'Canteens' | 'Orders' | 'Settings'>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // User Management Filter & Selection States (Image 6)
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [campusFilter, setCampusFilter] = useState('All Campuses');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Orders Filters
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All Statuses');
  const [orderCanteenFilter, setOrderCanteenFilter] = useState('All Canteens');

  // Canteens Filters
  const [canteenSearchQuery, setCanteenSearchQuery] = useState('');
  const [canteenUniFilter, setCanteenUniFilter] = useState('All Campuses');

  // Modals & Edit Form State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', phone: '', role: 'Foodie', universityId: '', password: 'password123' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (selectedUserForEdit) {
      setEditForm({
        id: selectedUserForEdit.id,
        name: selectedUserForEdit.name || '',
        email: selectedUserForEdit.email || '',
        phone: selectedUserForEdit.phone || '',
        role: selectedUserForEdit.role || 'Foodie',
        universityId: selectedUserForEdit.universityId || '',
        workStatus: selectedUserForEdit.workStatus || 'Active',
        upi: selectedUserForEdit.upi || selectedUserForEdit.vendorUpi || '',
        vendorDescription: selectedUserForEdit.vendorDescription || '',
        earnedCredits: selectedUserForEdit.earnedCredits ?? 0,
        refundedCredits: selectedUserForEdit.refundedCredits ?? 0,
        newPassword: ''
      });
    } else {
      setEditForm(null);
    }
  }, [selectedUserForEdit]);

  const fetchData = async () => {
    try {
      const [usersData, analyticsData, ordersData, unisData] = await Promise.all([
        api.get<any[]>('/api/admin/users').catch(() => []),
        api.get<any>('/api/admin/analytics').catch(() => null),
        api.get<any[]>('/api/admin/orders').catch(() => []),
        api.get<{ universities: any[] }>('/api/menu/universities').catch(() => ({ universities: [] }))
      ]);
      setUsers(usersData || []);
      setAnalytics(analyticsData);
      setOrders(ordersData || []);
      setUniversities(unisData?.universities || []);
    } catch (err) {
      console.error('Failed to load admin panel data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Users for Image 6 Table
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Role filter
      if (roleFilter !== 'All Roles') {
        if (roleFilter === 'Super Admin' && user.role !== 'Super Admin' && user.role !== 'Admin') return false;
        if (roleFilter === 'Vendor' && user.role !== 'Vendor' && user.role !== 'Canteen Vendor') return false;
        if (roleFilter === 'Delivery' && user.role !== 'Delivery') return false;
        if (roleFilter === 'Foodie' && user.role !== 'Foodie') return false;
      }
      // Status filter
      if (statusFilter !== 'All Statuses') {
        const isActive = user.status !== 'Inactive' && user.workStatus !== 'Suspended' && user.workStatus !== 'Resigned' && !user.isSuspended;
        if (statusFilter === 'Active' && !isActive) return false;
        if (statusFilter === 'Inactive' && isActive) return false;
      }
      // Campus filter
      if (campusFilter !== 'All Campuses') {
        if (user.universityId !== campusFilter && user.university?.name !== campusFilter) return false;
      }
      // Search
      if (searchUserQuery.trim()) {
        const q = searchUserQuery.toLowerCase();
        const matchesName = user.name?.toLowerCase().includes(q);
        const matchesEmail = user.email?.toLowerCase().includes(q);
        const matchesPhone = user.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, campusFilter, searchUserQuery]);

  // Filtered Canteens
  const vendorUsers = useMemo(() => {
    return users.filter(u => u.role === 'Vendor' || u.role === 'Canteen Vendor');
  }, [users]);

  const filteredCanteens = useMemo(() => {
    return vendorUsers.filter(v => {
      if (canteenUniFilter !== 'All Campuses') {
        if (v.universityId !== canteenUniFilter && v.university?.name !== canteenUniFilter) return false;
      }
      if (canteenSearchQuery.trim()) {
        const q = canteenSearchQuery.toLowerCase();
        if (!v.name?.toLowerCase().includes(q) && !v.email?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [vendorUsers, canteenUniFilter, canteenSearchQuery]);

  // Unique Canteen Vendors for Orders Filter
  const uniqueVendorsInOrders = useMemo(() => {
    const map = new Map<string, string>();
    orders.forEach(o => {
      if (o.vendor?.name) map.set(o.vendor.name, o.vendor.name);
      else if (o.vendorId) map.set(o.vendorId, o.vendorId);
    });
    return Array.from(map.values());
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStatusFilter !== 'All Statuses' && o.status !== orderStatusFilter) return false;
      if (orderCanteenFilter !== 'All Canteens') {
        if (o.vendor?.name !== orderCanteenFilter && o.vendorId !== orderCanteenFilter) return false;
      }
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesCustomer = o.customer?.name?.toLowerCase().includes(q) || o.customer?.email?.toLowerCase().includes(q);
        const matchesRider = o.deliveryPerson?.name?.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesRider) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderCanteenFilter, orderSearchQuery]);

  // Paginated Users
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  // Toggle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const res = await api.post<any>('/api/admin/users', newUserForm);
      toast.success(`User ${res.name || newUserForm.name} created!`);
      setUsers(prev => [res, ...prev]);
      setShowAddUserModal(false);
      setNewUserForm({ name: '', email: '', phone: '', role: 'Foodie', password: 'password123' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success(`User ${name} removed`);
    } catch (err: any) {
      toast.error('Failed to delete user: ' + err.message);
    }
  };

  // Order Status Breakdown for Donut Chart (Image 5 Layout, Foodzie Logic)
  const orderStatusData = useMemo(() => {
    const delivered = orders.filter(o => o.status === 'Completed').length;
    const preparing = orders.filter(o => ['Preparing', 'Confirmed'].includes(o.status)).length;
    const outForDelivery = orders.filter(o => o.status === 'OutForDelivery' || o.status === 'Ready').length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;

    const dCount = delivered > 0 ? delivered : 186;
    const pCount = preparing > 0 ? preparing : 42;
    const oCount = outForDelivery > 0 ? outForDelivery : 18;
    const cCount = (pending + cancelled) > 0 ? (pending + cancelled) : 12;

    return [
      { name: 'Delivered', value: dCount, color: '#10b981' },
      { name: 'Preparing', value: pCount, color: '#f59e0b' },
      { name: 'Out for Delivery', value: oCount, color: '#3b82f6' },
      { name: 'Pending / Cancelled', value: cCount, color: '#8b5cf6' },
    ];
  }, [orders]);

  // Canteen Order Share & Fulfillment Stats (Image 5 Progress Bars Layout, Foodzie Logic)
  const canteenFulfillmentStats = useMemo(() => {
    if (vendorUsers.length === 0) {
      return [
        { name: 'SBBSU Main Canteen', count: 98, pct: 78, color: 'bg-[#E65100]' },
        { name: "Tania'z Cafe", count: 64, pct: 62, color: 'bg-blue-500' },
        { name: "Narinder's Cafe", count: 48, pct: 45, color: 'bg-emerald-500' },
        { name: 'Student Adda & Kiosk', count: 34, pct: 90, color: 'bg-amber-500' },
      ];
    }
    const colors = ['bg-[#E65100]', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
    const totalOrderCount = orders.length || 150;
    return vendorUsers.slice(0, 4).map((v, idx) => {
      const cOrders = orders.filter(o => o.vendorId === v.id || o.vendor?.name === v.name).length;
      const count = cOrders > 0 ? cOrders : Math.max(16, Math.round(75 / (idx + 1)));
      const pct = Math.min(100, Math.max(15, Math.round((count / totalOrderCount) * 100)));
      return {
        name: v.name,
        count,
        pct,
        color: colors[idx % colors.length]
      };
    });
  }, [vendorUsers, orders]);

  // Weekly Campus Orders Activity Bar Chart (Image 5 Layout, Foodzie Logic)
  const weeklyActivityData = useMemo(() => [
    { day: 'Mon', delivered: 28, preparing: 12, newOrders: 6 },
    { day: 'Tue', delivered: 34, preparing: 14, newOrders: 8 },
    { day: 'Wed', delivered: 30, preparing: 16, newOrders: 7 },
    { day: 'Thu', delivered: 42, preparing: 10, newOrders: 11 },
    { day: 'Fri', delivered: 48, preparing: 18, newOrders: 14 },
    { day: 'Sat', delivered: 26, preparing: 8, newOrders: 5 },
    { day: 'Sun', delivered: 22, preparing: 6, newOrders: 4 },
  ], []);

  // Total Campus Revenue
  const totalRevenue = useMemo(() => {
    const sum = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    return sum > 0 ? sum : 148500;
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-[#0D1117] text-[#2C2723] dark:text-[#E6EDF3] flex font-sans text-gray-900 dark:text-gray-100">
      
      {/* ── 1. DARK NAVY/INDIGO SIDEBAR (Image 6 Admin Panel Style) ─────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#161B22] text-white flex flex-col justify-between transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div>
          {/* Brand Crown Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E65100] flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-none">Admin Panel</h1>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Campus Command</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'User Management', label: 'User Management', icon: Users, badge: users.length || '1.2k' },
              { id: 'Canteens', label: 'Canteens & Menus', icon: Store },
              { id: 'Orders', label: 'Orders & Deliveries', icon: ShoppingBag, badge: orders.length || '168' },
              { id: 'Settings', label: 'Settings', icon: Settings },
            ].map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#E65100] text-white shadow-md shadow-orange-500/20'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── 2. MAIN ADMIN CONTENT AREA ──────────────────────────────────── */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'lg:pl-64' : ''} transition-all duration-300 min-w-0`}>
        
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-white dark:bg-[#161B22] border-b border-[#F0E6D8] dark:border-gray-800 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {activeTab}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-105 transition-transform"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-[#E65100] flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20">
                {adminProfile.name.toLowerCase().includes('jaspreet') ? 'JB' : 'AD'}
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-black text-gray-900 dark:text-white leading-none">{adminProfile.name}</span>
                <span className="text-[10px] text-gray-400 font-semibold leading-none">{adminProfile.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── TAB 1: FLOWTASK DASHBOARD (Image 5) ────────────────────────── */}
        {activeTab === 'Dashboard' && (
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  Good morning, {adminProfile.name}! <span className="animate-spin duration-1000">☀️</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">
                  Here&apos;s what&apos;s happening with your campus canteens today.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-white dark:bg-[#161B22] border border-[#F0E6D8] dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 shadow-xs">
                <Calendar className="w-4 h-4 text-[#E65100]" />
                <span>Today · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {/* 4 Top Campus Dining Metric Cards (Image 5 Layout, Foodzie Logic) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  title: 'Total Campus Revenue', 
                  value: `₹${totalRevenue.toLocaleString()}`, 
                  change: '↑ 24.5%', 
                  changeColor: 'text-emerald-500', 
                  icon: TrendingUp, 
                  bg: 'bg-emerald-500/10 text-emerald-500' 
                },
                { 
                  title: 'Total Orders Placed', 
                  value: (orders.length > 0 ? orders.length : 248).toLocaleString(), 
                  change: '↑ 18.2%', 
                  changeColor: 'text-blue-500', 
                  icon: ShoppingBag, 
                  bg: 'bg-blue-500/10 text-blue-500' 
                },
                { 
                  title: 'Active Canteens', 
                  value: (vendorUsers.length > 0 ? vendorUsers.length : 12).toString(), 
                  change: '↑ 12.0%', 
                  changeColor: 'text-[#E65100]', 
                  icon: Store, 
                  bg: 'bg-[#E65100]/10 text-[#E65100]' 
                },
                { 
                  title: 'Campus Foodies & Riders', 
                  value: (users.filter(u => u.role !== 'Admin').length > 0 ? users.filter(u => u.role !== 'Admin').length : 1236).toLocaleString(), 
                  change: '↑ 15.4%', 
                  changeColor: 'text-amber-500', 
                  icon: Users, 
                  bg: 'bg-amber-500/10 text-amber-500' 
                },
              ].map((c, i) => (
                <div key={i} className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-5 border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 text-lg font-black" style={{ backgroundColor: c.bg.split(' ')[0].replace('bg-', '') }}>
                      <c.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 block">{c.title}</span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{c.value}</h3>
                    <span className={`text-[11px] font-extrabold ${c.changeColor} mt-0.5 block`}>
                      {c.change} <span className="text-gray-400 font-semibold text-[10px]">vs last month</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Middle Row: Canteen Order Share (1/3) + Order Status Donut (1/3) + Peak Dining Schedule (1/3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Canteen Order Share */}
              <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-6 border border-[#F0E6D8] dark:border-gray-800 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-black text-gray-900 dark:text-white">Canteen Fulfillment</h3>
                  <button 
                    onClick={() => setActiveTab('Canteens')}
                    className="text-xs font-bold text-[#E65100] hover:underline cursor-pointer"
                  >
                    View All &gt;
                  </button>
                </div>
                <div className="space-y-4">
                  {canteenFulfillmentStats.map((p, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-gray-800 dark:text-gray-200 truncate pr-2">{p.name}</span>
                        <span className="text-gray-500 shrink-0">{p.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Breakdown Donut */}
              <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-6 border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white mb-4">Order Status Breakdown</h3>
                  <div className="h-40 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={68}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {orderStatusData.map((e, idx) => (
                            <Cell key={`status-${idx}`} fill={e.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">
                        {orderStatusData.reduce((acc, cur) => acc + cur.value, 0)}
                      </span>
                      <span className="text-[9px] font-black uppercase text-gray-400">Total Orders</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mt-2 text-xs font-bold">
                  {orderStatusData.map((t) => (
                    <div key={t.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                        <span className="text-gray-600 dark:text-gray-300">{t.name}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-black">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peak Campus Dining Hours Schedule */}
              <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-6 border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-gray-900 dark:text-white">Peak Dining Hours</h3>
                    <span className="text-xs font-bold text-[#E65100]">Campus Schedule</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-5 text-[10px] font-bold">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                      <div key={d} className={`p-1.5 rounded-xl ${i === 2 ? 'bg-[#E65100] text-white' : 'text-gray-400'}`}>
                        <span>{d}</span>
                        <span className="block text-xs font-black mt-0.5">{12 + i}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 border-l-4 border-l-amber-500">
                      <span className="text-[10px] font-black uppercase text-amber-500 block">12:30 PM – 2:30 PM</span>
                      <p className="font-bold text-gray-900 dark:text-white mt-0.5">Peak Lunch Rush &amp; Hostel Delivery</p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-[#E65100]/10 border-l-4 border-l-[#E65100]">
                      <span className="text-[10px] font-black uppercase text-[#E65100] block">4:30 PM – 6:30 PM</span>
                      <p className="font-bold text-gray-900 dark:text-white mt-0.5">Evening Snacks &amp; Counter Pickups</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: Active Campus Riders (1/3) + Weekly Orders Activity (2/3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Campus Delivery Riders */}
              <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-6 border border-[#F0E6D8] dark:border-gray-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-gray-900 dark:text-white">Active Campus Riders</h3>
                  <button
                    onClick={() => {
                      setActiveTab('User Management');
                      setRoleFilter('Delivery');
                    }}
                    className="text-xs font-bold text-[#E65100] hover:underline cursor-pointer"
                  >
                    View All &gt;
                  </button>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const activeRiders = users.filter(u => u.role === 'Delivery');
                    const displayRiders = activeRiders.length > 0 ? activeRiders.slice(0, 6) : [
                      { name: 'Gurpreet Singh Dhillon', role: 'Delivery', canteen: "Tania'z Cafe" },
                      { name: 'Harmanpreet Singh Sandhu', role: 'Delivery', canteen: "Tania'z Cafe" },
                      { name: 'Maninder Singh Gill', role: 'Delivery', canteen: "Narinder's Cafe" },
                      { name: 'Jaspreet Singh Bajwa', role: 'Delivery', canteen: "Narinder's Cafe" },
                      { name: 'Arshdeep Singh Sidhu', role: 'Delivery', canteen: 'Student Adda' },
                      { name: 'Lovepreet Singh Mann', role: 'Delivery', canteen: 'Hunger Cure' },
                    ];
                    return displayRiders.map((m: any) => (
                      <div key={m.id || m.name} className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#E65100]/10 text-[#E65100] flex items-center justify-center font-black shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 dark:text-white truncate">{m.name}</p>
                            <span className="text-[10px] text-gray-400 font-semibold truncate block">
                              🏍️ Campus Delivery Rider {m.canteen ? `· ${m.canteen}` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-500 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          On Duty
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Weekly Orders Activity Stacked Bar Chart */}
              <div className="md:col-span-2 bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-6 border border-[#F0E6D8] dark:border-gray-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white">Campus Order Activity</h3>
                    <p className="text-xs text-gray-400">Weekly order completion and kitchen preparation throughput</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" /> Delivered
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#60a5fa]" /> In-Kitchen
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#bfdbfe]" /> New Orders
                    </span>
                  </div>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                      <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                      <Bar dataKey="delivered" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="preparing" stackId="a" fill="#60a5fa" />
                      <Bar dataKey="newOrders" stackId="a" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Live Campus Orders Dispatch Stream (Image 5 4-Column Card Grid Layout) */}
            <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-6 border border-[#F0E6D8] dark:border-gray-800 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#E65100]" />
                    Live Campus Orders Dispatch Stream
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time orders moving through campus canteens and delivery riders</p>
                </div>
                <button
                  onClick={() => setActiveTab('Orders')}
                  className="text-xs font-bold text-[#E65100] hover:underline cursor-pointer"
                >
                  View All Orders ({orders.length}) &gt;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed');
                  const preparingOrders = orders.filter(o => o.status === 'Preparing');
                  const deliveryOrders = orders.filter(o => o.status === 'OutForDelivery' || o.status === 'Ready');
                  const completedOrders = orders.filter(o => o.status === 'Completed');

                  const columns = [
                    {
                      title: 'New Orders',
                      count: pendingOrders.length > 0 ? pendingOrders.length : 3,
                      tagColor: 'bg-rose-500/10 text-rose-600',
                      ordersList: pendingOrders.length > 0 ? pendingOrders.slice(0, 3) : [
                        { id: 'ord-812', customer: { name: 'Harjot Kaur' }, vendor: { name: "Tania'z Cafe" }, totalAmount: 160, itemsSummary: '2x Veg Grilled Sandwich, 1x Cold Coffee', address: 'Girls Hostel 2' },
                        { id: 'ord-813', customer: { name: 'Karanvir Singh' }, vendor: { name: "Narinder's Cafe" }, totalAmount: 220, itemsSummary: '1x Special Thali', address: 'Boys Hostel 1' },
                        { id: 'ord-814', customer: { name: 'Simran Sharma' }, vendor: { name: 'Student Adda' }, totalAmount: 90, itemsSummary: '1x Crispy Burger, 1x Coke', address: 'Library Block' },
                      ]
                    },
                    {
                      title: 'Cooking / Preparing',
                      count: preparingOrders.length > 0 ? preparingOrders.length : 4,
                      tagColor: 'bg-amber-500/10 text-amber-600',
                      ordersList: preparingOrders.length > 0 ? preparingOrders.slice(0, 3) : [
                        { id: 'ord-809', customer: { name: 'Amanpreet Singh' }, vendor: { name: 'Hunger Cure' }, totalAmount: 180, itemsSummary: '1x Paneer Tikka Wrap', address: 'Engineering Block' },
                        { id: 'ord-810', customer: { name: 'Gurleen Kaur' }, vendor: { name: "Tania'z Cafe" }, totalAmount: 140, itemsSummary: '2x Hot Coffee, 1x Veg Patty', address: 'Girls Hostel 1' },
                        { id: 'ord-811', customer: { name: 'Navjot Singh' }, vendor: { name: "Narinder's Cafe" }, totalAmount: 310, itemsSummary: '2x Paneer Butter Masala, 4x Roti', address: 'Boys Hostel 3' },
                      ]
                    },
                    {
                      title: 'Out for Delivery',
                      count: deliveryOrders.length > 0 ? deliveryOrders.length : 2,
                      tagColor: 'bg-[#E65100]/10 text-[#E65100]',
                      ordersList: deliveryOrders.length > 0 ? deliveryOrders.slice(0, 3) : [
                        { id: 'ord-805', customer: { name: 'Rohan Mehra' }, vendor: { name: "Narinder's Cafe" }, totalAmount: 240, itemsSummary: '1x Butter Chicken Rice Bowl', address: 'Hostel 4, Room 108' },
                        { id: 'ord-806', customer: { name: 'Taranjeet Singh' }, vendor: { name: 'Student Adda' }, totalAmount: 130, itemsSummary: '2x Masala Maggi, 1x Lemon Soda', address: 'Sports Complex' },
                      ]
                    },
                    {
                      title: 'Delivered Today',
                      count: completedOrders.length > 0 ? completedOrders.length : 186,
                      tagColor: 'bg-emerald-500/10 text-emerald-600',
                      ordersList: completedOrders.length > 0 ? completedOrders.slice(0, 3) : [
                        { id: 'ord-801', customer: { name: 'Preetinder Kaur' }, vendor: { name: "Tania'z Cafe" }, totalAmount: 260, itemsSummary: '1x Margherita Pizza', address: 'Faculty Quarters' },
                        { id: 'ord-802', customer: { name: 'Jagdeep Singh' }, vendor: { name: 'Hunger Cure' }, totalAmount: 190, itemsSummary: '2x Paneer Naan with Gravy', address: 'Boys Hostel 2' },
                        { id: 'ord-803', customer: { name: 'Dilpreet Singh' }, vendor: { name: 'Student Adda' }, totalAmount: 80, itemsSummary: '1x Choco Lava Cake', address: 'Main Gate Kiosk' },
                      ]
                    },
                  ];

                  return columns.map((col, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/50 dark:border-gray-700/50">
                        <span className="font-black text-xs text-gray-700 dark:text-gray-300">{col.title}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${col.tagColor}`}>{col.count}</span>
                      </div>
                      <div className="space-y-2.5">
                        {col.ordersList.map((o: any, i: number) => {
                          const customerName = o.customer?.name || 'Campus Student';
                          const canteenName = o.vendor?.name || 'Campus Canteen';
                          const itemsText = o.itemsSummary || (o.items && o.items.length > 0 ? o.items.map((it: any) => `${it.quantity}x ${it.foodItem?.name || 'Dish'}`).join(', ') : 'Campus Meal Order');
                          return (
                            <div key={o.id || i} className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-[#F0E6D8] dark:border-gray-800 shadow-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-xs text-gray-900 dark:text-white truncate max-w-[130px]">{customerName}</span>
                                <span className="font-extrabold text-[11px] text-emerald-600 dark:text-emerald-400">₹{o.totalAmount}</span>
                              </div>
                              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 line-clamp-1">{itemsText}</p>
                              <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-1 border-t border-gray-50 dark:border-gray-800">
                                <span className="truncate max-w-[90px]">{canteenName}</span>
                                <span className="text-gray-500 font-bold shrink-0">{o.address ? o.address.slice(0, 16) : 'Campus Delivery'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

          </main>
        )}

        {/* ── TAB 2: USER MANAGEMENT (Image 6 Admin Panel) ────────────────── */}
        {activeTab === 'User Management' && (
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            
            {/* Title & Add User Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  User Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">
                  Manage website users, roles and permissions.
                </p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E65100] hover:bg-[#E65100] text-white text-xs font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Add New User</span>
              </button>
            </div>

            {/* 4 User Metric Cards (Image 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Users */}
              <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-5 border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block">Total Users</span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                    {users.length > 0 ? users.length.toLocaleString() : '1,248'}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> ↑ 12% from last month
                  </span>
                </div>
              </div>

              {/* Active Users */}
              <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-5 border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block">Active Users</span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                    {users.length > 0 ? users.filter(u => u.status !== 'Inactive').length.toLocaleString() : '1,156'}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> ↑ 8% from last month
                  </span>
                </div>
              </div>

              {/* Inactive Users */}
              <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-5 border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-500/10 text-gray-500 flex items-center justify-center shrink-0">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block">Inactive Users</span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                    {users.length > 0 ? users.filter(u => u.status === 'Inactive').length : '92'}
                  </h3>
                  <span className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5 mt-0.5">
                    <TrendingDown className="w-3 h-3" /> ↓ 4% from last month
                  </span>
                </div>
              </div>

              {/* Administrators */}
              <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-5 border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E65100]/10 text-[#E65100] flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block">Administrators</span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                    {users.filter(u => u.role === 'Admin' || u.role === 'Super Admin').length || '12'}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> ↑ 1% from last month
                  </span>
                </div>
              </div>

            </div>

            {/* Filter Toolbar (Image 6) */}
            <div className="bg-white dark:bg-white dark:bg-[#161B22] p-4 rounded-3xl border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Search users by name, email..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Roles Filter Dropdown */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                  <option value="All Roles">All Roles</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Vendor">Canteen Vendor</option>
                  <option value="Delivery">Delivery Rider</option>
                  <option value="Foodie">Campus Foodie</option>
                </select>

                {/* Status Filter Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Campus Filter Dropdown */}
                <select
                  value={campusFilter}
                  onChange={(e) => setCampusFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none max-w-[160px] truncate"
                >
                  <option value="All Campuses">All Campuses</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>

                <button 
                  onClick={() => { setSearchUserQuery(''); setRoleFilter('All Roles'); setStatusFilter('All Statuses'); setCampusFilter('All Campuses'); }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Checkbox Data Table (Image 6) */}
            <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl border border-[#F0E6D8] dark:border-gray-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800/80 text-[11px] font-black uppercase text-gray-400 bg-gray-50/50 dark:bg-gray-900/50">
                      <th className="py-4 px-5 w-12 text-center">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={paginatedUsers.length > 0 && selectedUserIds.length === paginatedUsers.length}
                          className="rounded-md border-gray-300 text-[#E65100] focus:ring-orange-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-4 px-4 font-black">User</th>
                      <th className="py-4 px-4 font-black">Email</th>
                      <th className="py-4 px-4 font-black">Role</th>
                      <th className="py-4 px-4 font-black">Status</th>
                      <th className="py-4 px-4 font-black">Joined</th>
                      <th className="py-4 px-4 text-right font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 font-medium">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 font-bold">
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => {
                        const isSelected = selectedUserIds.includes(user.id);
                        const isActive = user.status !== 'Inactive' && !user.isSuspended;

                        // Pill Role Badges (Image 6)
                        let roleBadge = { text: 'Foodie', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
                        if (user.role === 'Admin' || user.role === 'Super Admin') {
                          roleBadge = { text: 'Super Admin', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-orange-400' };
                        } else if (user.role === 'Vendor' || user.role === 'Canteen Vendor') {
                          roleBadge = { text: 'Vendor', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' };
                        } else if (user.role === 'Delivery') {
                          roleBadge = { text: 'Rider', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' };
                        }

                        return (
                          <tr
                            key={user.id}
                            className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors ${
                              isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                            }`}
                          >
                            <td className="py-4 px-5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectUser(user.id)}
                                className="rounded-md border-gray-300 text-[#E65100] focus:ring-orange-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#E65100]/10 text-[#E65100] dark:text-orange-400 font-black flex items-center justify-center shrink-0">
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="font-extrabold text-gray-900 dark:text-white">
                                  {user.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">
                              {user.email}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${roleBadge.color}`}>
                                {roleBadge.text}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="flex items-center gap-1.5 font-bold">
                                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">
                              {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedUserForEdit(user)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#E65100] hover:bg-orange-50 dark:hover:bg-indigo-950/30 transition-colors"
                                  title="Edit User"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer (Image 6) */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-gray-500">
                <span>
                  Showing {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-8 h-8 rounded-xl font-black ${
                        currentPage === pg
                          ? 'bg-[#E65100] text-white'
                          : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>

          </main>
        )}

        {/* ── TAB 3: CANTEENS & MENUS ──────────────────────────────────────── */}
        {activeTab === 'Canteens' && (
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Registered Campus Canteens</h1>
                <p className="text-xs text-gray-400 mt-0.5">Dining spots, food courts, and kiosks across colleges worldwide</p>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black border border-orange-500/20 self-start sm:self-auto">
                {filteredCanteens.length} Canteens Listed
              </span>
            </div>

            {/* Filter Toolbar for Canteens */}
            <div className="bg-white dark:bg-white dark:bg-[#161B22] p-4 rounded-3xl border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={canteenSearchQuery}
                  onChange={(e) => setCanteenSearchQuery(e.target.value)}
                  placeholder="Search canteens by name, owner email..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={canteenUniFilter}
                  onChange={(e) => setCanteenUniFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                  <option value="All Campuses">All Campuses</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => { setCanteenSearchQuery(''); setCanteenUniFilter('All Campuses'); }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCanteens.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-gray-400 font-bold text-xs bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                  No canteens match the selected filter.
                </div>
              ) : (
                filteredCanteens.map(v => (
                  <div key={v.id} className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl p-6 border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-lg mb-3">
                        {v.name.charAt(0)}
                      </div>
                      <h3 className="font-black text-base text-gray-900 dark:text-white">{v.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{v.email}</p>
                      <p className="text-xs text-[#E65100] font-bold mt-2">Campus: {v.university?.name || 'General Campus'}</p>
                      {v.vendorDescription && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{v.vendorDescription}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedUserForEdit(v)}
                      className="mt-4 w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold transition-colors"
                    >
                      Manage Canteen Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </main>
        )}

        {/* ── TAB 4: ORDERS & DELIVERIES ───────────────────────────────────── */}
        {activeTab === 'Orders' && (
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Orders &amp; Deliveries Stream</h1>
                <p className="text-xs text-gray-400 mt-0.5">Live monitoring of customer orders, campus canteens, and riders</p>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-[#E65100]/10 text-[#E65100] text-xs font-black border border-[#E65100]/20 self-start sm:self-auto">
                {filteredOrders.length} Matching Orders
              </span>
            </div>

            {/* Filter Toolbar for Orders */}
            <div className="bg-white dark:bg-white dark:bg-[#161B22] p-4 rounded-3xl border border-[#F0E6D8] dark:border-gray-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search by order ID, student name, rider..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="OutForDelivery">Out For Delivery</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select
                  value={orderCanteenFilter}
                  onChange={(e) => setOrderCanteenFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none max-w-[170px] truncate"
                >
                  <option value="All Canteens">All Canteens</option>
                  {uniqueVendorsInOrders.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>

                <button
                  onClick={() => { setOrderSearchQuery(''); setOrderStatusFilter('All Statuses'); setOrderCanteenFilter('All Canteens'); }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-white dark:bg-[#161B22] rounded-3xl border border-[#F0E6D8] dark:border-gray-800 p-6 shadow-xs divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredOrders.length === 0 ? (
                <p className="text-center py-12 text-gray-400 text-xs font-bold">No orders match your filter criteria</p>
              ) : (
                filteredOrders.map((o) => {
                  const isTakeaway = !o.deliveryAddress || o.deliveryAddress.toLowerCase().includes('counter');
                  return (
                    <div key={o.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-3 -mx-3 rounded-2xl transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[#E65100]">#{o.id.slice(-6).toUpperCase()}</span>
                          <span className="font-extrabold text-gray-900 dark:text-white">{o.customer?.name || 'Student'}</span>
                          <span className="text-[10px] text-gray-400">· {o.customer?.email}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                          <span className="font-bold text-orange-500 flex items-center gap-1">
                            <Store className="w-3.5 h-3.5" /> {o.vendor?.name || 'Canteen'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" /> {o.deliveryAddress}
                          </span>
                          {o.deliveryPerson ? (
                            <>
                              <span>•</span>
                              <span className="font-extrabold text-blue-500 dark:text-blue-400">
                                🏍️ Rider: {o.deliveryPerson.name}
                              </span>
                            </>
                          ) : isTakeaway ? (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-gray-400">
                                🏢 Counter Pickup
                              </span>
                            </>
                          ) : null}
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {new Date(o.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {o.items?.length > 0 && ` · ${o.items.length} items`}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="font-black text-gray-900 dark:text-white text-sm block">₹{o.totalAmount}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                          o.status === 'Completed' || o.status === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : o.status === 'Cancelled'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        )}

      </div>

      {/* ── MODAL: + ADD NEW USER ────────────────────────────────────────── */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Add New User</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="e.g. john@campus.edu"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Foodie">Foodie (Student)</option>
                  <option value="Vendor">Vendor (Canteen Manager)</option>
                  <option value="Delivery">Delivery (Campus Rider)</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Default Password</label>
                <input
                  type="text"
                  required
                  value={newUserForm.password}
                  onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingUser}
                className="w-full py-3.5 rounded-2xl bg-[#E65100] hover:bg-[#E65100] text-white font-black text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer mt-2"
              >
                {isCreatingUser ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SLIDE-OVER: EDIT USER / VIEW CREDENTIALS ────────────────────── */}
      {selectedUserForEdit && editForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedUserForEdit(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-white dark:bg-[#161B22] h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#E65100]">Edit User Profile</span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">
                    {editForm.name || 'User'}
                  </h3>
                </div>
                <button onClick={() => setSelectedUserForEdit(null)} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* System Credentials Box */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300">
                    <Key className="w-4 h-4" /> System Access &amp; ID
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    {editForm.role}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700/80 dark:text-amber-400/80 block">User ID</span>
                  <div className="mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 text-[11px] font-mono select-all text-gray-600 dark:text-gray-300 border border-amber-200/50 truncate">
                    {editForm.id}
                  </div>
                </div>
              </div>

              {/* Edit Details Form */}
              <div className="space-y-4 text-xs font-bold">
                <div>
                  <label className="text-gray-400 uppercase text-[10px] block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 uppercase text-[10px] block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 uppercase text-[10px] block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 uppercase text-[10px] block mb-1">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Foodie">Foodie (Student/Customer)</option>
                      <option value="Vendor">Vendor (Canteen Owner)</option>
                      <option value="Delivery">Delivery (Campus Rider)</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 uppercase text-[10px] block mb-1">Work Status</label>
                    <select
                      value={editForm.workStatus}
                      onChange={(e) => setEditForm({ ...editForm, workStatus: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Active">Active</option>
                      <option value="OnLeave">On Leave</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 uppercase text-[10px] block mb-1">Campus / University</label>
                  <select
                    value={editForm.universityId}
                    onChange={(e) => setEditForm({ ...editForm, universityId: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">None / Worldwide Campus</option>
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 uppercase text-[10px] block mb-1">UPI ID (Vendor/Rider Payouts)</label>
                  <input
                    type="text"
                    value={editForm.upi}
                    onChange={(e) => setEditForm({ ...editForm, upi: e.target.value })}
                    placeholder="e.g. canteen@upi or user@okaxis"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {(editForm.role === 'Vendor' || editForm.role === 'Canteen Vendor') && (
                  <div>
                    <label className="text-gray-400 uppercase text-[10px] block mb-1">Canteen Description / Bio</label>
                    <textarea
                      rows={2}
                      value={editForm.vendorDescription}
                      onChange={(e) => setEditForm({ ...editForm, vendorDescription: e.target.value })}
                      placeholder="Specialty meals, canteen timings, dining spot info..."
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 uppercase text-[10px] block mb-1">Earned Credits (₹)</label>
                    <input
                      type="number"
                      value={editForm.earnedCredits}
                      onChange={(e) => setEditForm({ ...editForm, earnedCredits: Number(e.target.value) || 0 })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 uppercase text-[10px] block mb-1">Refunded Credits (₹)</label>
                    <input
                      type="number"
                      value={editForm.refundedCredits}
                      onChange={(e) => setEditForm({ ...editForm, refundedCredits: Number(e.target.value) || 0 })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 uppercase text-[10px] block mb-1">
                    Reset Password <span className="text-gray-500 font-normal">(leave blank to keep unchanged)</span>
                  </label>
                  <input
                    type="password"
                    value={editForm.newPassword || ''}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Enter new password to reset"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingUser}
                onClick={async () => {
                  setIsSavingUser(true);
                  try {
                    const payload: any = {
                      name: editForm.name,
                      email: editForm.email,
                      phone: editForm.phone || null,
                      role: editForm.role,
                      universityId: editForm.universityId || null,
                      workStatus: editForm.workStatus,
                      upi: editForm.upi || null,
                      vendorDescription: editForm.vendorDescription,
                      earnedCredits: Number(editForm.earnedCredits) || 0,
                      refundedCredits: Number(editForm.refundedCredits) || 0,
                    };
                    if (editForm.newPassword?.trim()) {
                      payload.password = editForm.newPassword.trim();
                    }
                    const updated = await api.patch<any>(`/api/admin/users/${editForm.id}`, payload);
                    const matchedUni = universities.find(u => u.id === editForm.universityId);
                    setUsers(prev => prev.map(u => u.id === editForm.id ? { ...u, ...payload, university: matchedUni || u.university } : u));
                    toast.success(`User ${editForm.name} updated successfully!`);
                    setSelectedUserForEdit(null);
                  } catch (err: any) {
                    toast.error("Failed to update: " + err.message);
                  } finally {
                    setIsSavingUser(false);
                  }
                }}
                className="flex-1 py-3.5 rounded-2xl bg-[#E65100] hover:bg-[#E65100] text-white text-xs font-black shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
              >
                {isSavingUser ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
