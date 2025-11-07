'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

const navItems = [
  { href: '/builds', label: 'Builds' },
  { href: '/create', label: 'New Build' },
];


export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-6 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-2 group" aria-label="AbyssBuilder Home">
          <span className="text-2xl font-headline font-bold text-foreground group-data-[collapsible=icon]:hidden tracking-wider group-hover:text-primary transition-colors">AbyssBuilder</span>
      </Link>
      <nav className="hidden md:flex items-center gap-4">
        {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
            </Link>
        ))}
      </nav>

      <div className="flex-grow" />
    </header>
  );
}
