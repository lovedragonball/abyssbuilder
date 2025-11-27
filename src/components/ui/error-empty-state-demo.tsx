"use client"

import * as React from "react"
import { 
  ErrorState, 
  InlineError, 
  FormFieldError, 
  ErrorBadge 
} from "./error-state"
import { 
  EmptyState, 
  CompactEmptyState, 
  EmptySearchResults, 
  EmptyList 
} from "./empty-state"
import { Button } from "./button"
import { Input } from "./input"

export function ErrorEmptyStateDemo() {
  const [showFormError, setShowFormError] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleRetry = () => {
    console.log("Retry clicked")
  }

  const handleCreateNew = () => {
    console.log("Create new clicked")
  }

  const handleClearSearch = () => {
    console.log("Clear search clicked")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue) {
      setShowFormError(true)
    } else {
      setShowFormError(false)
      console.log("Form submitted:", inputValue)
    }
  }

  return (
    <div className="space-y-16 p-8">
      <section>
        <h2 className="text-2xl font-bold mb-6">Error State Components</h2>
        
        <div className="space-y-8">
          {/* Full Error State */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Full Error State</h3>
            <ErrorState
              title="Failed to load builds"
              message="We couldn't load your builds. This might be due to a network issue or server error."
              onRetry={handleRetry}
            />
          </div>

          {/* Inline Error */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Inline Error Message</h3>
            <div className="max-w-md">
              <InlineError message="This field is required" />
              <div className="mt-4">
                <InlineError 
                  message="Password must be at least 8 characters" 
                  shake={true}
                />
              </div>
            </div>
          </div>

          {/* Form Field Error with Shake */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Form Field Error (with shake animation)</h3>
            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
              <FormFieldError
                error="Username is required"
                showError={showFormError}
              >
                <Input
                  placeholder="Enter username"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={showFormError ? "border-destructive" : ""}
                />
              </FormFieldError>
              <Button type="submit">Submit</Button>
            </form>
          </div>

          {/* Error Badge */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Error Badges</h3>
            <div className="flex flex-wrap gap-3">
              <ErrorBadge count={3} label="Error" />
              <ErrorBadge count={1} label="Warning" />
              <ErrorBadge label="Failed" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Empty State Components</h2>
        
        <div className="space-y-8">
          {/* Full Empty State */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Full Empty State</h3>
            <EmptyState
              title="No builds created yet"
              description="Start building your perfect character setup by creating your first build."
              icon="package"
              action={{
                label: "Create Build",
                onClick: handleCreateNew,
                variant: "gradient"
              }}
              secondaryAction={{
                label: "Browse Examples",
                onClick: () => console.log("Browse clicked")
              }}
            />
          </div>

          {/* Compact Empty State */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Compact Empty State</h3>
            <CompactEmptyState
              message="No favorites yet"
              icon="favorites"
              action={{
                label: "Browse Builds",
                onClick: () => console.log("Browse clicked")
              }}
            />
          </div>

          {/* Empty Search Results */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Empty Search Results</h3>
            <EmptySearchResults
              query="legendary sword"
              onClear={handleClearSearch}
              suggestions={["weapons", "armor", "accessories"]}
            />
          </div>

          {/* Empty List */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Empty List</h3>
            <EmptyList
              type="teams"
              onCreateNew={handleCreateNew}
            />
          </div>

          {/* Different Icons */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Different Icon Variants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CompactEmptyState message="No files" icon="file" />
              <CompactEmptyState message="No users" icon="users" />
              <CompactEmptyState message="No results" icon="search" />
              <CompactEmptyState message="Empty folder" icon="folder" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
