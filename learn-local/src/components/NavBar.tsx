'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, Star } from 'lucide-react';
import { userProgress } from '@/lib/data';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/lesson', label: 'Lessons', icon: BookOpen },
  { href: '/progress', label: 'Journey', icon: Users },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
            🌱
          </div>
          <span className="font-bold text-xl text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Learn<span className="gradient-text">Local</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-stone-500 hover:text-orange-500 hover:bg-orange-50/60'
                }`}
              >
                <Icon size={15} />
                {label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-orange-400 to-rose-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* XP Badge */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
          <Star size={14} className="text-amber-500 fill-amber-400" />
          <span className="text-sm font-bold text-amber-700">{userProgress.xp} XP</span>
          <span className="text-xs text-amber-500 hidden sm:inline">· Lv.{userProgress.level}</span>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="sm:hidden flex border-t border-orange-50">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-colors ${
                active ? 'text-orange-500' : 'text-stone-400'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
