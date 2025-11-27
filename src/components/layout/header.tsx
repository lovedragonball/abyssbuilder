'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PlusCircle,
  Layers,
  Trophy,
  Map,
  Gauge,
  Hammer,
  Newspaper,
  Menu,
  Zap,
  Calculator
} from "lucide-react";
import { useState } from "react";
import MobileMenu from "./mobile-menu";
import { useRipple } from "@/hooks/use-ripple";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const navItems = [
  { href: '/create', label: 'New Build', icon: PlusCircle },
  { href: '/my-builds', label: 'My Build', icon: Layers },
  { href: '/demon-wedges', label: 'Demon Wedges Info', icon: Zap },
  { href: '/calculator', label: 'Damage Calculator', icon: Calculator },
  { href: '/tier-list', label: 'Tier List', icon: Trophy },
  { href: '/map', label: 'Interactive Map', icon: Map },
  { href: '/materials', label: 'Materials/Forging', icon: Hammer },
  { href: '/news', label: 'News & Updates', icon: Newspaper },
];


function NavItem({ item, isActive }: { item: typeof navItems[0], isActive: boolean }) {
  const { createRipple, ripples } = useRipple();
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="relative group/nav px-3 py-2 rounded-lg transition-all duration-300 hover:bg-background-elevated overflow-hidden"
      onClick={(e) => createRipple(e as any)}
    >
      <div className="flex items-center gap-2 relative z-10">
        <Icon
          className={`w-4 h-4 transition-all duration-300 group-hover/nav:scale-110 ${isActive
            ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]'
            : 'text-muted-foreground group-hover/nav:text-primary group-hover/nav:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]'
            }`}
        />
        <span
          className={`text-sm font-medium transition-all duration-300 ${isActive
            ? 'text-primary'
            : 'text-muted-foreground group-hover/nav:text-foreground'
            }`}
        >
          {item.label}
        </span>
      </div>

      {/* Animated underline indicator */}
      <span
        className={`absolute bottom-0 left-1/2 h-0.5 bg-gradient-primary rounded-full transition-all duration-300 z-10 ${isActive
          ? 'w-full -translate-x-1/2 opacity-100'
          : 'w-0 -translate-x-1/2 opacity-0 group-hover/nav:w-full group-hover/nav:opacity-100'
          }`}
      />

      {/* Glow effect on hover */}
      <span
        className={`absolute inset-0 rounded-lg transition-all duration-300 ${isActive
          ? 'bg-primary/5'
          : 'bg-transparent group-hover/nav:bg-primary/5'
          }`}
      />

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { createRipple, ripples } = useRipple();

  // Keyboard shortcuts for navigation
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      callback: () => router.push('/create'),
      description: 'Create new build',
    },
    {
      key: 'b',
      ctrl: true,
      callback: () => router.push('/my-builds'),
      description: 'View my builds',
    },
    {
      key: 'd',
      ctrl: true,
      callback: () => router.push('/calculator'),
      description: 'Open damage calculator',
    },
    {
      key: 't',
      ctrl: true,
      callback: () => router.push('/tier-list'),
      description: 'View tier list',
    },
    {
      key: 'm',
      ctrl: true,
      callback: () => router.push('/map'),
      description: 'View interactive map',
    },
    {
      key: '/',
      ctrl: true,
      callback: () => setMobileMenuOpen(prev => !prev),
      description: 'Toggle mobile menu',
    },
  ]);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-6 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 transition-all duration-300">
        <Link href="/" className="flex items-center gap-2 group" aria-label="AbyssBuilder Home">
          <span className="text-2xl font-headline font-bold text-foreground group-data-[collapsible=icon]:hidden tracking-wider inline-flex">
            {'AbyssBuilder'.split('').map((char, index) => (
              <span
                key={index}
                className="inline-block transition-all duration-200 group-hover:text-primary hover:scale-110 hover:-translate-y-1"
                style={{
                  transitionDelay: `${index * 30}ms`,
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </nav>

        <div className="flex-grow" />

        {/* Mobile menu button */}
        <button
          onClick={(e) => {
            createRipple(e as any);
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className="md:hidden p-2 rounded-lg hover:bg-background-elevated transition-colors relative overflow-hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-6 h-6 text-foreground relative z-10" />
          {ripples.map(ripple => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 0,
                height: 0,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </button>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={navItems}
      />
    </>
  );
}
