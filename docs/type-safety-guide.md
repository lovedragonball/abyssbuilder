# Type Safety Guide - ป้องกัน TypeScript Errors

## หลักการสำคัญ

เพื่อป้องกัน TypeScript errors ในอนาคต ให้ปฏิบัติตามแนวทางเหล่านี้:

## 1. ใช้ Type Assertions เมื่อจำเป็น

เมื่อสร้างข้อมูลจาก plain objects ที่มี string literals ให้เพิ่ม `as Type` เพื่อบอก TypeScript ว่าข้อมูลนั้นถูกต้อง

### ✅ ถูกต้อง
```typescript
export const allCharacters: Character[] = [
  { name: 'Lynn', element: 'Pyro', role: 'DPS (Weapon DMG)', ... }
].map(c => ({ ...c, id: generateId(c.name), image: getImage(...) } as Character));
```

### ❌ ผิด
```typescript
export const allCharacters: Character[] = [
  { name: 'Lynn', element: 'Pyro', role: 'DPS (Weapon DMG)', ... }
].map(c => ({ ...c, id: generateId(c.name), image: getImage(...) }));
// Error: Type 'string' is not assignable to type 'Element'
```

## 2. ตรวจสอบ Type Definition ก่อนสร้างข้อมูล

ก่อนสร้าง mock data หรือข้อมูลใหม่ ให้ตรวจสอบ type definition ใน `src/lib/types.ts` ก่อนเสมอ

### ตัวอย่าง: Build Type

```typescript
export type Build = {
    id: string;
    userId: string;
    buildName: string;        // ⚠️ ไม่ใช่ 'name'
    description: string;
    guide?: string;
    visibility: 'public' | 'private';
    itemType: 'character' | 'weapon';
    itemId: string;
    itemName: string;
    itemImage: string;
    creator: string | null;
    mods: string[];           // ⚠️ เป็น string[] ไม่ใช่ Mod[]
    team: string[];           // ⚠️ เป็น string[] (character IDs) ไม่ใช่ Character[]
    supportWeapons: string[]; // ⚠️ เป็น string[] (weapon IDs) ไม่ใช่ Weapon[]
    supportMods: Record<string, string[]>;
    voteCount: number;
    votedBy?: string[];
    views?: number;
    createdAt: any;
    updatedAt: any;
    // Legacy fields (optional)
    character?: Character;
    weapon?: Weapon;
    upvotes?: number;
    contentFocus?: Role[];
};
```

## 3. ใช้ IDs แทน Objects สำหรับ Relations

เมื่อต้องการอ้างอิงถึง Character, Weapon, หรือ Mod ใน Build ให้ใช้ ID (string) แทนการเก็บ object ทั้งหมด

### ✅ ถูกต้อง
```typescript
const build: Build = {
  // ...
  team: [
    allCharacters.find(c => c.name === 'Lynn')!,
    allCharacters.find(c => c.name === 'Rebecca')!
  ].filter(Boolean).map(c => c.id),  // แปลงเป็น string[]
  
  mods: ['Cerberus\'s Celerity', 'Arbiter\'s Illusionary Sacrifice'],  // ใช้ชื่อ mod
};
```

### ❌ ผิด
```typescript
const build: Build = {
  // ...
  team: [
    allCharacters.find(c => c.name === 'Lynn')!,
    allCharacters.find(c => c.name === 'Rebecca')!
  ],  // Error: Type 'Character[]' is not assignable to type 'string[]'
};
```

## 4. ใช้ Required Properties ครบถ้วน

ตรวจสอบว่า properties ที่ไม่มี `?` (optional) ต้องมีครบทุกตัว

### ✅ ถูกต้อง
```typescript
const build: Build = {
  id: '1',
  userId: 'user-123',
  buildName: 'My Build',      // ✓ Required
  description: 'Description',  // ✓ Required
  visibility: 'public',        // ✓ Required
  itemType: 'character',       // ✓ Required
  itemId: 'lynn',              // ✓ Required
  itemName: 'Lynn',            // ✓ Required
  itemImage: '/lynn.jpg',      // ✓ Required
  creator: 'Username',         // ✓ Required
  mods: [],                    // ✓ Required
  team: [],                    // ✓ Required
  supportWeapons: [],          // ✓ Required
  supportMods: {},             // ✓ Required
  voteCount: 0,                // ✓ Required
  createdAt: new Date().toISOString(),  // ✓ Required
  updatedAt: new Date().toISOString(),  // ✓ Required
  // Optional fields
  guide: 'Guide text',
  views: 100,
  votedBy: [],
};
```

## 5. ใช้ Literal Types อย่างถูกต้อง

สำหรับ properties ที่มี union types (เช่น `'public' | 'private'`) ต้องใช้ค่าที่ตรงกับ type definition

### ✅ ถูกต้อง
```typescript
const build: Build = {
  // ...
  visibility: 'public',     // ✓ ตรงกับ 'public' | 'private'
  itemType: 'character',    // ✓ ตรงกับ 'character' | 'weapon'
};
```

### ❌ ผิด
```typescript
const build: Build = {
  // ...
  visibility: 'shared',     // ✗ Error: Type '"shared"' is not assignable
  itemType: 'item',         // ✗ Error: Type '"item"' is not assignable
};
```

## 6. ใช้ ModRarity ที่ถูกต้อง

