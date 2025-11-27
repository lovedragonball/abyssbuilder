"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardContent } from "@/components/ui/enhanced-card"

export function ToastDemo() {
  const { toast, success, error, warning, info } = useToast()

  return (
    <EnhancedCard variant="elevated" className="w-full max-w-2xl">
      <EnhancedCardHeader>
        <EnhancedCardTitle>Enhanced Toast Notifications</EnhancedCardTitle>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="default"
            onClick={() => {
              toast({
                title: "Default Toast",
                description: "This is a default toast notification.",
              })
            }}
          >
            Show Default
          </Button>

          <Button
            variant="gradient"
            onClick={() => {
              success({
                title: "Success!",
                description: "Your action was completed successfully.",
              })
            }}
          >
            Show Success
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              error({
                title: "Error",
                description: "Something went wrong. Please try again.",
              })
            }}
          >
            Show Error
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              warning({
                title: "Warning",
                description: "Please review your input before proceeding.",
              })
            }}
          >
            Show Warning
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              info({
                title: "Information",
                description: "Here's some helpful information for you.",
              })
            }}
          >
            Show Info
          </Button>

          <Button
            variant="glass"
            onClick={() => {
              toast({
                title: "With Action",
                description: "This toast has an action button.",
                action: (
                  <Button variant="outline" size="sm">
                    Undo
                  </Button>
                ),
              })
            }}
          >
            With Action
          </Button>
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}
