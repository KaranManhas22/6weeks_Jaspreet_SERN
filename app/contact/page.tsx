'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ArrowLeft, Mail, Phone, User, Send, CheckCircle, AlertCircle, HelpCircle, ChevronDown, MapPin } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ContactPage() {
  const { brandName } = useBrand();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'Suggestion' // Suggestion, Complaint, Inquiry
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      setStatus({ type: 'error', msg: 'Please enter a message.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const response = await api.post<any>('/api/contact', formData);
      setStatus({
        type: 'success',
        msg: response.message || 'Your suggestion / message has been successfully routed to Jaspreet Bhatia!'
      });
      setFormData({ name: '', email: '', subject: '', message: '', type: 'Suggestion' });
    } catch (err: any) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.error || 'Failed to submit feedback. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const FAQS = [
    {
      q: 'How does the UPI instant settlement work?',
      a: '{brandName} does not hold vendor funds or charge middleware commissions. When checkout is initiated, the system dynamically generates a payment request or QR code linked directly to the canteen owner\'s private UPI address. Payments clear instantly into the vendor\'s bank account.'
    },
    {
      q: 'Can canteens post jobs and hire riders?',
      a: 'Yes. Canteen vendors can list job vacancies (including title, salary, description) in their panel. Matriculated students search these vacancies and apply directly within their app. Once hired, canteens manage schedules and approve daily rider logs.'
    },
    {
      q: 'What is the COD cash verification flow?',
      a: 'For Cash on Delivery orders, delivery riders receive cash at the hostel gate. Riders record cash deposits in their dashboard, which vendor admins verify. This prevents ledger mismatch and ensures riders settle physical cash daily.'
    },
    {
      q: 'How do I list my canteen on Foodzie?',
      a: 'Select "Business Inquiry" in our suggestion box or contact the support hub directly. Campus canteens must verify their registration credentials and provide a valid bank UPI ID to start accepting student orders.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden font-sans transition-colors duration-300 relative">
      
      {/* Branded Background Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/foodzie_bg_pattern.jpg')] bg-repeat opacity-[0.03] dark:opacity-[0.08] pointer-events-none z-0" />
      
      {/* ── Ambient background glows ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-orange-600/5 dark:bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-orange-500/5 dark:bg-orange-500/8 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">{brandName}</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start animate-in fade-in duration-750">
          {/* Contact Info Column (2/5) */}
          <section className="lg:col-span-2 space-y-6">
            <div>
              <span className="bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 dark:text-orange-400 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase">
                Support Hub
              </span>
              <h1 className="text-3xl lg:text-4xl font-black mt-3 tracking-tight text-gray-900 dark:text-white">
                Get in Touch
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-2 leading-relaxed font-semibold">
                Have feedback, complaints, or suggestions regarding canteen menus, riders, or checkout experiences? Contact Jaspreet Bhatia or list your campus canteen!
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 dark:border-gray-800 rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Owner / Director</h4>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">Jaspreet Bhatia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contact Number</h4>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">+91 7717670668</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Support Email</h4>
                  <a href="mailto:bhatiajaspreet161@gmail.com" className="text-sm font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:text-orange-400 mt-0.5 block transition-colors">
                    bhatiajaspreet161@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Operations Address</h4>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    93, Mehmadpur, Jalandhar, 144102, Punjab, India
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl text-xs text-gray-500 leading-relaxed font-bold">
              📢 Suggestions and canteens registrations are routed directly to Jaspreet Bhatia's desk. For specific issues with payment checks, please attach the associated Order ID.
            </div>
          </section>

          {/* Suggestion Box Form (3/5) */}
          <section className="lg:col-span-3 bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 dark:border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Suggestion & Complaint Box</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jass"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. jass@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Message Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="Suggestion">General Suggestion</option>
                  <option value="Complaint">Canteen / Rider Complaint</option>
                  <option value="Inquiry">Business / Canteen Registration Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Inquiry about Canteen Onboarding"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Message Body</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you want to share..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  required
                />
              </div>

              {status.type && (
                <div className={`p-4 rounded-xl flex items-start gap-3 text-xs ${
                  status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400'
                }`}>
                  {status.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{status.msg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-500/20 active:scale-98"
              >
                {loading ? 'Sending Feedback...' : 'Send Message'} <Send className="w-4 h-4" />
              </button>
            </form>
          </section>
        </div>

        {/* FAQs Accordion Section */}
        <section className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Everything you need to know about {brandName}</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-800 pb-4 font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-sm text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-2 focus:outline-none"
                >
                  <span className="font-extrabold flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180 text-orange-500' : 'text-gray-400'}`} />
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-2 pl-6 leading-relaxed font-medium animate-in slide-in-from-top-2 duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-xs text-gray-500 font-semibold relative z-10">
        © {new Date().getFullYear()} {brandName}. Designed and built by Jaspreet Bhatia. All rights reserved.
      </footer>
    </div>
  );
}
