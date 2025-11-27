# Design Document

## Overview

ฟีเจอร์นี้จะปรับปรุงการแสดงผลพื้นหลังของ mod ให้มี gradient ที่สวยงามและสอดคล้องกับระดับความหายาก (rarity) ของ mod โดยเฉพาะ mod 4 ดาวจะมีพื้นหลังไล่สีจากมืด (ด้านบน) ไปสว่าง (ด้านล่าง) ในโทนสีม่วง-ชมพู ตามที่ผู้ใช้ต้องการ

ปัจจุบันระบบมี gradient อยู่แล้วใน `src/lib/mod-styles.ts` แต่ยังไม่ได้ปรับแต่งให้สวยงามและตรงตามความต้องการของผู้ใช้ เราจะปรับปรุง gradient ทั้ง 4 ระดับ (2-5 ดาว) ให้มีความสวยงามและสอดคล้องกับธีมของเกม

## Architecture

### Current Implementation

ระบบปัจจุบันมีโครงสร้างดังนี้:

1. **`src/lib/mod-styles.ts`** - จัดการ gradient styles สำหรับ mod แต่ละ rarity
   - `rarityGradientStyles`: inline CSS gradient strings
   - `rarityGradients`: Tailwind CSS gradient classes
   - `getRarityGradient()`: ฟังก์ชันสำหรับดึง Tailwind classes
   - `getRarityGradientStyle()`: ฟังก์ชันสำหรับดึง inline styles
   - `getRarityBorderColor()`: ฟังก์ชันสำหรับดึงสี border
   - `getRarityBoxShadow()`: ฟังก์ชันสำหรับดึง box shadow

2. **`src/components/ModSlot.tsx`** - แสดง mod card พร้อม gradient background
   - ใช้ `getRarityGradient()` เพื่อดึง gradient classes
   - แสดง gradient overlay บน mod image

3. **`src/components/ModSelectorDialog.tsx`** - แสดงรายการ mod ที่เลือกได้
   - ใช้ `getRarityGradient()` เพื่อแสดง gradient บน mod cards

### Design Changes

เราจะปรับปรุง gradient ใน `src/lib/mod-styles.ts` ให้สวยงามขึ้นโดย:

1. **4-Star Gradient (Priority)**: ปรับให้มีโทนสีม่วง-ชมพูที่สวยงาม ไล่สีจากมืดด้านบนไปสว่างด้านล่าง
2. **5-Star Gradient**: ปรับให้มีโทนสีทองที่หรูหรา
3. **3-Star Gradient**: ปรับให้มีโทนสีน้ำเงินที่สดใส
4. **2-Star Gradient**: ปรับให้มีโทนสีเขียวที่เรียบง่าย

## Components and Interfaces

### Modified Files

#### 1. `src/lib/mod-styles.ts`

ปรับปรุง gradient definitions:

```typescript
// CSS gradient strings for inline styles
const rarityGradientStyles: Record<ModRarity, string> = {
  2: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(34, 197, 94) 50%, rgb(74, 222, 128) 100%)',
  3: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(59, 130, 246) 50%, rgb(96, 165, 250) 100%)',
  4: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(139, 92, 246) 45%, rgb(217, 70, 239) 75%, rgb(236, 72, 153) 100%)',
  5: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(245, 158, 11) 50%, rgb(251, 191, 36) 100%)',
};

// Tailwind gradient classes (fallback for components that use classes)
const rarityGradients: Record<ModRarity, string> = {
  2: 'from-slate-900 via-green-500 to-green-400',
  3: 'from-slate-900 via-blue-500 to-blue-400',
  4: 'from-slate-900 via-purple-500 via-fuchsia-500 to-pink-500',
  5: 'from-slate-900 via-amber-600 to-amber-400',
};
```

ปรับปรุง border colors และ box shadows:

