# การปรับปรุงระบบ Filter และ Search สำหรับ Mods

## สิ่งที่เปลี่ยนแปลง

### 1. Multi-Select Filters
- **เดิม**: เลือกได้เพียง 1 Type และ 1 Rarity ต่อครั้ง (dropdown แบบเดี่ยว)
- **ใหม่**: สามารถเลือกได้หลาย Type และหลาย Rarity พร้อมกัน
  - ตัวอย่าง: เลือก "Characters" + "Melee Weapon" พร้อมกัน
  - ตัวอย่าง: เลือก "5 ★" + "4 ★" พร้อมกัน
  - แสดงจำนวนตัวเลือกที่เลือกไว้ เช่น "All Types (2)"
  - มีปุ่ม "Clear all" เพื่อล้างตัวเลือกทั้งหมด

### 2. Enhanced Search
- **เดิม**: ค้นหาได้เฉพาะชื่อ mod เท่านั้น
- **ใหม่**: ค้นหาได้ครอบคลุม 3 ส่วน:
  1. **ชื่อ mod** (name)
  2. **คุณสมบัติหลัก** (mainAttribute) - เช่น "ATK +48%", "Skill DMG +30%"
  3. **เอฟเฟกต์** (effect) - เช่น "increases Weapon CRIT Chance", "Summon gains ATK speed"

### 3. ปรับปรุง UI
- เปลี่ยน placeholder ของ search box เป็น "Search by name, attribute, or effect..."
- Filter แสดงสถานะที่ชัดเจนขึ้นว่าเลือกอะไรไว้บ้าง
- Element filter จะแสดงเฉพาะเมื่อมี "Characters" ใน Type filter

## ไฟล์ที่สร้างใหม่

### `src/components/multi-select-filter.tsx`
Component สำหรับ multi-select filter ที่ใช้ซ้ำได้
- รองรับ generic type (string | number)
- มี checkbox สำหรับแต่ละตัวเลือก
- มีปุ่ม "Clear all"
- แสดงจำนวนตัวเลือกที่เลือกไว้

## ไฟล์ที่แก้ไข

### `src/app/create/[id]/page.tsx`
1. เพิ่ม import `MultiSelectFilter` component
2. เปลี่ยน state จาก single value เป็น array:
   - `modTypeFilter` → `modTypeFilters: ModType[]`
   - `rarityFilter` → `rarityFilters: ModRarity[]`
3. เพิ่มฟังก์ชัน `toggleModType()` และ `toggleRarity()`
4. ปรับปรุง `filteredMods` logic:
   - Enhanced search ที่ค้นหาทั้ง name, mainAttribute, และ effect
   - Multi-select filter logic
5. แทนที่ `<Select>` ด้วย `<MultiSelectFilter>` สำหรับ Type และ Rarity
6. อัปเดตทั้ง 2 ที่:
   - Support Mod Modal (สำหรับ support characters/weapons)
   - Main Build Page (สำหรับ main character/weapon)

## วิธีใช้งาน

### Multi-Select Filter
1. คลิกที่ปุ่ม filter (เช่น "All Types")
2. เลือก checkbox ของตัวเลือกที่ต้องการ (สามารถเลือกหลายตัวได้)
3. คลิกนอก popup เพื่อปิด
4. ผลลัพธ์จะแสดงเฉพาะ mods ที่ตรงกับตัวเลือกใดๆ ที่เลือกไว้
5. คลิก "Clear all" เพื่อล้างตัวเลือกทั้งหมด

### Enhanced Search
1. พิมพ์คำค้นหาใน search box
2. ระบบจะค้นหาใน:
   - ชื่อ mod
   - คุณสมบัติหลัก (เช่น "ATK", "CRIT", "Skill DMG")
   - เอฟเฟกต์ (เช่น "Summon", "Sanity", "ATK Speed")
3. ผลลัพธ์จะแสดงทันทีที่พิมพ์

## ตัวอย่างการใช้งาน

### ตัวอย่าง 1: หา mods ที่เพิ่ม CRIT
```
Search: "crit"
→ จะหา mods ที่มี "CRIT Chance", "CRIT Damage" ใน mainAttribute
```

### ตัวอย่าง 2: หา mods สำหรับ Summon builds
```
Search: "summon"
→ จะหา mods ที่มี effect เกี่ยวกับ Summon
```

### ตัวอย่าง 3: หา mods หลายประเภทพร้อมกัน
```
Type: เลือก "Characters" + "Melee Weapon"
Rarity: เลือก "5 ★" + "4 ★"
→ จะแสดงเฉพาะ mods ที่เป็น Characters หรือ Melee Weapon และมี rarity 4 หรือ 5
```

## ข้อดีของการปรับปรุง

1. **ความยืดหยุ่นมากขึ้น**: สามารถกรอง mods หลายประเภทพร้อมกันได้
2. **ค้นหาได้ละเอียดขึ้น**: ไม่จำเป็นต้องจำชื่อ mod แต่สามารถค้นหาจากความสามารถได้
3. **ประหยัดเวลา**: ไม่ต้องเปลี่ยน filter หลายรอบเพื่อดู mods หลายประเภท
4. **UX ที่ดีขึ้น**: แสดงสถานะที่ชัดเจนว่าเลือกอะไรไว้บ้าง

## การทดสอบ

- ✅ Build สำเร็จ
- ✅ Multi-select filter ทำงานได้
- ✅ Enhanced search ค้นหาได้ทั้ง name, mainAttribute, และ effect
- ✅ Element filter แสดงเฉพาะเมื่อจำเป็น
- ✅ ใช้งานได้ทั้งใน Support Mod Modal และ Main Build Page
