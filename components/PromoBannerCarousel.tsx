'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Utensils, ShieldCheck, Clock } from 'lucide-react';

interface Slide {
  id: number;
  badge: string;
  badgeIcon?: any;
  title: string;
  subtitle: string;
  highlightPill1: string;
  highlightPill2: string;
  code: string;
  imageUrl: string;
  gradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    badge: 'Campus Specials Today',
    badgeIcon: Sparkles,
    title: 'Get Discount Voucher Up To 20% Off!',
    subtitle: 'Order fresh canteen favorites across campus. Skip waiting lines and pick up right when ready!',
    highlightPill1: '100% Pre-Paid Instant UPI',
    highlightPill2: 'Instant Campus Delivery',
    code: 'CAMPUS20',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    gradient: 'from-[#E65100] via-[#F97316] to-[#FB923C]'
  },
  {
    id: 2,
    badge: 'Lunch Rush Meal Deal',
    badgeIcon: Utensils,
    title: 'Flat ₹30 Off On All Special Thalis!',
    subtitle: "Tania'z Cafe & Narinder's Special Punjabi Combos served steaming hot with fresh chapatis and dal.",
    highlightPill1: 'Fresh Kitchen Preparation',
    highlightPill2: 'Pure Desi Ghee Prep',
    code: 'THALI30',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    gradient: 'from-[#D84315] via-[#E65100] to-[#F59E0B]'
  },
  {
    id: 3,
    badge: 'Evening Chai & Snacks',
    badgeIcon: Clock,
    title: 'Buy 2 Get 1 Free on Bakery & Samosas!',
    subtitle: 'Student Adda & Hunger Cure evening hot snacks with fresh green mint chutney and cutting chai.',
    highlightPill1: 'Ready in 10 Mins',
    highlightPill2: 'Student Saver Combo',
    code: 'SNACKS50',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    gradient: 'from-[#C2410C] via-[#EA580C] to-[#F97316]'
  }
];

export function PromoBannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon || Sparkles;

  return (
    <div 
      className="relative overflow-hidden rounded-3xl mb-8 text-white shadow-xl shadow-orange-500/15 transition-all duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`bg-gradient-to-r ${slide.gradient} p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10`}>
        {/* Left Column Text */}
        <div className="max-w-xl text-center md:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/25 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-wider mb-3 shadow-xs">
            <BadgeIcon className="w-3.5 h-3.5 fill-current text-white" />
            <span>{slide.badge}</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm font-semibold text-white/95 mt-2 max-w-md leading-relaxed drop-shadow-xs">
            {slide.subtitle}
          </p>

          {/* High-Contrast Action Pills: Explicit Colors to Prevent Overrides */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5 justify-center md:justify-start">
            <span 
              className="px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider shadow-sm"
              style={{ backgroundColor: '#1A1412', color: '#FFFFFF' }}
            >
              Code: {slide.code}
            </span>

            <span 
              className="px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm"
              style={{ backgroundColor: '#FFFFFF', color: '#E65100' }}
            >
              {slide.highlightPill1}
            </span>

            <span 
              className="hidden sm:inline-block px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white/20 text-white backdrop-blur-sm"
            >
              {slide.highlightPill2}
            </span>
          </div>
        </div>

        {/* Right Column Image & Slideshow Controls */}
        <div className="relative shrink-0 flex flex-col items-center justify-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/30 backdrop-blur-md p-3 shadow-inner flex items-center justify-center">
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover rounded-full shadow-lg transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2 mt-4">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all rounded-full ${
                  currentSlide === idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Decorative ambient elements */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all backdrop-blur-xs opacity-0 hover:opacity-100 group-hover:opacity-100"
        title="Previous Discount"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all backdrop-blur-xs opacity-0 hover:opacity-100 group-hover:opacity-100"
        title="Next Discount"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
