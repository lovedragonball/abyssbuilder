# Requirements Document

## Introduction

ผู้ใช้พบปัญหาในหน้า View Build (/view/[id]) ที่ mods ที่เพิ่มไว้ในส่วน Team Support ไม่แสดงผล และ UI ไม่ชัดเจนเพียงพอ โดยเฉพาะในส่วน Weapon Mods ที่ไม่มีรูปอาวุธเป็นหัวข้อ ทำให้ผู้ใช้สับสน

ปัญหาที่พบ:
1. Weapon Mods ของ Support Character 1 ไม่แสดงผล (มีแค่ Character Mods)
2. Weapon Mods ของ Support Weapon 1 และ 2 ไม่มีรูปอาวุธเป็นหัวข้อ ทำให้ไม่รู้ว่า mods ไหนเป็นของอาวุธไหน

## Requirements

### Requirement 1: แสดง Weapon Mods ของ Support Character 1

**User Story:** ในฐานะผู้ใช้ ฉันต้องการเห็น Weapon Mods ที่ฉันเพิ่มไว้ใน Support Character 1 เพื่อให้ build ของฉันแสดงข้อมูลครบถ้วน

#### Acceptance Criteria

1. WHEN ผู้ใช้เปิดหน้า View Build THEN ระบบ SHALL แสดง Weapon Mods section ใน Support Character 1 card
2. WHEN มี Weapon Mods ที่บันทึกไว้ใน `supportMods['support-wpn-0']` THEN ระบบ SHALL แสดง mods เหล่านั้นในรูปแบบ grid 5 คอลัมน์
3. WHEN มี adjusted slots ที่บันทึกไว้ใน `supportAdjustedSlots['support-wpn-0']` THEN ระบบ SHALL แสดง visual indicator (ring สีเขียว) บน mods ที่ถูก adjust
4. WHEN ไม่มี Weapon Mods THEN ระบบ SHALL แสดง empty slots ด้วย placeholder

### Requirement 2: เพิ่มรูปอาวุธเป็นหัวข้อใน Weapon Mods Section

**User Story:** ในฐานะผู้ใช้ ฉันต้องการเห็นรูปอาวุธเป็นหัวข้อของ Weapon Mods section เพื่อให้รู้ว่า mods ไหนเป็นของอาวุธไหน

#### Acceptance Criteria

1. WHEN แสดง Weapon Mods section THEN ระบบ SHALL แสดงรูปอาวุธขนาดเล็กพร้อมชื่ออาวุธเป็นหัวข้อ
2. WHEN มีอาวุธที่เลือกไว้ THEN ระบบ SHALL แสดงรูปและชื่ออาวุธจริง
3. WHEN ไม่มีอาวุธที่เลือกไว้ THEN ระบบ SHALL แสดง placeholder "No Weapon" พร้อม icon
4. IF อาวุธมีรูปภาพ THEN ระบบ SHALL แสดงรูปภาพในขนาด 32x32 pixels หรือใกล้เคียง
5. WHEN ผู้ใช้ดูหน้า View Build บนมือถือ THEN รูปอาวุธและชื่อ SHALL แสดงผลได้ชัดเจนและไม่บิดเบี้ยว

### Requirement 3: รักษา Consistency ของ UI

**User Story:** ในฐานะผู้ใช้ ฉันต้องการให้ทุก Support card มี layout และ style ที่สอดคล้องกัน เพื่อความเป็นระเบียบและง่ายต่อการอ่าน

#### Acceptance Criteria

1. WHEN แสดง Support Character cards THEN ระบบ SHALL ใช้ layout เดียวกันสำหรับทั้ง Support 1 และ Support 2
2. WHEN แสดง Weapon Mods section THEN ระบบ SHALL ใช้ style เดียวกันกับ Character Mods section
3. WHEN แสดงหัวข้อ Weapon Mods THEN ระบบ SHALL ใช้ typography และ spacing ที่สอดคล้องกับ Character Mods
4. IF มีการแสดงรูปอาวุธ THEN ระบบ SHALL ใช้ border radius และ shadow ที่สอดคล้องกับ design system ที่มีอยู่
