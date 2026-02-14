# 🛒 Kenkinian Mart

Kenkinian Mart adalah aplikasi e-commerce peralatan kandang yang dibangun menggunakan arsitektur modern:

- 🔥 Laravel (Backend API)
- ⚡ Next.js (Frontend)
- 🎨 Tailwind CSS
- 🗄 MySQL
- 🔐 JWT Authentication (Role-based)

Project ini dibuat untuk tujuan:
- 📚 Pembelajaran Fullstack Modern
- 🚀 Pengembangan Bisnis E-Commerce
- 🧠 Eksperimen Arsitektur Monorepo

---

## 🏗 Arsitektur Project

Repository ini menggunakan pendekatan **Monorepo**:


### 🔹 Backend
- Laravel API-only
- JWT Authentication
- Role-based access (Owner, Admin, Customer)
- RESTful API structure

### 🔹 Frontend
- Next.js (App Router)
- Tailwind CSS
- Fetch API ke Laravel backend
- Role-based UI rendering

---

## 🚀 Cara Menjalankan Project (Development)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/username/kenkinian-mart.git
cd kenkinian-mart
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
http://127.0.0.1:8000
🌐 Frontend Setup (Next.js)
cd frontend
npm install
npm run dev


Frontend berjalan di:

http://localhost:3000


Pastikan file .env.local berisi:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

👥 Role System

Sistem memiliki 3 level user:

👑 Owner

🛠 Admin

👤 Customer

Endpoint API dipisahkan berdasarkan role:

/api/public/...
/api/admin/...
/api/owner/...
/api/customer/...

🔐 Authentication

Menggunakan JWT

Token dikirim melalui:

Authorization: Bearer {token}


401 → Unauthorized (belum login / token invalid)
403 → Forbidden (role tidak sesuai)

📦 Tech Stack
Layer	Tech
Backend	Laravel
Frontend	Next.js
Styling	Tailwind CSS
Database	MySQL
Auth	JWT
🧠 Tujuan Pengembangan

Membuat e-commerce scalable

Clean architecture

Maintainable structure

Siap dikembangkan ke production

⚠️ Catatan

Folder node_modules, vendor, dan .env tidak disertakan di repo.

Gunakan Node.js LTS (disarankan v20+).

Jangan gunakan Turbopack jika terjadi error dev mode.

📌 Status Project

🚧 In Development
🛠 Active Learning & Improvement

👨‍💻 Author

Developed by: Nubimahendra
