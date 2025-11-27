# Design Document

## Overview

เอกสารนี้อธิบายการออกแบบการแก้ไขปัญหาการแสดงผลหน้าเพจที่ไม่แสดงเนื้อหาเมื่อผู้ใช้คลิกไปที่เมนูต่างๆ ปัญหาหลักมาจาก `PageTransition` component ที่ใช้ `AnimatePresence` จาก Framer Motion ซึ่งอาจมีปัญหาในการ render เนื้อหา

## Root Cause Analysis

จากการตรวจสอบโค้ด พบว่า:

1. **PageTransition Component** ใช้ `AnimatePresence` กับ `mode="wait"` ซึ่งจะรอให้ animation ของหน้าเก่าเสร็จก่อนที่จะแสดงหน้าใหม่
2. **Key Prop** ใช้ `pathname` เป็น key ซึ่งควรจะทำงานได้ถูกต้อง แต่อาจมีปัญหาถ้า pathname ไม่เปลี่ยนหรือมีค่าที่ไม่คาดคิด
3. **Initial Prop** ตั้งเป็น `false` ซึ่งอาจทำให้ animation ไม่ทำงานในครั้งแรก
4. **Animation Variants** อาจมีปัญหาที่ทำให้ content ติดอยู่ใน state ที่ไม่แสดงผล

## Architecture

### Current Architecture

```
RootLayout
  └── MainLayout
      ├── Header (Navigation)
      └── PageTransition (AnimatePresence)
          └── main
              └── {children} (Page Content)
```

### Proposed Solution

เราจะแก้ไขปัญหาโดย:

1. **ปรับปรุง PageTransition Component** เพื่อให้มี fallback mechanism
2. **เพิ่ม Error Boundary** สำหรับ animation errors
3. **ปรับ Animation Configuration** ให้มั่นใจว่าเนื้อหาจะแสดงผลเสมอ
4. **เพิ่ม Debug Mode** เพื่อตรวจสอบปัญหา

## Components and Interfaces

### 1. PageTransition Component (ปรับปรุง)

**Location:** `src/components/page-transition.tsx`

**Changes:**

```typescript
interface PageTransitionProps {
  children: React.ReactNode
  enableAnimation?: boolean // เพิ่ม option เพื่อปิด animation
}
```

**Key Improvements:**

- เพิ่ม state เพื่อตรวจสอบว่า animation พร้อมใช้งานหรือไม่
- เพิ่ม fallback เมื่อ animation มีปัญหา
- ปรับ `initial` prop ให้เป็น `true` เพื่อให้ animation ทำงานตั้งแต่ครั้งแรก
- เพิ่ม `onAnimationComplete` callback เพื่อตรวจสอบว่า animation เสร็จสมบูรณ์
- เพิ่ม timeout เพื่อ force render ถ้า animation ค้างนานเกินไป

### 2. SafePageTransition Component (ใหม่)

**Location:** `src/components/safe-page-transition.tsx`

**Purpose:** Wrapper component ที่มี error boundary สำหรับ animation

```typescript
interface SafePageTransitionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}
```

**Features:**

- Error boundary สำหรับจับ errors จาก Framer Motion
- Fallback UI เมื่อ animation ล้มเหลว
- Logging สำหรับ debugging

### 3. MainLayout Component (ปรับปรุง)

**Location:** `src/components/layout/main-layout.tsx`

**Changes:**

- เพิ่ม option เพื่อปิด/เปิด page transitions
- เพิ่ม loading state indicator
- เพิ่ม error handling

## Data Models

### Animation State

```typescript
interface AnimationState {
  isAnimating: boolean
  currentPath: string
  previousPath: string | null
  error: Error | null
}
```

### Page Transition Config

```typescript
interface PageTransitionConfig {
  enabled: boolean
  duration: number
  easing: string
  mode: 'wait' | 'sync' | 'popLayout'
  fallbackDelay: number // เวลาที่รอก่อนจะ fallback (ms)
}
```

## Error Handling

### 1. Animation Timeout

ถ้า animation ไม่เสร็จภายในเวลาที่กำหนด (เช่น 1000ms):
- Force render เนื้อหาใหม่ทันที
- Log warning สำหรับ debugging
- Disable animation สำหรับการนำทางครั้งถัดไป (optional)

### 2. Framer Motion Errors

ถ้า Framer Motion throw error:
- Catch error ด้วย Error Boundary
- แสดงเนื้อหาโดยไม่มี animation
- Log error details

### 3. Pathname Issues

ถ้า pathname ไม่เปลี่ยนหรือมีค่าที่ไม่ถูกต้อง:
- ใช้ timestamp หรือ counter เป็น key เพิ่มเติม
- Force re-render

## Testing Strategy

### 1. Unit Tests

**PageTransition Component:**
- ทดสอบว่า component render children ได้ถูกต้อง
- ทดสอบว่า animation trigger เมื่อ pathname เปลี่ยน
- ทดสอบ fallback mechanism
- ทดสอบ timeout behavior

**SafePageTransition Component:**
- ทดสอบ error boundary
- ทดสอบ fallback rendering

### 2. Integration Tests

**Navigation Flow:**
- ทดสอบการนำทางระหว่างหน้าต่างๆ
- ทดสอบ browser back/forward
- ทดสอบ direct URL access
- ทดสอบ page reload

