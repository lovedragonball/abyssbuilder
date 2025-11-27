"use client"

/**
 * Demo page for News Updates Section performance features
 * Demonstrates caching, lazy loading, and error handling
 */

import * as React from "react"
import { Button } from "@/components/ui/button"
import { NewsUpdatesSectionLazy } from "@/components/news/news-updates-section-lazy"
import { NewsErrorBoundary } from "@/components/news/news-error-boundary"
import { NewsSkeleton } from "@/components/news/news-skeleton"
import { usePatchData } from "@/hooks/use-patch-data"
import { 
  clearCachedPatchData, 
  getCacheAge, 
  isCacheValid 
} from "@/lib/patch-cache"
import { RefreshCw, Trash2, Clock, CheckCircle, XCircle } from "lucide-react"

export default function NewsPerformanceDemoPage() {
  const { data, loading, error, fromCache, refetch, refresh } = usePatchData({
    useCache: true,
    immediate: true,
  })

  const [cacheInfo, setCacheInfo] = React.useState({
    age: getCacheAge(),
    valid: isCacheValid(),
  })

  const [loadTimes, setLoadTimes] = React.useState<number[]>([])

  // Update cache info periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCacheInfo({
        age: getCacheAge(),
        valid: isCacheValid(),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Track load time
  React.useEffect(() => {
    if (!loading && data) {
      const loadTime = performance.now()
      setLoadTimes(prev => [...prev, loadTime].slice(-5))
    }
  }, [loading, data])

  const handleRefetch = async () => {
    const startTime = performance.now()
    await refetch()
    const endTime = performance.now()
    console.log(`Refetch took ${endTime - startTime}ms`)
  }

  const handleRefresh = async () => {
    const startTime = performance.now()
    await refresh()
    const endTime = performance.now()
    console.log(`Refresh took ${endTime - startTime}ms`)
  }

  const handleClearCache = () => {
    clearCachedPatchData()
    setCacheInfo({
      age: null,
      valid: false,
    })
  }

  const formatCacheAge = (age: number | null) => {
    if (age === null) return 'No cache'
    const seconds = Math.floor(age / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            News Updates Performance Demo
          </h1>
          <p className="text-gray-400">
            Demonstrating caching, lazy loading, and error handling features
          </p>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Cache Status */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              {cacheInfo.valid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <h3 className="font-semibold">Cache Status</h3>
            </div>
            <p className="text-sm text-gray-400">
              {cacheInfo.valid ? 'Valid' : 'Invalid/Empty'}
            </p>
          </div>

          {/* Cache Age */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">Cache Age</h3>
            </div>
            <p className="text-sm text-gray-400">
              {formatCacheAge(cacheInfo.age)}
            </p>
          </div>

          {/* Data Source */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Data Source</h3>
            </div>
            <p className="text-sm text-gray-400">
              {loading ? 'Loading...' : fromCache ? 'From Cache' : 'Fresh Fetch'}
            </p>
          </div>

          {/* Load Status */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold">Load Status</h3>
            </div>
            <p className="text-sm text-gray-400">
              {loading ? 'Loading...' : error ? 'Error' : 'Loaded'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={handleRefetch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refetch (Use Cache)
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh (Clear Cache)
          </Button>

          <Button
            onClick={handleClearCache}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </div>

        {/* Performance Info */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-8">
          <h3 className="text-lg font-semibold mb-4">Performance Features</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Caching:</strong> Data is cached in localStorage for 1 hour
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Lazy Loading:</strong> Component is code-split and loaded on demand
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Memoization:</strong> Card components use React.memo to prevent unnecessary re-renders
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Error Boundary:</strong> Graceful error handling with fallback UI
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Loading Skeleton:</strong> Smooth loading state with skeleton UI
              </span>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">News Updates Section</h2>
          
          <NewsErrorBoundary>
            {loading && <NewsSkeleton />}
            
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                <p className="text-red-400 mb-4">Error: {error.message}</p>
                <Button onClick={handleRefetch} variant="outline">
                  Try Again
                </Button>
              </div>
            )}
            
            {!loading && !error && data && (
              <NewsUpdatesSectionLazy
                patchData={data}
                maxVisibleUpdates={5}
              />
            )}
          </NewsErrorBoundary>
        </div>

        {/* Cache Explanation */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">How Caching Works</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              <strong>First Load:</strong> Data is fetched from the server and cached in localStorage.
            </p>
            <p>
              <strong>Subsequent Loads:</strong> If cache is valid (less than 1 hour old), data is loaded instantly from cache.
            </p>
            <p>
              <strong>Cache Expiration:</strong> After 1 hour, the cache expires and fresh data is fetched.
            </p>
            <p>
              <strong>Manual Refresh:</strong> Use the "Refresh" button to clear cache and fetch fresh data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
