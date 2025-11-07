# 🚀 Setup Instructions - AbyssBuilder

## สถานะปัจจุบัน

✅ โค้ดทั้งหมดพร้อมใช้งานแล้ว!
✅ อัพเดททุกหน้าให้ใช้ Firebase Firestore แล้ว
✅ เปลี่ยนเป็น Google Authentication แล้ว

## ⚠️ สิ่งที่คุณต้องทำ (ใช้เวลาประมาณ 10-15 นาที)

### ขั้นตอนที่ 1: สร้าง Firebase Project

1. ไปที่ https://console.firebase.google.com/
2. คลิก **"Add project"** หรือ **"เพิ่มโปรเจ็กต์"**
3. ตั้งชื่อโปรเจ็กต์: **"AbyssBuilder"**
4. **ปิด** Google Analytics (ไม่จำเป็น)
5. คลิก **"Create project"**
6. รอสักครู่จนสร้างเสร็จ

### ขั้นตอนที่ 2: เปิดใช้ Google Authentication

1. ในเมนูด้านซ้าย คลิก **"Authentication"**
2. คลิก **"Get started"**
3. ในแท็บ **"Sign-in method"**
4. คลิกที่ **"Google"**
5. เปิดสวิตช์ **"Enable"**
6. เลือก **Support email** (อีเมลของคุณ)
7. คลิก **"Save"**

### ขั้นตอนที่ 3: สร้าง Firestore Database

1. ในเมนูด้านซ้าย คลิก **"Firestore Database"**
2. คลิก **"Create database"**
3. เลือก **"Start in test mode"** (สำหรับ development)
4. เลือก location: **"asia-southeast1 (Singapore)"** หรือใกล้ที่สุด
5. คลิก **"Enable"**

### ขั้นตอนที่ 4: ตั้งค่า Firestore Rules

1. ในหน้า Firestore Database ไปที่แท็บ **"Rules"**
2. **ลบ** rules เดิมทั้งหมด
3. **คัดลอก** rules นี้แทน:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Builds collection
    match /builds/{buildId} {
      // Anyone can read public builds
      allow read: if resource.data.visibility == 'public' || request.auth != null;
      // Only authenticated users can create
      allow create: if request.auth != null;
      // Only owner can update/delete
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can read user profiles
      allow read: if true;
      // Only owner can write
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. คลิก **"Publish"**

### ขั้นตอนที่ 5: รับ Firebase Config

1. คลิกไอคอน **เฟือง** (Settings) ด้านบนซ้าย
2. เลือก **"Project settings"**
3. เลื่อนลงมาที่ **"Your apps"**
4. คลิกไอคอน **Web** `</>` เพื่อเพิ่ม web app
5. ตั้งชื่อ app: **"AbyssBuilder Web"**
6. **ไม่ต้อง** เลือก Firebase Hosting
7. คลิก **"Register app"**
8. คุณจะเห็น `firebaseConfig` object แบบนี้:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "abyssbuilder-xxx.firebaseapp.com",
  projectId: "abyssbuilder-xxx",
  storageBucket: "abyssbuilder-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

9. **คัดลอก** ค่าเหล่านี้ไว้

### ขั้นตอนที่ 6: สร้างไฟล์ .env.local

1. ในโฟลเดอร์ root ของโปรเจ็กต์ สร้างไฟล์ชื่อ **`.env.local`**
2. คัดลอกและแก้ไขค่าจาก Firebase Config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=abyssbuilder-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=abyssbuilder-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=abyssbuilder-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**⚠️ สำคัญ:** แทนที่ค่าทั้งหมดด้วยค่าจริงจาก Firebase Config ของคุณ!

### ขั้นตอนที่ 7: ทดสอบ Local

1. เปิด Terminal
2. รันคำสั่ง:
```bash
npm run dev
```

3. เปิด browser ไปที่ http://localhost:3000
4. คลิก **"Login"**
5. เลือก Google Account ของคุณ
6. ถ้า login สำเร็จ แสดงว่าใช้งานได้แล้ว! 🎉

### ขั้นตอนที่ 8: ทดสอบสร้าง Build

1. หลัง login แล้ว คลิก **"Create New Build"**
2. เลือก Character หรือ Weapon
3. กรอกข้อมูล build
4. คลิก **"Save Build"**
5. ไปที่ **"My Profile"** เพื่อดู build ที่สร้าง
6. ไปที่ **"Community Builds"** เพื่อดู build ของทุกคน

### ขั้นตอนที่ 9: Deploy ไป Vercel

1. Commit และ push โค้ดขึ้น GitHub:
```bash
git add .
git commit -m "Add Firebase configuration"
git push
```

2. ไปที่ https://vercel.com/dashboard
3. เลือกโปรเจ็กต์ **abyssbuilder**
4. ไปที่ **Settings** > **Environment Variables**
5. เพิ่ม environment variables ทั้งหมดจาก `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

6. กลับไปที่ **Deployments**
7. คลิก **"Redeploy"** บน deployment ล่าสุด
8. รอจน deploy เสร็จ
9. เปิดเว็บและทดสอบ!

## 🎯 ฟีเจอร์ที่ใช้งานได้

✅ Login ด้วย Google
✅ สร้าง Build ใหม่
✅ แก้ไข Build
✅ ลบ Build
✅ โหวต Build
✅ ดู Build ของคนอื่น
✅ Profile Page
✅ Community Builds Page
✅ Build Detail Page

## 🔒 Security

- Firebase API Key สามารถเปิดเผยได้ (ปลอดภัย)
- Firestore Rules ป้องกันการเข้าถึงข้อมูลที่ไม่ได้รับอนุญาต
- เฉพาะเจ้าของ build เท่านั้นที่แก้ไข/ลบได้
- ต้อง login ก่อนสร้าง build

## ❓ Troubleshooting

### ถ้า Login ไม่ได้
- เช็คว่าเปิด Google Authentication ใน Firebase แล้วหรือยัง
- เช็คว่า environment variables ถูกต้องหรือไม่
- เปิด Browser Console (F12) ดู error

### ถ้าสร้าง Build ไม่ได้
- เช็คว่า login แล้วหรือยัง
- เช็ค Firestore Rules ว่าตั้งค่าถูกต้องหรือไม่
- เปิด Browser Console (F12) ดู error

### ถ้าไม่เห็น Build ของคนอื่น
- เช็คว่า Build นั้นเป็น **Public** หรือไม่
- เช็คใน Firestore Console ว่ามีข้อมูลหรือไม่

## 📞 ต้องการความช่วยเหลือ?

ถ้ามีปัญหาตรงไหน บอกผมได้เลย ผมจะช่วยแก้ไข! 😊

## 🎉 เสร็จแล้ว!

หลังจากทำตามขั้นตอนเหล่านี้ เว็บของคุณจะพร้อมใช้งานแล้ว!
ผู้ใช้งานทุกคนจะเห็น build เดียวกัน และสามารถโหวตกันได้!
