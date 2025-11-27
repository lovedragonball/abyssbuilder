"use client"

import * as React from "react"
import Link from "next/link"
import { PageTemplate } from "@/components/page-template"
import { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardContent } from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, Layers, Trophy, Map } from "lucide-react"

export default function PageTransitionsDemo() {
  return (
    <PageTemplate className="space-y-8 max-w-6xl mx-auto">
      <PageTemplate.Item>
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
            Page Transitions Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Navigate between pages to see smooth fade and slide transitions with a loading progress bar.
          </p>
        </div>
      </PageTemplate.Item>

      <PageTemplate.Item>
        <EnhancedCard variant="elevated">
          <EnhancedCardHeader>
            <EnhancedCardTitle>How It Works</EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">Navigation Progress Bar</h3>
              <p className="text-sm text-muted-foreground">
                A gradient loading bar appears at the top of the page when you navigate, 
                providing visual feedback that the page is loading.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">Page Transitions</h3>
              <p className="text-sm text-muted-foreground">
                Pages fade in with a subtle slide-up animation on enter, and fade out with 
                a slide-down animation on exit for smooth visual continuity.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">Staggered Animations</h3>
              <p className="text-sm text-muted-foreground">
                Content sections animate in sequence with a stagger effect, creating a 
                polished and professional feel.
              </p>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </PageTemplate.Item>

      <PageTemplate.Item>
        <EnhancedCard variant="glass">
          <EnhancedCardHeader>
            <EnhancedCardTitle>Try It Out</EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Click any of these links to navigate and see the page transitions in action:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/">
                <Button variant="gradient" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Homepage
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link href="/my-builds">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    My Builds
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link href="/tier-list">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Tier List
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link href="/map">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Interactive Map
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </PageTemplate.Item>

      <PageTemplate.Item>
        <EnhancedCard variant="bordered">
          <EnhancedCardHeader>
            <EnhancedCardTitle>Features</EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Smooth fade and slide animations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Loading progress bar with gradient effect</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Staggered content animations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>GPU-accelerated for smooth 60fps performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Respects user's motion preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Automatic cleanup and memory management</span>
              </li>
            </ul>
          </EnhancedCardContent>
        </EnhancedCard>
      </PageTemplate.Item>
    </PageTemplate>
  )
}
