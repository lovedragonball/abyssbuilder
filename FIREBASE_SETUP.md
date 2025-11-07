# Firebase Setup Guide

## ขั้นตอนการตั้งค่า Firebase สำหรับ AbyssBuilder

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Add project" หรือ "เพิ่มโปรเจ็กต์"
3. ตั้งชื่อโปรเจ็กต์ เช่น "AbyssBuilder"
4. ปิด Google Analytics (ไม่จำเป็นสำหรับตอนนี้)
5. คลิก "Create project"

### 2. เปิดใช้งาน Authentication

1. ในเมนูด้านซ้าย คลิก "Authentication"
2. คลิก "Get started"
3. ในแท็บ "Sign-in method"
4. คลิกที่ "Google"
5. เปิดใช้งาน (Enable)
6. เลือก Support email
7. คลิก "Save"

### 3. สร้าง Firestore Database

1. ในเมนูด้านซ้าย คลิก "Firestore Database"
2. คลิก "Create database"
3. เลือก "Start in test mode" (สำหรับ development)
4. เลือก location ที่ใกล้ที่สุด (เช่น asia-southeast1)
5. คลิก "Enable"

### 4. ตั้งค่า Firestore Rules (สำคัญ!)

ไปที่แท็บ "Rules" และแทนที่ด้วย:

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

คลิก "Publish"

### 5. รับ Firebase Config

1. ไปที่ Project Settings (ไอคอนเฟืองด้านบนซ้าย)
2. เลื่อนลงมาที่ "Your apps"
3. คลิกไอคอน Web (</>) เพื่อเพิ่ม web app
4. ตั้งชื่อ app เช่น "AbyssBuilder Web"
5. คลิก "Register app"
6. คัดลอก config object

### 6. สร้างไฟล์ .env.local

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root ของโปรเจ็กต์:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

แทนที่ค่าต่างๆ ด้วยค่าจาก Firebase Config ที่คัดลอกมา

### 7. ทดสอบ

1. รัน `npm run dev`
2. เปิด http://localhost:3000
3. ลองกด Login และเข้าสู่ระบบด้วย Google
4. ลองสร้าง build ใหม่
5. เช็คใน Firestore Console ว่ามีข้อมูลเข้ามาหรือไม่

### 8. Deploy ไป Vercel

1. ไปที่ Vercel Dashboard
2. เลือกโปรเจ็กต์ของคุณ
3. ไปที่ Settings > Environment Variables
4. เพิ่ม environment variables ทั้งหมดจาก .env.local
5. Redeploy โปรเจ็กต์

## Firestore Collections Structure

### builds
```
{
  id: string (auto-generated)
  userId: string
  buildName: string
  description: string
  guide: string
  visibility: 'public' | 'private'
  itemType: 'character' | 'weapon'
  itemId: string
  itemName: string
  itemImage: string
  creator: string
  mods: string[]
  team: string[]
  supportWeapons: string[]
  supportMods: Record<string, string[]>
  voteCount: number
  votedBy: string[]
  views: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### users
```
{
  uid: string (same as auth uid)
  username: string
  displayName: string
  photoURL: string
  email: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Security Notes

- ไฟล์ `.env.local` อยู่ใน `.gitignore` แล้ว ไม่ต้องกังวลเรื่อง commit ขึ้น GitHub
- API Key ของ Firebase สามารถเปิดเผยได้ เพราะมี Firestore Rules ป้องกันอยู่
- อย่าลืมเปลี่ยน Firestore Rules จาก test mode เป็น production mode ก่อน launch จริง

## Troubleshooting

### ถ้า Login ไม่ได้
- เช็คว่าเปิด Google Authentication แล้วหรือยัง
- เช็คว่า environment variables ถูกต้องหรือไม่
- เช็ค Console ใน Browser DevTools

### ถ้าสร้าง Build ไม่ได้
- เช็ค Firestore Rules
- เช็คว่า Login แล้วหรือยัง
- เช็ค Console ใน Browser DevTools

### ถ้าไม่เห็น Build ของคนอื่น
- เช็คว่า Build นั้นเป็น Public หรือไม่
- เช็ค Firestore Console ว่ามีข้อมูลหรือไม่
