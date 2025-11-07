# 🎬 Animations Implementation Guide

## สถานะปัจจุบัน

เนื่องจากการเพิ่ม animations ทั้งหมดพร้อมกันทำให้เกิด syntax errors หลายจุด ผมได้สร้างไฟล์ utility และ components พื้นฐานไว้แล้ว:

### ✅ ไฟล์ที่สร้างเสร็จแล้ว:

1. **`src/lib/animations.ts`** - Animation variants ทั้งหมด
2. **`src/components/animated-counter.tsx`** - Counter แบบ animated
3. **`src/components/skeleton-loader.tsx`** - Loading skeletons

### 🎯 วิธีใช้งาน Animations (ทีละขั้นตอน)

#### 1. Import Animations

```typescript
import { motion } from 'framer-motion';
import {
  pageVariants,
  fadeInUp,
  staggerContainer,
  staggerItem,
  hoverScale,
  tapScale,
} from '@/lib/animations';
```

#### 2. Page Fade In

```typescript
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
>
  {/* Your content */}
</motion.div>
```

#### 3. Stagger Children (Mod Cards)

```typescript
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {mods.map((mod, index) => (
    <motion.div key={index} variants={staggerItem}>
      <ModCard mod={mod} />
    </motion.div>
  ))}
</motion.div>
```

#### 4. Hover Effects

```typescript
<motion.div
  whileHover={hoverScale}
  whileTap={tapScale}
>
  <Card />
</motion.div>
```

#### 5. Animated Counter

```typescript
import { AnimatedCounter } from '@/components/animated-counter';

<AnimatedCounter value={voteCount} duration={0.5} />
```

#### 6. Skeleton Loading

```typescript
import { SkeletonBuildDetail } from '@/components/skeleton-loader';

if (loading) {
  return <SkeletonBuildDetail />;
}
```

## 📝 แนะนำการใช้งาน

### สำหรับ Build Detail Page

1. **เริ่มจากง่ายที่สุด**: เพิ่ม fade in ให้ทั้งหน้า
2. **เพิ่ม hover effects**: ให้ mod cards และ buttons
3. **เพิ่ม stagger**: ให้ mod grid
4. **เพิ่ม skeleton**: แทน loading state เดิม
5. **เพิ่ม counter**: ให้ vote count

### ตัวอย่างโค้ดที่ใช้งานได้

```typescript
// Wrap entire page
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>

// Mod card with hover
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  <ModCard />
</motion.div>

// Animated vote count
<Button>
  Vote ({<AnimatedCounter value={voteCount} />})
</Button>
```

## 🚀 การใช้งานที่แนะนำ

### ระดับ 1: พื้นฐาน (ปลอดภัย 100%)

```typescript
// เพิ่มแค่ fade in ทั้งหน้า
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Existing content - ไม่ต้องแก้ */}
</motion.div>
```

### ระดับ 2: Hover Effects (ง่าย)

```typescript
// เพิ่ม hover ให้ mod cards
<motion.div
  whileHover={{ scale: 1.05 }}
  className="mod-card"
>
  {/* Existing mod card */}
</motion.div>
```

### ระดับ 3: Stagger (ปานกลาง)

```typescript
// Grid with stagger
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {items.map((item, i) => (
    <motion.div key={i} variants={staggerItem}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

## ⚠️ ข้อควรระวัง

1. **ปิด tags ให้ครบ**: `<motion.div>` ต้องมี `</motion.div>`
2. **ใช้ AnimatePresence**: สำหรับ conditional rendering
3. **ไม่ซ้อนลึกเกินไป**: อาจทำให้ช้า
4. **Test ทีละส่วน**: เพิ่มทีละ animation

## 🎨 Animation Variants ที่มี

- `pageVariants` - Page transitions
- `fadeInUp` - Fade from bottom
- `fadeInDown` - Fade from top
- `fadeInLeft` - Fade from left
- `fadeInRight` - Fade from right
- `scaleIn` - Scale up
- `staggerContainer` - Container for stagger
- `staggerItem` - Stagger item
- `modalVariants` - Modal animations
- `hoverScale` - Hover scale effect
- `hoverLift` - Hover lift effect
- `tapScale` - Tap scale effect
- `slideInBottom` - Slide from bottom
- `bounceIn` - Bounce effect
- `rotateIn` - Rotate effect
- `pulse` - Pulse animation
- `float` - Float animation
- `scrollReveal` - Scroll reveal

## 📚 เอกสารเพิ่มเติม

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Examples](https://www.framer.com/motion/examples/)
- [Variants Guide](https://www.framer.com/motion/animation/#variants)

## 🔧 Troubleshooting

### ปัญหา: Build error
**แก้ไข**: ตรวจสอบ closing tags ทั้งหมด

### ปัญหา: Animation ไม่ทำงาน
**แก้ไข**: ตรวจสอบ initial และ animate props

### ปัญหา: Performance ช้า
**แก้ไข**: ลด animations หรือใช้ `layout` prop

## ✨ สรุป

ไฟล์ utility ทั้งหมดพร้อมใช้งานแล้ว! คุณสามารถ:
1. เพิ่ม animations ทีละส่วน
2. ใช้ components ที่สร้างไว้
3. Customize ตามต้องการ

**ไฟล์ที่พร้อมใช้:**
- ✅ `src/lib/animations.ts`
- ✅ `src/components/animated-counter.tsx`
- ✅ `src/components/skeleton-loader.tsx`

**ขั้นตอนถัดไป:**
1. เพิ่ม fade in ให้ทั้งหน้า (ง่ายที่สุด)
2. เพิ่ม hover effects (สวยทันที)
3. เพิ่ม stagger animations (impressive!)
