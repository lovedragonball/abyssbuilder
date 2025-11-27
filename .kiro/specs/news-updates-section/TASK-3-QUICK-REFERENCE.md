# Task 3: Known Issues Card - Quick Reference

## 🚀 Quick Start

```tsx
import { KnownIssuesCard } from "@/components/news/known-issues-card"

<KnownIssuesCard issues={knownIssues} />
```

## 📦 Props

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `issues` | `KnownIssue[]` | - | ✅ Yes |
| `maxHeight` | `string` | `"600px"` | ❌ No |
| `className` | `string` | - | ❌ No |
| `locale` | `string` | `"en"` | ❌ No |

## 🎨 Key Features

- ✧ Icon-based list
- 🎯 Term highlighting (cyan)
- 🌐 i18n (EN/TH)
- ♿ Full ARIA support
- 🎭 Hover animations
- 📜 Custom scrollbar

## 🔧 Common Usage

### Basic
```tsx
<KnownIssuesCard issues={issues} />
```

### Thai
```tsx
<KnownIssuesCard issues={issues} locale="th" />
```

### Custom Height
```tsx
<KnownIssuesCard issues={issues} maxHeight="400px" />
```

## 📝 Data Structure

```typescript
interface KnownIssue {
  id: string
  description: string
  highlightedTerms: string[]  // Without brackets!
}
```

## ✅ Requirements Met

- ✅ 3.1: Card title display
- ✅ 3.2: ✧ icon for each issue
- ✅ 3.3: Bracket term highlighting
- ✅ 3.4: Scrollable with max height
- ✅ 3.5: Readable typography
- ✅ 7.1: Thai language support
- ✅ 7.2: Thai character rendering

## 🧪 Testing

```bash
npm test -- src/components/news/__tests__/known-issues-card.test.tsx --watchAll=false
```

**Result**: 26/26 tests passing ✅

## 📍 Demo

```bash
npm run dev
# Visit: http://localhost:3000/demo/known-issues-card
```

## 📁 Files

- `src/components/news/known-issues-card.tsx` - Component
- `src/components/news/__tests__/known-issues-card.test.tsx` - Tests
- `src/app/demo/known-issues-card/page.tsx` - Demo
- `src/components/news/known-issues-card-README.md` - Docs

## 🎯 Next Task

**Task 4**: Implement Patch Notes Card component

---

**Status**: ✅ COMPLETE | **Tests**: 26/26 | **Date**: 2025-11-24