```typescript
export function getRarityBorderColor(rarity: ModRarity | number): string {
  const borderColors: Record<ModRarity, string> = {
    2: 'border-green-400/60',
    3: 'border-blue-400/60',
    4: 'border-purple-400/70',
    5: 'border-amber-400/70',
  };
  return borderColors[rarity as ModRarity] ?? 'border-slate-400/50';
}

export function getRarityBoxShadow(rarity: ModRarity | number): string {
  const shadows: Record<ModRarity, string> = {
    2: '0 0 16px rgba(74, 222, 128, 0.3)',
    3: '0 0 16px rgba(96, 165, 250, 0.3)',
    4: '0 0 20px rgba(217, 70, 239, 0.4)',
    5: '0 0 20px rgba(251, 191, 36, 0.4)',
  };
  return shadows[rarity as ModRarity] ?? '0 0 12px rgba(0, 0, 0, 0.35)';
}
```

#### 2. `src/components/ModSlot.tsx`

ไม่ต้องแก้ไขโค้ด เพราะ component นี้ใช้ `getRarityGradient()` อยู่แล้ว การเปลี่ยนแปลงใน `mod-styles.ts` จะมีผลทันที

#### 3. `src/components/ModSelectorDialog.tsx`

ไม่ต้องแก้ไขโค้ด เพราะ component นี้ใช้ `getRarityGradient()` อยู่แล้ว

## Data Models

ไม่มีการเปลี่ยนแปลง data models เพราะ:
- `ModRarity` type มีอยู่แล้วใน `src/lib/types.ts` (2 | 3 | 4 | 5)
- `Mod` interface มี `rarity` field อยู่แล้ว
- ไม่ต้องเพิ่ม fields ใหม่

## Error Handling

### Gradient Fallback

ถ้า rarity ไม่ตรงกับที่กำหนด (2, 3, 4, 5):
- `getRarityGradient()` จะ return `defaultGradient`
- `getRarityGradientStyle()` จะ return `defaultGradientStyle`
- `getRarityBorderColor()` จะ return `'border-slate-400/50'`
- `getRarityBoxShadow()` จะ return `'0 0 12px rgba(0, 0, 0, 0.35)'`

### Type Safety

TypeScript จะตรวจสอบ type ของ `ModRarity` ให้อัตโนมัติ:
```typescript
export type ModRarity = 2 | 3 | 4 | 5;
```

## Testing Strategy

### Visual Testing

1. **Manual Testing**: ตรวจสอบ gradient บนหน้าต่างๆ
   - `/create` - Build creator page
   - `/my-builds` - My builds page
   - `/tier-list` - Tier list page
   - Mod selector dialog

2. **Rarity Testing**: ทดสอบ mod แต่ละ rarity
   - 2-star mods: ต้องมีโทนสีเขียว
   - 3-star mods: ต้องมีโทนสีน้ำเงิน
   - 4-star mods: ต้องมีโทนสีม่วง-ชมพู (ไล่สีจากมืดไปสว่าง)
   - 5-star mods: ต้องมีโทนสีทอง

3. **Contrast Testing**: ตรวจสอบความชัดเจนของข้อความ
   - Mod name ต้องอ่านได้ชัดเจน
   - Rarity stars ต้องเห็นชัดเจน
   - Symbol และ tolerance cost ต้องอ่านได้

### Unit Testing (Optional)

สามารถเพิ่ม unit tests สำหรับ utility functions:

```typescript
describe('mod-styles', () => {
  it('should return correct gradient for 4-star mod', () => {
    expect(getRarityGradient(4)).toContain('purple');
  });

  it('should return default gradient for invalid rarity', () => {
    expect(getRarityGradient(99 as ModRarity)).toBe(defaultGradient);
  });
});
```

## Design Decisions and Rationales

### 1. Gradient Direction (180deg)

**Decision**: ใช้ `linear-gradient(180deg, ...)` เพื่อให้ไล่สีจากบนลงล่าง