**All Pages:**
- ทดสอบว่าทุกหน้าแสดงผลได้ถูกต้อง:
  - /my-builds
  - /tier-list
  - /map
  - /attribute-optimizer
  - /materials
  - /news

### 3. Manual Testing

**Browser Testing:**
- ทดสอบใน Chrome, Firefox, Safari, Edge
- ทดสอบใน mobile browsers
- ทดสอบ performance

**User Scenarios:**
- คลิกเมนูต่างๆ ตามลำดับ
- คลิกเมนูเดิมซ้ำ
- เปลี่ยนหน้าอย่างรวดเร็ว
- ใช้ keyboard navigation

## Implementation Approach

### Phase 1: Quick Fix (Immediate)

1. เพิ่ม fallback timeout ใน PageTransition
2. เปลี่ยน `initial={false}` เป็น `initial={true}`
3. เพิ่ม `onAnimationComplete` callback
4. ทดสอบว่าหน้าต่างๆ แสดงผลได้

### Phase 2: Robust Solution (Short-term)

1. สร้าง SafePageTransition component
2. เพิ่ม error boundary
3. เพิ่ม configuration options
4. เพิ่ม logging และ debugging tools

### Phase 3: Optimization (Long-term)

1. ปรับปรุง animation performance
2. เพิ่ม preloading สำหรับหน้าถัดไป
3. เพิ่ม custom animations สำหรับแต่ละหน้า
4. เพิ่ม user preferences สำหรับ animations

## Alternative Solutions Considered

### Option 1: ลบ PageTransition ออกทั้งหมด

**Pros:**
- แก้ปัญหาได้ทันที
- ไม่มี complexity จาก animations

**Cons:**
- สูญเสีย UX ที่ดีจาก page transitions
- ไม่ได้แก้ root cause

**Decision:** ไม่เลือก เพราะต้องการรักษา animations

### Option 2: ใช้ CSS Transitions แทน Framer Motion

**Pros:**
- Performance ดีกว่า
- ไม่ต้องพึ่ง JavaScript library

**Cons:**
- ต้องเขียนใหม่ทั้งหมด
- ความสามารถจำกัดกว่า

**Decision:** ไม่เลือก เพราะใช้เวลานานและมี animations อื่นๆ ที่ใช้ Framer Motion อยู่แล้ว

### Option 3: ใช้ Next.js App Router Transitions

**Pros:**
- Built-in support
- Optimized สำหรับ Next.js

**Cons:**
- ต้อง migrate ไป App Router (ถ้ายังไม่ได้ใช้)
- API อาจแตกต่างจากที่ใช้อยู่

**Decision:** พิจารณาในอนาคต แต่ตอนนี้แก้ปัญหาที่มีอยู่ก่อน

## Performance Considerations

1. **Animation Performance:**
   - ใช้ `transform` และ `opacity` เท่านั้น (GPU-accelerated)
   - หลีกเลี่ยง layout thrashing
   - ใช้ `will-change` อย่างระมัดระวัง

2. **Bundle Size:**
   - Framer Motion มีอยู่แล้ว ไม่เพิ่ม dependencies ใหม่
   - ใช้ tree-shaking เพื่อลด bundle size

3. **Runtime Performance:**
   - เพิ่ม timeout เพื่อป้องกัน animation ค้าง
   - ใช้ `React.memo` สำหรับ components ที่ไม่ต้อง re-render บ่อย

## Security Considerations

ไม่มี security concerns เฉพาะสำหรับ feature นี้ เพราะเป็นการแก้ไข UI component เท่านั้น

## Accessibility Considerations

1. **Reduced Motion:**
   - ตรวจสอบ `prefers-reduced-motion` media query
   - ปิด animations สำหรับผู้ใช้ที่ต้องการ

2. **Focus Management:**
   - ย้าย focus ไปยัง main content หลังจาก navigation
   - ประกาศการเปลี่ยนหน้าด้วย screen reader

3. **Keyboard Navigation:**
   - ตรวจสอบว่า keyboard navigation ยังทำงานได้ระหว่าง animation

## Migration Plan

1. **Backup Current Code:**
   - สำรองไฟล์ที่จะแก้ไข

2. **Implement Changes:**
   - แก้ไข PageTransition component
   - เพิ่ม SafePageTransition (optional)
   - Update MainLayout

3. **Testing:**
   - ทดสอบทุกหน้า
   - ทดสอบ edge cases

4. **Rollout:**
   - Deploy to staging
   - ทดสอบ UAT
   - Deploy to production

5. **Monitoring:**
   - ตรวจสอบ error logs
   - รับ feedback จากผู้ใช้
   - ปรับปรุงตามความจำเป็น

## Success Metrics

1. **Functional:**
   - ทุกหน้าแสดงผลได้ 100%
   - ไม่มี blank pages
   - Navigation ทำงานได้ทุก case

2. **Performance:**
   - Page transition < 500ms
   - No layout shifts
   - Smooth 60fps animations

3. **User Experience:**
   - ไม่มี complaints เกี่ยวกับหน้าไม่แสดงผล
   - Positive feedback เกี่ยวกับ animations
   - Accessibility score ไม่ลดลง
