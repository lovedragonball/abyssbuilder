"use client"

import * as React from "react"
import { SkeletonLoader } from "./skeleton-loader"
import { ProgressIndicator } from "./progress-indicator"
import { Button } from "./button"

export function LoadingFeedbackDemo() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [progress, setProgress] = React.useState(0)

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [isLoading])

  // Simulate progress
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Loading and Feedback Components Demo</h2>
      </div>

      {/* SkeletonLoader Variants */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold">SkeletonLoader Variants</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Card Variant</h4>
            <SkeletonLoader variant="card" count={2} className="max-w-sm" />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">List Variant</h4>
            <SkeletonLoader variant="list" count={3} className="max-w-md" />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Text Variant</h4>
            <SkeletonLoader variant="text" count={2} className="max-w-lg" />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Avatar Variant</h4>
            <SkeletonLoader variant="avatar" count={3} className="max-w-xs" />
          </div>
        </div>
      </section>

      {/* SkeletonLoader with Content Loading */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold">SkeletonLoader with Content Transition</h3>
        
        <div className="flex gap-4 mb-4">
          <Button onClick={() => setIsLoading(true)}>Show Loading</Button>
          <Button onClick={() => setIsLoading(false)} variant="outline">Show Content</Button>
        </div>

        <SkeletonLoader variant="card" isLoading={isLoading} className="max-w-sm">
          <div className="rounded-lg border border-border bg-card p-6">
            <h4 className="text-lg font-semibold mb-2">Content Loaded!</h4>
            <p className="text-muted-foreground">
              This content appears with a smooth fade-in transition after the skeleton loader.
            </p>
          </div>
        </SkeletonLoader>
      </section>

      {/* ProgressIndicator Linear */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold">ProgressIndicator - Linear Variant</h3>
        
        <div className="space-y-4 max-w-md">
          <ProgressIndicator 
            progress={progress} 
            label="Upload Progress" 
            size="sm"
          />
          
          <ProgressIndicator 
            progress={progress} 
            label="Processing..." 
            size="md"
          />
          
          <ProgressIndicator 
            progress={progress} 
            label="Large Progress Bar" 
            size="lg"
          />
          
          <ProgressIndicator 
            progress={progress} 
            showPercentage={false}
            label="Without Percentage"
          />
        </div>
      </section>

      {/* ProgressIndicator Circular */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold">ProgressIndicator - Circular Variant</h3>
        
        <div className="flex gap-8 flex-wrap">
          <ProgressIndicator 
            progress={progress} 
            variant="circular"
            label="Small"
            size="sm"
          />
          
          <ProgressIndicator 
            progress={progress} 
            variant="circular"
            label="Medium"
            size="md"
          />
          
          <ProgressIndicator 
            progress={progress} 
            variant="circular"
            label="Large"
            size="lg"
          />
          
          <ProgressIndicator 
            progress={progress} 
            variant="circular"
            showPercentage={false}
            label="No Percentage"
          />
        </div>
      </section>

      {/* Reset Button */}
      <div className="flex gap-4">
        <Button 
          onClick={() => {
            setProgress(0)
            setIsLoading(true)
          }}
          variant="gradient"
        >
          Reset Demo
        </Button>
      </div>
    </div>
  )
}
