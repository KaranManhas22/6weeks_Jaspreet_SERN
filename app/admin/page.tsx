'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Inter, Poppins } from 'next/font/google';
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

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' });

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

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
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Email or Password');
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4">
        <div className="bg-[#111827] border border-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-600/30">
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
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-rose-400 text-xs font-semibold">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 mt-4 cursor-pointer"
            >
              Sign In to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminPanelMain onLogout={() => { removeToken(); setIsAuthenticated(false); }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN PANEL WITH FLOWTASK DASHBOARD & USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

function AdminPanelMain({ onLogout }: { onLogout: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'User Management' | 'Canteens' | 'Orders' | 'Settings'>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // User Management Filter & Selection States (Image 6)
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', phone: '', role: 'Foodie', password: 'password123' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchData = async () => {
    try {
      const [usersData, analyticsData, ordersData] = await Promise.all([
        api.get<any[]>('/api/admin/users').catch(() => []),
        api.get<any>('/api/admin/analytics').catch(() => null),
        api.get<any[]>('/api/admin/orders').catch(() => [])
      ]);
      setUsers(usersData || []);
      setAnalytics(analyticsData);
      setOrders(ordersData || []);
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
        const isActive = user.status !== 'Inactive' && !user.isSuspended;
        if (statusFilter === 'Active' && !isActive) return false;
        if (statusFilter === 'Inactive' && isActive) return false;
      }
      // Search
      if (searchUserQuery.trim()) {
        const q = searchUserQuery.toLowerCase();
        const matchesName = user.name?.toLowerCase().includes(q);
        const matchesEmail = user.email?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchUserQuery]);

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

  // FlowTask Donut Chart Data (Image 5)
  const taskDonutData = [
    { name: 'Completed', value: 186, color: '#3b82f6' },
    { name: 'In Progress', value: 48, color: '#60a5fa' },
    { name: 'To Do', value: 14, color: '#93c5fd' },
  ];

  // FlowTask Weekly Activity Bar Chart Data (Image 5)
  const weeklyActivityData = [
    { day: 'Mon', completed: 25, inProgress: 10, created: 5 },
    { day: 'Tue', completed: 32, inProgress: 12, created: 8 },
    { day: 'Wed', completed: 28, inProgress: 14, created: 6 },
    { day: 'Thu', completed: 36, inProgress: 8, created: 10 },
    { day: 'Fri', completed: 42, inProgress: 15, created: 12 },
    { day: 'Sat', completed: 22, inProgress: 6, created: 4 },
    { day: 'Sun', completed: 18, inProgress: 4, created: 3 },
  ];

  return (
    <div className={`min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] flex font-sans text-gray-900 dark:text-gray-100 ${inter.variable} ${poppins.variable}`}>
      
      {/* ── 1. DARK NAVY/INDIGO SIDEBAR (Image 6 Admin Panel Style) ─────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-white flex flex-col justify-between transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div>
          {/* Brand Crown Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
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
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
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
        <header className="h-20 bg-white dark:bg-[#111622] border-b border-gray-200/80 dark:border-gray-800 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between shadow-xs">
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
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20">
                SA
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-black text-gray-900 dark:text-white leading-none">Admin</span>
                <span className="text-[10px] text-gray-400 font-semibold leading-none">Super Admin</span>
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
                  Good morning, Sarah! <span className="animate-spin duration-1000">☀️</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">
                  Here&apos;s what&apos;s happening with your campus canteens today.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200/80 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 shadow-xs">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>May 1, 2026 – May 31, 2026</span>
              </div>
            </div>

            {/* 4 FlowTask Metric Cards (Image 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Active Canteens', value: '12', change: '↑ 25%', changeColor: 'text-emerald-500', icon: Store, bg: 'bg-blue-500/10 text-blue-500' },
                { title: 'Tasks Completed', value: '186', change: '↑ 18%', changeColor: 'text-emerald-500', icon: CheckCircle2, bg: 'bg-emerald-500/10 text-emerald-500' },
                { title: 'Pending Tasks', value: '48', change: '↓ 12%', changeColor: 'text-amber-500', icon: Clock, bg: 'bg-amber-500/10 text-amber-500' },
                { title: 'Team Members', value: '8', change: '↑ 0%', changeColor: 'text-indigo-500', icon: Users, bg: 'bg-indigo-500/10 text-indigo-500' },
              ].map((c, i) => (
                <div key={i} className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
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

            {/* FlowTask Middle Row: Progress (1/3) + Tasks Overview Donut (1/3) + This Week (1/3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Project / Canteen Progress */}
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-black text-gray-900 dark:text-white">Canteen Fulfillment</h3>
                  <span className="text-xs font-bold text-indigo-500 cursor-pointer">View All &gt;</span>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'SBBSU Main Canteen', pct: 78, color: 'bg-blue-500' },
                    { name: 'Engineering Food Court', pct: 62, color: 'bg-indigo-500' },
                    { name: 'Sports Complex Cafe', pct: 45, color: 'bg-emerald-500' },
                    { name: 'Night Kiosk & Bakery', pct: 90, color: 'bg-amber-500' },
                  ].map((p, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-gray-800 dark:text-gray-200">{p.name}</span>
                        <span className="text-gray-500">{p.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks Overview Donut */}
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white mb-4">Tasks Overview</h3>
                  <div className="h-40 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={68}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {taskDonutData.map((e, idx) => (
                            <Cell key={`task-${idx}`} fill={e.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">248</span>
                      <span className="text-[9px] font-black uppercase text-gray-400">Total Tasks</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mt-2 text-xs font-bold">
                  {taskDonutData.map((t) => (
                    <div key={t.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="text-gray-600 dark:text-gray-300">{t.name}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-black">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* This Week Mini Schedule */}
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-gray-900 dark:text-white">This Week</h3>
                    <span className="text-xs font-bold text-indigo-500 cursor-pointer">View Calendar &gt;</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-5 text-[10px] font-bold">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                      <div key={d} className={`p-1.5 rounded-xl ${i === 2 ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                        <span>{d}</span>
                        <span className="block text-xs font-black mt-0.5">{12 + i}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-2xl bg-blue-500/10 border-l-4 border-l-blue-500">
                      <span className="text-[10px] font-black uppercase text-blue-500 block">10:00 AM – 11:00 AM</span>
                      <p className="font-bold text-gray-900 dark:text-white mt-0.5">Campus Canteen Inspection</p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 border-l-4 border-l-amber-500">
                      <span className="text-[10px] font-black uppercase text-amber-500 block">1:00 PM – 2:00 PM</span>
                      <p className="font-bold text-gray-900 dark:text-white mt-0.5">Peak Lunch Rush Coordination</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* FlowTask Bottom Row: Team Members (1/3) + Tasks Activity (2/3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Team Members List */}
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-gray-900 dark:text-white">Campus Staff &amp; Riders</h3>
                  <span className="text-xs font-bold text-indigo-500 cursor-pointer">View All &gt;</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Miller', role: 'Ops Lead', status: 'Online', statusColor: 'bg-emerald-500' },
                    { name: 'James Wilson', role: 'Rider #1', status: 'Online', statusColor: 'bg-emerald-500' },
                    { name: 'Emily Davis', role: 'Kitchen Supervisor', status: 'In Kitchen', statusColor: 'bg-amber-500' },
                    { name: 'Michael Chen', role: 'Rider #2', status: 'Online', statusColor: 'bg-emerald-500' },
                    { name: 'Olivia Brown', role: 'Inventory QA', status: 'Away', statusColor: 'bg-gray-400' },
                  ].map((m) => (
                    <div key={m.name} className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white">{m.name}</p>
                          <span className="text-[10px] text-gray-400 font-semibold">{m.role}</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <span className={`w-2 h-2 rounded-full ${m.statusColor}`} />
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks Activity Stacked Bar Chart */}
              <div className="md:col-span-2 bg-white dark:bg-[#111622] rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white">Tasks Activity</h3>
                    <p className="text-xs text-gray-400">Weekly order completion and processing volume</p>
                  </div>
                  <span className="text-xs font-bold text-gray-400">Last 7 days ▾</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                      <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                      <Bar dataKey="completed" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="inProgress" stackId="a" fill="#60a5fa" />
                      <Bar dataKey="created" stackId="a" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* FlowTask Kanban Board Summary */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  Campus Order Kanban
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'To Do', count: 4, tagColor: 'bg-rose-500/10 text-rose-600', items: ['Prep Morning Sandwiches', 'Restock Cold Drinks'] },
                  { title: 'In Progress', count: 3, tagColor: 'bg-amber-500/10 text-amber-600', items: ['Grill Burger Order #812', 'Steam Dumplings Tray'] },
                  { title: 'Ready / Dispatch', count: 2, tagColor: 'bg-indigo-500/10 text-indigo-600', items: ['Handover Hostels Block 3', 'Counter Order #798'] },
                  { title: 'Delivered', count: 5, tagColor: 'bg-emerald-500/10 text-emerald-600', items: ['12x Thali Package', 'Sports Complex Shakes'] },
                ].map((col, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-gray-700 dark:text-gray-300">{col.title}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${col.tagColor}`}>{col.count}</span>
                    </div>
                    {col.items.map((it, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-xs font-bold text-gray-800 dark:text-gray-200">
                        {it}
                      </div>
                    ))}
                  </div>
                ))}
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
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/25 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Add New User</span>
              </button>
            </div>

            {/* 4 User Metric Cards (Image 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Users */}
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-4">
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
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-4">
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
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-4">
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
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
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
            <div className="bg-white dark:bg-[#111622] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Search users by name, email..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                <button 
                  onClick={() => { setSearchUserQuery(''); setRoleFilter('All Roles'); setStatusFilter('All Statuses'); }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Checkbox Data Table (Image 6) */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800/80 text-[11px] font-black uppercase text-gray-400 bg-gray-50/50 dark:bg-gray-900/50">
                      <th className="py-4 px-5 w-12 text-center">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={paginatedUsers.length > 0 && selectedUserIds.length === paginatedUsers.length}
                          className="rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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
                          roleBadge = { text: 'Super Admin', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' };
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
                                className="rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center shrink-0">
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
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
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
                          ? 'bg-indigo-600 text-white'
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
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Registered Campus Canteens</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {users.filter(u => u.role === 'Vendor' || u.role === 'Canteen Vendor').map(v => (
                <div key={v.id} className="bg-white dark:bg-[#111622] rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-lg mb-3">
                      {v.name.charAt(0)}
                    </div>
                    <h3 className="font-black text-base text-gray-900 dark:text-white">{v.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{v.email}</p>
                    <p className="text-xs text-indigo-500 font-bold mt-2">Campus: {v.university?.name || 'SBBSU Main Campus'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUserForEdit(v)}
                    className="mt-4 w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold transition-colors"
                  >
                    Manage Canteen
                  </button>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ── TAB 4: ORDERS & DELIVERIES ───────────────────────────────────── */}
        {activeTab === 'Orders' && (
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Live Orders Stream</h1>
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-xs divide-y divide-gray-100 dark:divide-gray-800">
              {orders.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-xs font-bold">No active orders</p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-gray-900 dark:text-white block">Order #{o.id.slice(-6)} · {o.customer?.name}</span>
                      <span className="text-[10px] text-gray-400">{o.deliveryAddress}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-gray-900 dark:text-white block">₹{o.totalAmount}</span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">{o.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        )}

      </div>

      {/* ── MODAL: + ADD NEW USER ────────────────────────────────────────── */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
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
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingUser}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2"
              >
                {isCreatingUser ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SLIDE-OVER: EDIT USER / VIEW CREDENTIALS ────────────────────── */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedUserForEdit(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#111622] h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase text-gray-400">User Details</span>
                <button onClick={() => setSelectedUserForEdit(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 font-black text-2xl flex items-center justify-center">
                  {selectedUserForEdit.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{selectedUserForEdit.name}</h3>
                  <span className="text-xs font-bold text-gray-400">{selectedUserForEdit.role}</span>
                </div>
              </div>

              {/* System Credentials Box */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl mb-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300">
                  <Key className="w-4 h-4" /> System Login Credentials
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700/80 dark:text-amber-400/80 block">Login ID</span>
                  <div className="mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 text-xs font-semibold select-all text-gray-900 dark:text-white border border-amber-200/50">
                    {selectedUserForEdit.email}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700/80 dark:text-amber-400/80 block">Default Password</span>
                  <div className="mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 text-xs font-mono font-bold select-all text-gray-900 dark:text-white border border-amber-200/50">
                    password123
                  </div>
                </div>
              </div>

              {/* Edit Details */}
              <div className="space-y-4 text-xs font-bold">
                <div>
                  <label className="text-gray-400 uppercase text-[10px] block mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedUserForEdit.name || ''}
                    onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3"
                  />
                </div>
                <div>
                  <label className="text-gray-400 uppercase text-[10px] block mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedUserForEdit.email || ''}
                    onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, email: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3"
                  />
                </div>
                <div>
                  <label className="text-gray-400 uppercase text-[10px] block mb-1">Phone</label>
                  <input
                    type="text"
                    value={selectedUserForEdit.phone || ''}
                    onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, phone: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.patch(`/api/admin/users/${selectedUserForEdit.id}`, {
                      name: selectedUserForEdit.name,
                      email: selectedUserForEdit.email,
                      phone: selectedUserForEdit.phone,
                      role: selectedUserForEdit.role
                    });
                    setUsers(prev => prev.map(u => u.id === selectedUserForEdit.id ? selectedUserForEdit : u));
                    toast.success("User updated successfully!");
                    setSelectedUserForEdit(null);
                  } catch (err: any) {
                    toast.error("Failed to update: " + err.message);
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/25"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
