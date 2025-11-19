'use client';

import Link from "next/link";

const navItems = [
  { href: '/create', label: 'New Build' },
  { href: '/my-builds', label: 'My Build' },
  { href: '/tier-list', label: 'Tier List' },
  { href: '/map', label: 'Interactive Map' },
  { href: '/attribute-optimizer', label: 'Attribute Optimizer' },
  { href: '/materials', label: 'Materials/Forging' },
  { href: '/news', label: 'News & Updates' },
];


export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-6 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
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
      <nav className="hidden md:flex items-center gap-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group/nav">
            <span className="inline-flex">
              {item.label.split('').map((char, index) => (
                <span
                  key={index}
                  className="inline-block transition-all duration-200"
                  style={{
                    animation: `none`,
                    transitionDelay: `${index * 20}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.animation = 'bounceSmall 0.4s ease-in-out';
                    e.currentTarget.style.textShadow = '0 0 10px rgba(59, 130, 246, 0.6)';
                  }}
                  onAnimationEnd={(e) => {
                    e.currentTarget.style.animation = 'none';
                    e.currentTarget.style.textShadow = 'none';
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </Link>
        ))}
      </nav>

      <div className="flex-grow" />
    </header>
  );
}
