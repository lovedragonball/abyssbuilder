# 🚀 วิธี Deploy เว็บให้คนอื่นเข้าใช้งาน

## วิธีที่ 1: Deploy บน Vercel (ฟรี + แนะนำ)

### ขั้นตอนง่ายๆ:

1. **สมัคร Vercel**
   - ไปที่ [vercel.com](https://vercel.com)
   - กด "Sign Up" และเชื่อมต่อกับ GitHub

2. **Push โค้ดขึ้น GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

3. **Import Project ใน Vercel**
   - กด "Add New Project"
   - เลือก repository ของคุณ
   - Vercel จะตรวจจับ Next.js อัตโนมัติ

4. **ตั้งค่า Environment Variables** (สำคัญมาก!)
   
   ใน Vercel Dashboard → Environment Variables เพิ่มตัวแปรเหล่านี้:
   
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAKugIvZm2EdPj7GdpqZO5bdBGRgtJoo1I
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=abyssbuilder-100a2.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=abyssbuilder-100a2
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=abyssbuilder-100a2.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=928191361520
   NEXT_PUBLIC_FIREBASE_APP_ID=1:928191361520:web:5e58d9514930d98de82d35
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-PWP663TK0S
   
   FIREBASE_PROJECT_ID=abyssbuilder-100a2
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@abyssbuilder-100a2.iam.gserviceaccount.com
   ```
   
   สำหรับ `FIREBASE_PRIVATE_KEY` ให้คัดลอกจากไฟล์ `.env.local` ของคุณ (รวม BEGIN และ END)

5. **กด Deploy**
   - รอประมาณ 2-3 นาที
   - เสร็จแล้ว! 🎉

6. **รับ URL**
   - Vercel จะให้ URL แบบนี้: `https://your-project.vercel.app`
   - แชร์ URL นี้ให้เพื่อนได้เลย!

---

## วิธีที่ 2: Deploy บน Netlify (ฟรี)

1. ไปที่ [netlify.com](https://netlify.com)
2. กด "Add new site" → "Import an existing project"
3. เชื่อมต่อ GitHub และเลือก repository
4. ตั้งค่า:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. เพิ่ม Environment Variables เหมือนกับ Vercel
6. กด Deploy

---

## วิธีที่ 3: ใช้ Vercel CLI (สำหรับคนชอบใช้ Terminal)

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy แบบ Production
vercel --prod
```

---

## ตั้งค่า Firebase Authentication Domain

หลัง deploy แล้ว ต้องเพิ่ม domain ใน Firebase:

1. ไปที่ [Firebase Console](https://console.firebase.google.com)
2. เลือกโปรเจค `abyssbuilder-100a2`
3. ไปที่ Authentication → Settings → Authorized domains
4. กด "Add domain" และใส่:
   - `your-project.vercel.app` (URL ที่ได้จาก Vercel)
   - หรือ custom domain ของคุณ

---

## ตรวจสอบว่า Deploy สำเร็จ

เปิดเว็บและทดสอบ:
- [ ] หน้าแรกโหลดได้
- [ ] Login/Logout ทำงาน
- [ ] สร้าง Build ได้
- [ ] ดู Build ได้
- [ ] รูปภาพโหลดได้
- [ ] ใช้งานบนมือถือได้

---

## ปัญหาที่อาจเจอ

### 1. Firebase Authentication ไม่ทำงาน
**แก้:** เพิ่ม domain ใน Firebase Authorized domains (ดูด้านบน)

### 2. Environment Variables ไม่ทำงาน
**แก้:** 
- ตรวจสอบว่าใส่ครบทุกตัว
- Redeploy โปรเจค (Vercel → Deployments → Redeploy)

### 3. Build Error
**แก้:** ทดสอบ build ในเครื่องก่อน:
```bash
npm run build
```

---

## อัปเดตเว็บ

เมื่อแก้โค้ด เพียงแค่:
```bash
git add .
git commit -m "Update something"
git push
```

Vercel จะ deploy ใหม่อัตโนมัติ!

---

## Custom Domain (ถ้าอยากใช้ชื่อเว็บของตัวเอง)

1. ซื้อ domain จาก Namecheap, GoDaddy, หรือ Cloudflare
2. ใน Vercel → Settings → Domains
3. เพิ่ม domain ของคุณ
4. ตั้งค่า DNS ตามที่ Vercel บอก
5. รอ 24-48 ชั่วโมง

---

## ค่าใช้จ่าย

- **Vercel Free Plan:**
  - Bandwidth: 100GB/เดือน
  - Build time: 6,000 นาที/เดือน
  - เพียงพอสำหรับเว็บขนาดเล็ก-กลาง

- **Firebase Free Plan (Spark):**
  - Authentication: ไม่จำกัด
  - Firestore: 1GB storage, 50K reads/วัน
  - เพียงพอสำหรับเริ่มต้น

---

## เสร็จแล้ว! 🎉

ตอนนี้เว็บของคุณออนไลน์แล้ว คนอื่นสามารถเข้าใช้งานได้ทั่วโลก!

**URL ของคุณ:** `https://your-project.vercel.app`

แชร์ให้เพื่อนๆ ได้เลย! 🚀
