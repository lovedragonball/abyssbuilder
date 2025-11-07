# 🎮 AbyssBuilder - Build Sharing Platform

เว็บแอปพลิเคชันสำหรับสร้างและแชร์ build ของเกม พร้อมระบบโหวตและคอมมิวนิตี้

## ✨ ฟีเจอร์หลัก

- 🔐 **Login ด้วย Google** - ง่ายและปลอดภัย
- 🎨 **สร้าง Build** - เลือก Character, Weapon, Mods, และ Team
- 👥 **Community Builds** - ดู build ของผู้เล่นคนอื่นๆ
- 👍 **ระบบโหวต** - โหวต build ที่ชอบ
- 📊 **Profile Page** - จัดการ build ของคุณเอง
- 🔍 **ค้นหาและกรอง** - หา build ที่ต้องการได้ง่าย
- 📱 **Responsive Design** - ใช้งานได้ทั้ง Desktop และ Mobile

## 🚀 เริ่มต้นใช้งาน

### ข้อกำหนด

- Node.js 18+ 
- npm หรือ yarn
- Firebase Account (ฟรี)

### ติดตั้ง

1. Clone repository:
```bash
git clone https://github.com/lovedragonball/abyssbuilder.git
cd abyssbuilder
```

2. ติดตั้ง dependencies:
```bash
npm install
```

3. ตั้งค่า Firebase (อ่านรายละเอียดใน `SETUP_INSTRUCTIONS.md`):
   - สร้าง Firebase project
   - เปิดใช้ Google Authentication
   - สร้าง Firestore Database
   - คัดลอก Firebase config

4. สร้างไฟล์ `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. รันโปรเจ็กต์:
```bash
npm run dev
```

6. เปิด browser ไปที่ http://localhost:3000

## 📖 คู่มือการใช้งาน

### สำหรับผู้ใช้งาน

1. **Login** - คลิกปุ่ม Login และเลือก Google Account
2. **สร้าง Build** - คลิก "Create New Build" และเลือก Character/Weapon
3. **เพิ่ม Mods** - ลากหรือคลิก Mods ที่ต้องการ
4. **เพิ่ม Team** - เลือก Support Characters และ Weapons
5. **บันทึก** - ตั้งชื่อ build และเลือก Public/Private
6. **แชร์** - Build ที่เป็น Public จะแสดงใน Community Builds

### สำหรับ Developer

อ่านเพิ่มเติมใน:
- `FIREBASE_SETUP.md` - คู่มือตั้งค่า Firebase
- `SETUP_INSTRUCTIONS.md` - คู่มือติดตั้งแบบละเอียด
- `FIREBASE_MIGRATION_STATUS.md` - สถานะการ migrate

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Animation:** Framer Motion
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Google)
- **Hosting:** Vercel

## 📁 โครงสร้างโปรเจ็กต์

```
abyssbuilder/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── builds/            # Community builds page
│   │   ├── create/            # Create build pages
│   │   ├── profile/           # User profile page
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...
│   ├── contexts/             # React contexts (Auth)
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utilities and helpers
│       ├── firebase.ts       # Firebase config
│       ├── firestore.ts      # Firestore operations
│       ├── data.ts           # Game data
│       └── ...
├── public/                   # Static files
├── docs/                     # Documentation
└── ...
```

## 🔒 Security

- Firebase API Key สามารถเปิดเผยได้ (ปลอดภัย)
- Firestore Rules ป้องกันการเข้าถึงข้อมูลที่ไม่ได้รับอนุญาต
- เฉพาะเจ้าของ build เท่านั้นที่แก้ไข/ลบได้
- ต้อง login ก่อนสร้าง build

## 🤝 Contributing

ยินดีรับ Pull Requests! สำหรับการเปลี่ยนแปลงใหญ่ กรุณาเปิด Issue ก่อน

## 📝 License

MIT License - ดูรายละเอียดใน LICENSE file

## 👨‍💻 Author

Created by lovedragonball

## 🙏 Acknowledgments

- shadcn/ui สำหรับ UI components
- Vercel สำหรับ hosting
- Firebase สำหรับ backend services

---

Made with ❤️ for the gaming community
