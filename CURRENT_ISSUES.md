# ปัญหาปัจจุบันและวิธีแก้ไข

## ปัญหาที่พบ:

### 1. ✅ ระบบ Login ใช้ Google แล้ว
- auth-button.tsx ใช้ Google Sign-in อยู่แล้ว
- แต่อาจจะมีปัญหาที่ Firebase config ไม่ถูกต้อง

### 2. ❌ ไม่สามารถสร้าง Build ได้
- หน้า create/[id]/page.tsx ยังไม่มีฟังก์ชันบันทึก build
- ต้องเพิ่มฟังก์ชัน save build ที่ใช้ Firestore

### 3. ❌ ไม่เห็น Build ของคนอื่น
- เพราะยังไม่มีใครสร้าง build ได้ (ปัญหา #2)

## วิธีแก้ไข:

### ขั้นตอนที่ 1: ทดสอบ Login
1. เปิด https://abyssbuilder.vercel.app/
2. เปิด Browser Console (F12)
3. คลิก "Login"
4. ดู error ใน Console

### ขั้นตอนที่ 2: แก้ไขหน้า Create Build
ต้องเพิ่มฟังก์ชันบันทึก build ที่ใช้ Firestore

## สถานะ:
- ⏳ รอตรวจสอบ error จาก Console
- ⏳ ต้องแก้ไขหน้า Create Build
