"use client"

import { Button } from "./button"

export function ButtonDemo() {
  return (
    <div className="flex flex-col gap-8 p-8 bg-background min-h-screen">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Button Variants Demo</h2>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>

        <h3 className="text-xl font-semibold mt-8">New Variants</h3>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="gradient">Gradient Button</Button>
          <Button variant="gradient" size="lg">Large Gradient</Button>
          <Button variant="gradient" size="sm">Small Gradient</Button>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="glass">Glass Button</Button>
          <Button variant="glass" size="lg">Large Glass</Button>
          <Button variant="glass" size="sm">Small Glass</Button>
        </div>

        <h3 className="text-xl font-semibold mt-8">With Icons</h3>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="gradient">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Item
          </Button>
          
          <Button variant="glass">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Click any button to see the ripple effect animation!
        </p>
      </div>
    </div>
  )
}
