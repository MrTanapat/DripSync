# ☕ DripSync

ผมชอบดริปกาแฟและชอบลองเมล็ดใหม่ๆ แต่ไม่เคยมีที่จดว่าซื้อถุงไหนมา เหลือเท่าไหร่ ดริปแล้วเป็นยังไง
DripSync เลยเกิดขึ้นมาเพื่อตอบโจทย์ตัวเองโดยตรง — ตั้งแต่ติดตามสต็อกเมล็ด คำนวณต้นทุนต่อกรัม ไปจนถึงบันทึกทุกครั้งที่ชงเพื่อดูว่าอะไรทำให้แก้วนั้นอร่อยหรือพังไป
ทุก requirement มาจากประสบการณ์จริงของผมเอง ไม่มีทีม ไม่มีลูกค้า มีแค่คนที่อยากชงกาแฟให้ดีขึ้นและอยากเขียนโค้ดเพื่อแก้ปัญหาของตัวเอง

🔗 **Live Demo:** [dripsync-everydaydrip.vercel.app](https://dripsync-everydaydrip.vercel.app)

---

## 🚀 Upcoming Features
- 

## ✨ Features

### 🫘 Bean Inventory (คลังเมล็ดกาแฟ)

- เพิ่ม แก้ไข และลบเมล็ดกาแฟ
- บันทึกข้อมูลครบถ้วน: ชื่อ, โรงคั่ว, วันที่คั่ว, ระดับการคั่ว, โปรเซส, Taste Notes
- คำนวณ **ต้นทุนต่อกรัม** อัตโนมัติ
- ติดตามปริมาณคงเหลือพร้อม progress bar
- สถานะ: พร้อมใช้ / ใกล้หมด / หมดสต็อก
- อัปโหลดรูปภาพและครอปได้
- แสดง Stats ภาพรวม: ปริมาณรวม, ใกล้หมด, หมดสต็อก

### 🫗 Brew Log (ประวัติการดริป)

- บันทึกการชงกาแฟแต่ละครั้ง
- รองรับการกรอกข้อมูลพลัว (Pour) พร้อมกรัมและเวลา
- คำนวณ **น้ำรวม**, **เวลารวม** และ **Ratio** อัตโนมัติจากข้อมูลพลัว
- บันทึก: โดส, อุณหภูมิน้ำ, เบอร์บด, วิธีดริป, คะแนน, เทสโน้ต
- ระบบตรวจสอบว่าเมล็ดมีปริมาณเพียงพอก่อนบันทึก
- Responsive ทั้ง Desktop (Table) และ Mobile (Card)

### 🔐 Authentication

- Login ด้วย **Google** ผ่าน NextAuth.js
- ข้อมูลแยกตาม User แต่ละคน
- Guest สามารถดูข้อมูลได้ แต่ไม่สามารถแก้ไขได้

### Brew Timer

- รองรับการจับเวลาการดริปแบบ Realtime
- กดเริ่ม / หยุด Timer ได้ระหว่างการดริป
- แสดงปริมาณน้ำที่ต้องเทในแต่ละรอบ (Pour)
- บันทึกเวลาและปริมาณน้ำของแต่ละ Pour อัตโนมัติ
- เก็บข้อมูลการดริปเหมือนกับ Brew Log
- สามารถบันทึกผลการดริปหลังจบการชงได้ทันที

---

## 🛠️ Tech Stack

| Category     | Technology                                                                      |
| ------------ | ------------------------------------------------------------------------------- |
| Framework    | [Next.js 15](https://nextjs.org/) (App Router)                                  |
| API          | [tRPC](https://trpc.io/)                                                        |
| Database ORM | [Prisma](https://www.prisma.io/)                                                |
| Database     | [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) |
| Styling      | [Tailwind CSS](https://tailwindcss.com/)                                        |
| Auth         | [NextAuth.js](https://next-auth.js.org/)                                        |
| Deployment   | [Vercel](https://vercel.com/)                                                   |
| Language     | TypeScript                                                                      |

> Built with [T3 Stack](https://create.t3.gg/)

---

## 🗄️ Database Schema

```prisma
model Bean {
  id         String      @id @default(cuid())
  name       String
  roaster    String
  roastDate  DateTime
  roastLevel RoastLevel
  process    ProcessType
  tasteNotes String?
  price      Float
  weight     Float
  imageUrl   String?
  isFinished Boolean     @default(false)
  userId     String
  brewLogs   BrewLog[]
}

model BrewLog {
  id         String   @id @default(cuid())
  coffeeDose Float
  waterYield Float
  waterTemp  Float
  grindSize  String
  pours      Int[]
  pourGrams  Float[]
  brewTime   Int
  method     String
  brewDate   DateTime
  rating     Int
  notes      String?
  beanId     String
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (หรือใช้ Supabase)

### Installation

```bash
# Clone repository
git clone https://github.com/MrTanapat/DripSync.git
cd DripSync

# Install dependencies
npm install
```

### Environment Variables

สร้างไฟล์ `.env` และใส่ค่าดังนี้:

```env
# Auth
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### Run Development Server

```bash
# Push database schema
npx prisma db push

# Start dev server
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ได้เลยครับ

---

## 📁 Project Structure

```
src/
├── app/
│   ├── _components/
│   │   ├── Navbar.tsx
│   │   ├── ProfileModal.tsx
│   │   └── Section/
│   │       └── HeroSection.tsx
│   ├── beans/
│   │   ├── BeansView.tsx
│   │   ├── BeanModal.tsx
│   │   └── page.tsx
│   ├── brew/
│   │   ├── BrewView.tsx
│   │   ├── BrewModal.tsx
│   │   ├── BrewDetailModal.tsx
│   │   └── page.tsx
│   └── page.tsx
├── server/
│   └── api/
│       ├── routers/
│       │   ├── bean.ts
│       │   └── brew.ts
│       └── root.ts
└── styles/
    └── globals.css
```

---

## 👨‍💻 Developer

**0VERT-** — Software Engineering Student, RMUTL

---
