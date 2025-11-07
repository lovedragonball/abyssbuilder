# 🎮 AbyssBuilder

เว็บแอปพลิเคชันสำหรับสร้างและแชร์ build ของเกม

## ✨ ฟีเจอร์

- 🎨 สร้าง Build สำหรับ Character และ Weapon
- 🔧 ปรับแต่ง Build ด้วย Mods และ Support Items
- 👥 ตั้งค่า Team พร้อม Support Characters และ Weapons
- 📝 เขียน Guide สำหรับ Build
- 💾 เก็บข้อมูลใน Browser (Local Storage)
- 🎨 UI สวยงามด้วย Radix UI + Tailwind CSS
- 📱 รองรับทั้ง Desktop และ Mobile

## 🚀 เริ่มต้นใช้งาน

### ข้อกำหนด

- Node.js 20 หรือสูงกว่า
- npm หรือ yarn

### ติดตั้ง

1. Clone repository
```bash
git clone https://github.com/yourusername/abyssbuilder.git
cd abyssbuilder
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. คัดลอกไฟล์ environment
```bash
cp .env.example .env.local
```

4. รันโปรเจ็กต์
```bash
npm run dev
```

5. เปิด browser ไปที่ http://localhost:3000

## 📖 คำสั่งที่มีให้ใช้

- `npm run dev` - รัน development server
- `npm run build` - Build สำหรับ production
- `npm start` - รัน production server
- `npm run lint` - ตรวจสอบ code style
- `npm run typecheck` - ตรวจสอบ TypeScript types

## 🛠️ เทคโนโลยีที่ใช้

- **Framework**: Next.js 15.3.3
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Storage**: Browser Local Storage

## 📁 โครงสร้างโปรเจ็กต์

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── contexts/         # React contexts
├── hooks/           # Custom React hooks
└── lib/             # Utility functions and data
```

## 💡 วิธีการทำงาน

ข้อมูลทั้งหมดเก็บใน Local Storage ของ Browser ซึ่งหมายความว่า:
- ไม่ต้องมี Backend Server
- ไม่ต้องตั้งค่า Database
- ข้อมูลอยู่ใน Browser ของคุณ
- แต่ละ Browser มีข้อมูลแยกกัน

## 📝 License

MIT