**Rationale**: 
- ตรงตามความต้องการของผู้ใช้ (มืดด้านบน สว่างด้านล่าง)
- สอดคล้องกับธีมของเกมที่มักใช้ gradient แนวตั้ง
- ทำให้ mod icon ด้านบนมีพื้นหลังมืด ไม่บดบังรายละเอียด

### 2. Color Palette

**Decision**: ใช้สีที่สอดคล้องกับ rarity:
- 2-star: เขียว (common)
- 3-star: น้ำเงิน (rare)
- 4-star: ม่วง-ชมพู (epic)
- 5-star: ทอง (legendary)

**Rationale**:
- เป็นมาตรฐานของเกมส่วนใหญ่
- ผู้เล่นคุ้นเคยกับ color coding นี้
- แยกแยะความหายากได้ง่าย

### 3. Multiple Color Stops for 4-Star

**Decision**: ใช้ 4 color stops สำหรับ 4-star gradient:
```
rgb(15, 23, 42) 0% → rgb(139, 92, 246) 45% → rgb(217, 70, 239) 75% → rgb(236, 72, 153) 100%
```

**Rationale**:
- สร้างการไล่สีที่ซับซ้อนและสวยงาม
- ผสมผสานระหว่างสีม่วง (purple) และสีชมพู (pink)
- ให้ความรู้สึกหรูหราและพิเศษ เหมาะกับ epic rarity

### 4. Opacity and Overlay

**Decision**: ใช้ opacity 80% สำหรับ gradient overlay ใน ModSlot:
```tsx
<div className="absolute inset-0 bg-gradient-to-b opacity-80 transition-colors" />
```

**Rationale**:
- ไม่บดบัง mod image ทั้งหมด
- ยังคงเห็นรายละเอียดของ mod icon
- สร้าง depth และ visual hierarchy

### 5. Consistent API

**Decision**: ไม่เปลี่ยน function signatures ของ `getRarityGradient()` และ `getRarityGradientStyle()`

**Rationale**:
- ไม่ต้องแก้ไข components ที่ใช้ functions เหล่านี้
- Backward compatible กับโค้ดเดิม
- ลด breaking changes

### 6. Tailwind + Inline Styles

**Decision**: รองรับทั้ง Tailwind classes และ inline styles

**Rationale**:
- Flexibility: บาง components ใช้ Tailwind, บางตัวใช้ inline styles
- Performance: Tailwind classes ถูก purge และ optimize ได้
- Compatibility: รองรับทั้งสองวิธีการใช้งาน

## Visual Examples

### 4-Star Gradient (Priority)

```
┌─────────────────┐
│  ███████████    │ ← Dark slate (rgb(15, 23, 42))
│  ███████████    │
│  ▓▓▓▓▓▓▓▓▓▓▓    │ ← Purple (rgb(139, 92, 246))
│  ▓▓▓▓▓▓▓▓▓▓▓    │
│  ▒▒▒▒▒▒▒▒▒▒▒    │ ← Fuchsia (rgb(217, 70, 239))
│  ░░░░░░░░░░░    │ ← Pink (rgb(236, 72, 153))
│  ░░░░░░░░░░░    │
└─────────────────┘
```

### Other Rarities

**5-Star**: Dark slate → Amber → Light amber (ทอง)
**3-Star**: Dark slate → Blue → Light blue (น้ำเงิน)
**2-Star**: Dark slate → Green → Light green (เขียว)

## Implementation Notes

1. **Single File Change**: เปลี่ยนแปลงเฉพาะ `src/lib/mod-styles.ts`
2. **No Breaking Changes**: ไม่กระทบ components อื่นๆ
3. **Immediate Effect**: การเปลี่ยนแปลงจะมีผลทันทีในทุกหน้าที่แสดง mods
4. **Easy to Adjust**: สามารถปรับแต่งสีได้ง่ายโดยแก้ไขที่เดียว
