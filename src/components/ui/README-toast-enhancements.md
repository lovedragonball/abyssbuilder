# Enhanced Toast Notification System

## Overview

The toast notification system has been enhanced with semantic color variants, icons, and improved animations to provide better user feedback.

## Features

### Semantic Variants

The toast component now supports five semantic variants:

1. **Default** - Standard notifications
2. **Success** - Positive feedback (green theme with CheckCircle icon)
3. **Error** - Error messages (red theme with AlertCircle icon)
4. **Warning** - Warning messages (yellow theme with AlertTriangle icon)
5. **Info** - Informational messages (blue theme with Info icon)

### Visual Enhancements

- **Icons**: Each semantic variant includes an appropriate icon that animates in with a spring effect
- **Backdrop Blur**: Toast notifications have a subtle backdrop blur for better readability
- **Elevated Shadow**: Enhanced shadow system for better depth perception
- **Smooth Animations**: 
  - Entrance: Slide in from top (mobile) or bottom (desktop) with fade
  - Exit: Slide out to right with fade
  - Icon: Spring animation with rotation
  - Close button: Scale animation on hover/tap

### Improved Styling

- Rounded corners with `rounded-lg` for modern appearance
- Semantic color schemes with proper contrast
- Responsive padding and spacing
- Better close button visibility on hover

## Usage

### Basic Usage

```tsx
import { useToast } from "@/hooks/use-toast"

function MyComponent() {
  const { toast } = useToast()

  return (
    <button
      onClick={() => {
        toast({
          title: "Notification",
          description: "This is a toast message.",
        })
      }}
    >
      Show Toast
    </button>
  )
}
```

### Semantic Variants

```tsx
import { useToast } from "@/hooks/use-toast"

function MyComponent() {
  const { success, error, warning, info } = useToast()

  return (
    <>
      <button onClick={() => success({ title: "Success!", description: "Action completed." })}>
        Success
      </button>
      
      <button onClick={() => error({ title: "Error", description: "Something went wrong." })}>
        Error
      </button>
      
      <button onClick={() => warning({ title: "Warning", description: "Please review." })}>
        Warning
      </button>
      
      <button onClick={() => info({ title: "Info", description: "Helpful information." })}>
        Info
      </button>
    </>
  )
}
```

### With Action Button

```tsx
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

function MyComponent() {
  const { toast } = useToast()

  return (
    <button
      onClick={() => {
        toast({
          title: "Item deleted",
          description: "Your item has been removed.",
          action: (
            <Button variant="outline" size="sm" onClick={() => console.log("Undo")}>
              Undo
            </Button>
          ),
        })
      }}
    >
      Delete Item
    </button>
  )
}
```

## API Reference

### useToast Hook

Returns an object with the following methods:

- `toast(props)` - Show a toast with custom props
- `success(props)` - Show a success toast (green)
- `error(props)` - Show an error toast (red)
- `warning(props)` - Show a warning toast (yellow)
- `info(props)` - Show an info toast (blue)
- `dismiss(toastId?)` - Dismiss a specific toast or all toasts

### Toast Props

```typescript
interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "success" | "error" | "warning" | "info" | "destructive"
  action?: ToastActionElement
}
```

## Accessibility

- Proper ARIA attributes for screen readers
- Keyboard navigation support
- Focus management for close button
- Swipe gestures for mobile dismissal
- Respects `prefers-reduced-motion` for animations

## Requirements Satisfied

- **Requirement 4.4**: Toast notifications with appropriate icons and colors
- **Requirement 6.5**: Semantic colors (success green, warning yellow, error red) used consistently

## Demo

See `src/components/ui/toast-demo.tsx` for a complete demonstration of all toast variants and features.
