# Implementation Plan

- [x] 1. เพิ่ม Weapon Mods section ใน Support Character 1 card







  - เพิ่มโค้ดส่วน Weapon Mods section หลังจาก Character Mods section ใน Support Character 1 card
  - ใช้ pattern เดียวกับที่มีอยู่ใน Support Character 2
  - แสดง mods จาก `supportMods['support-wpn-0']`
  - แสดง adjusted slots indicator จาก `supportAdjustedSlots['support-wpn-0']`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_


- [x] 2. เพิ่มรูปอาวุธเป็นหัวข้อใน Weapon Mods section ทั้งหมด





  - สร้าง header component ที่แสดงรูปอาวุธ (32x32px) + ชื่ออาวุธ
  - ใช้ Image component จาก Next.js สำหรับแสดงรูปอาวุธ
  - เพิ่ม fallback UI สำหรับกรณีไม่มีอาวุธ (แสดง "?" icon)
  - ใช้ styling ที่สอดคล้องกับ design system ที่มีอยู่
  - _Requirements: 2.1, 2.2, 2.3, 2.4_
-


- [x] 3. อัพเดท Support Character 1 Weapon Mods section ให้มีรูปอาวุธ




  - แทนที่ label text ธรรมดาด้วย header ที่มีรูปอาวุธ
  - ใช้ `supportWeapon1` data ที่มีอยู่แล้ว
  - ตรวจสอบ responsive behavior บนหน้าจอขนาดต่างๆ
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4_




- [x] 4. อัพเดท Support Character 2 Weapon Mods section ให้มีรูปอาวุธ




  - แทนที่ label text ธรรมดาด้วย header ที่มีรูปอาวุธ
  - ใช้ `supportWeapon2` data ที่มีอยู่แล้ว
  - ตรวจสอบ responsive behavior บนหน้าจอขนาดต่างๆ
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4_

- [x] 5. ทดสอบและตรวจสอบ UI ทั้งหมด




  - ทดสอบกับ build ที่มี mods ครบทุกช่อง
  - ทดสอบกับ build ที่มี mods บางช่อง
  - ทดสอบกับ build ที่ไม่มีอาวุธ
  - ทดสอบกับ build ที่ไม่มี mods เลย
  - ทดสอบ responsive layout บน mobile, tablet, desktop
  - ตรวจสอบว่า adjusted slots แสดง green ring ถูกต้อง
  - ตรวจสอบว่า Support Character 2 และ Consonance Weapon ยังทำงานปกติ
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_