Mod rarity ต้องเป็น `2 | 3 | 4 | 5` เท่านั้น

### ✅ ถูกต้อง
```typescript
const mod: Mod = {
  name: 'Test Mod',
  rarity: 5,  // ✓ ตรงกับ ModRarity (2 | 3 | 4 | 5)
  // ...
};
```

### ❌ ผิด
```typescript
const mod: Mod = {
  name: 'Test Mod',
  rarity: 1,  // ✗ Error: Type '1' is not assignable to type 'ModRarity'
  // ...
};
```

## 7. Checklist สำหรับเพิ่มข้อมูลใหม่

เมื่อต้องการเพิ่มข้อมูลใหม่ ให้ทำตาม checklist นี้:

### เพิ่ม Character ใหม่
- [ ] ตรวจสอบว่า `element` เป็น `Element` type ที่ถูกต้อง
- [ ] ตรวจสอบว่า `role` เป็น `Role` type ที่ถูกต้อง
- [ ] ตรวจสอบว่า `melee` เป็น `MeleeWeaponType` ที่ถูกต้อง
- [ ] ตรวจสอบว่า `ranged` เป็น `RangedWeaponType` ที่ถูกต้อง
- [ ] เพิ่ม `as Character` ใน `.map()`

### เพิ่ม Weapon ใหม่
- [ ] ตรวจสอบว่า `type` เป็น `MeleeWeaponType | RangedWeaponType` ที่ถูกต้อง
- [ ] ตรวจสอบว่า `attackType` เป็น `AttackType` ที่ถูกต้อง
- [ ] เพิ่ม `as Weapon` ใน `.map()`

### เพิ่ม Mod ใหม่
- [ ] ตรวจสอบว่า `rarity` เป็น `2 | 3 | 4 | 5`
- [ ] ตรวจสอบว่า `modType` เป็น `ModType` ที่ถูกต้อง
- [ ] ถ้ามี `element` ต้องเป็น `ModElement` ที่ถูกต้อง
- [ ] เพิ่ม `as Mod` ใน `.map()`

### เพิ่ม Build ใหม่
- [ ] ใช้ `buildName` ไม่ใช่ `name`
- [ ] ใช้ `team: string[]` (character IDs) ไม่ใช่ `Character[]`
- [ ] ใช้ `mods: string[]` (mod names) ไม่ใช่ `Mod[]`
- [ ] ใช้ `supportWeapons: string[]` (weapon IDs) ไม่ใช่ `Weapon[]`
- [ ] ระบุ required fields ครบทุกตัว
- [ ] ใช้ `visibility: 'public' | 'private'`
- [ ] ใช้ `itemType: 'character' | 'weapon'`

## 8. เครื่องมือช่วยตรวจสอบ

### ใช้ TypeScript Compiler
```bash
# ตรวจสอบ type errors
npx tsc --noEmit

# หรือ
npm run build
```

### ใช้ IDE IntelliSense
- Visual Studio Code จะแสดง type errors แบบ real-time
- Hover เหนือตัวแปรเพื่อดู type
- ใช้ Ctrl+Space เพื่อดู autocomplete

## 9. แก้ไข Type Errors อย่างถูกวิธี

### ❌ อย่าใช้ `any` หรือ `@ts-ignore`
```typescript
// ❌ ไม่ดี - ซ่อนปัญหา
const build: any = { ... };

// ❌ ไม่ดี - ข้าม type checking
// @ts-ignore
const build: Build = { name: 'Test' };
```

### ✅ แก้ไขที่ต้นตอ
```typescript
// ✅ ดี - แก้ไขให้ตรงกับ type
const build: Build = { 
  buildName: 'Test',  // แก้จาก 'name' เป็น 'buildName'
  // ... required fields
};
```

## 10. เมื่อต้องการเปลี่ยน Type Definition

ถ้าต้องการเพิ่ม property ใหม่หรือเปลี่ยน type:

1. แก้ไขใน `src/lib/types.ts` ก่อน
2. ตรวจสอบว่าไม่กระทบกับโค้ดเดิม
3. อัปเดตข้อมูลทั้งหมดให้ตรงกับ type ใหม่
4. Run `npm run build` เพื่อตรวจสอบ

### ตัวอย่าง: เพิ่ม optional field
```typescript
// src/lib/types.ts
export type Build = {
  // ... existing fields
  tags?: string[];  // เพิ่ม optional field ใหม่
};

// ไม่จำเป็นต้องอัปเดตข้อมูลเดิม เพราะเป็น optional
```

## สรุป

การป้องกัน TypeScript errors:
1. ✅ ใช้ type assertions (`as Type`)
2. ✅ ตรวจสอบ type definition ก่อนสร้างข้อมูล
3. ✅ ใช้ IDs แทน objects สำหรับ relations
4. ✅ ระบุ required properties ครบถ้วน
5. ✅ ใช้ literal types ที่ถูกต้อง
6. ✅ ทำตาม checklist เมื่อเพิ่มข้อมูลใหม่
7. ✅ ใช้เครื่องมือตรวจสอบ (tsc, IDE)
8. ✅ แก้ไขที่ต้นตอ ไม่ใช้ `any` หรือ `@ts-ignore`

ปฏิบัติตามแนวทางเหล่านี้จะช่วยให้โค้ดมี type safety ที่ดี และป้องกัน runtime errors ได้อย่างมีประสิทธิภาพ! 🎯
