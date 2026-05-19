# AGENT.md — Panduan Codex untuk Pengembangan Aplikasi DesaFix

## 1. Identitas Proyek

Nama aplikasi: **DesaFix**  
Jenis aplikasi: **Web App + Progressive Web Apps (PWA)**  
Tujuan aplikasi: membantu masyarakat desa mencari, memilih, dan memesan jasa tukang terpercaya secara online.

DesaFix menyediakan layanan pencarian tukang lokal seperti tukang listrik, tukang bangunan, servis pompa air, servis motor, dan servis alat elektronik. Aplikasi harus mudah digunakan oleh masyarakat desa dan dapat diakses melalui browser maupun dipasang ke perangkat pengguna seperti aplikasi mobile.

## 2. Teknologi yang Digunakan

Codex harus mengembangkan aplikasi menggunakan teknologi berikut:

- Frontend: **React**
- Build Tool: **Vite**
- Routing: **React Router DOM**
- Database: **Firebase Cloud Firestore**
- Authentication: **Firebase Authentication**
- Storage: **Firebase Storage**
- Hosting: **Vercel**
- PWA: **vite-plugin-pwa**
- Styling: gunakan CSS biasa atau Tailwind CSS jika sudah tersedia di project

Jangan menggunakan Laravel, PHP, atau MySQL dalam project ini.

## 3. Prinsip Pengembangan

Codex harus menulis kode yang:

- Rapi, mudah dibaca, dan mudah dikembangkan.
- Menggunakan struktur folder yang jelas.
- Memisahkan logic Firebase ke dalam folder `services`.
- Memisahkan halaman ke dalam folder `pages`.
- Memisahkan komponen kecil yang reusable ke dalam folder `components`.
- Menggunakan nama file dan fungsi yang jelas sesuai fungsinya.
- Tidak menaruh konfigurasi rahasia Firebase secara langsung di kode.
- Menggunakan file `.env` untuk menyimpan Firebase config.
- Responsif untuk tampilan mobile dan desktop.
- Cocok untuk kebutuhan aplikasi PWA.

## 4. Struktur Folder yang Harus Digunakan

Gunakan struktur folder berikut:

```text
desafix/
├── public/
│   ├── manifest.json
│   └── icons/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ServiceCard.jsx
│   │   ├── TukangCard.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── DashboardAdmin.jsx
│   │   │   ├── ManageUsers.jsx
│   │   │   ├── ManageTukang.jsx
│   │   │   ├── ManageCategories.jsx
│   │   │   └── Reports.jsx
│   │   │
│   │   ├── customer/
│   │   │   ├── Home.jsx
│   │   │   ├── SearchTukang.jsx
│   │   │   ├── TukangDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   └── BookingHistory.jsx
│   │   │
│   │   ├── tukang/
│   │   │   ├── DashboardTukang.jsx
│   │   │   ├── ProfileTukang.jsx
│   │   │   ├── ManageServices.jsx
│   │   │   ├── Schedule.jsx
│   │   │   └── WorkOrders.jsx
│   │   │
│   │   └── Chat.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── services/
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── tukangService.js
│   │   ├── categoryService.js
│   │   ├── serviceService.js
│   │   ├── bookingService.js
│   │   ├── chatService.js
│   │   └── reviewService.js
│   │
│   ├── styles/
│   │   └── global.css
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

## 5. Role Pengguna

Aplikasi memiliki 3 role utama:

### 5.1 Admin

Admin dapat:

- Login.
- Melihat dashboard admin.
- Mengelola data pengguna.
- Mengelola data tukang.
- Memverifikasi akun tukang.
- Mengelola kategori jasa.
- Melihat semua data pemesanan.
- Melihat laporan aplikasi.

### 5.2 Pelanggan

Pelanggan dapat:

- Registrasi.
- Login.
- Mencari tukang berdasarkan kategori jasa.
- Melihat profil tukang.
- Melihat estimasi harga layanan.
- Memesan jasa tukang.
- Melihat status pesanan.
- Melakukan chat dengan tukang.
- Memberikan rating dan ulasan.
- Melihat riwayat pesanan.

### 5.3 Tukang

Tukang dapat:

- Registrasi.
- Login.
- Melengkapi profil tukang.
- Menambahkan layanan yang ditawarkan.
- Mengatur jadwal kerja.
- Menerima pesanan.
- Menolak pesanan.
- Mengubah status pekerjaan.
- Melakukan chat dengan pelanggan.
- Melihat riwayat pekerjaan.

## 6. Koleksi Firestore

Codex harus menggunakan koleksi Firestore berikut:

### 6.1 users

Menyimpan data semua pengguna.

```js
{
  uid: string,
  name: string,
  email: string,
  phone: string,
  address: string,
  role: "admin" | "customer" | "tukang",
  photoUrl: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6.2 tukangProfiles

Menyimpan detail profil tukang.

```js
{
  id: string,
  tukangUid: string,
  categoryId: string,
  skill: string,
  description: string,
  experience: string,
  location: string,
  priceEstimation: number,
  photoUrl: string,
  verificationStatus: "pending" | "verified" | "rejected",
  activeStatus: boolean,
  ratingAverage: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6.3 serviceCategories

Menyimpan kategori layanan.

```js
{
  id: string,
  name: string,
  description: string,
  iconUrl: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

Contoh kategori:

- Tukang listrik
- Tukang bangunan
- Servis pompa air
- Servis motor
- Servis elektronik

### 6.4 services

Menyimpan layanan yang ditawarkan tukang.

```js
{
  id: string,
  tukangUid: string,
  categoryId: string,
  serviceName: string,
  description: string,
  price: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6.5 bookings

Menyimpan data pemesanan jasa.

```js
{
  id: string,
  customerUid: string,
  tukangUid: string,
  serviceId: string,
  bookingDate: string,
  bookingTime: string,
  address: string,
  problemDescription: string,
  status: "pending" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled",
  totalPrice: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6.6 chats

Menyimpan pesan chat antara pelanggan dan tukang.

```js
{
  id: string,
  bookingId: string,
  senderUid: string,
  receiverUid: string,
  message: string,
  imageUrl: string,
  readStatus: boolean,
  createdAt: timestamp
}
```

### 6.7 reviews

Menyimpan rating dan ulasan pelanggan.

```js
{
  id: string,
  bookingId: string,
  customerUid: string,
  tukangUid: string,
  rating: number,
  comment: string,
  createdAt: timestamp
}
```

### 6.8 schedules

Menyimpan jadwal kerja tukang.

```js
{
  id: string,
  tukangUid: string,
  day: string,
  startTime: string,
  endTime: string,
  status: "available" | "unavailable"
}
```

### 6.9 notifications

Menyimpan notifikasi aplikasi.

```js
{
  id: string,
  receiverUid: string,
  title: string,
  message: string,
  type: string,
  readStatus: boolean,
  createdAt: timestamp
}
```

## 7. Aturan Routing

Gunakan React Router DOM.

Contoh route utama:

```text
/                       -> Home pelanggan
/login                  -> Login
/register               -> Register
/admin                  -> Dashboard admin
/admin/users            -> Kelola pengguna
/admin/tukang           -> Kelola tukang
/admin/categories       -> Kelola kategori jasa
/admin/reports          -> Laporan
/customer/search        -> Cari tukang
/customer/tukang/:id    -> Detail tukang
/customer/booking/:id   -> Form pemesanan
/customer/history       -> Riwayat pesanan
/tukang                 -> Dashboard tukang
/tukang/profile         -> Profil tukang
/tukang/services        -> Kelola layanan
/tukang/schedule        -> Jadwal kerja
/tukang/orders          -> Pesanan masuk
/chat/:bookingId        -> Chat
```

Gunakan `ProtectedRoute` untuk membatasi halaman berdasarkan role.

## 8. Aturan Firebase Authentication

Codex harus:

- Menggunakan Firebase Authentication untuk registrasi dan login.
- Setelah registrasi berhasil, simpan data tambahan pengguna ke koleksi `users`.
- Role pengguna ditentukan saat registrasi.
- Redirect pengguna berdasarkan role:
  - admin ke `/admin`
  - customer ke `/`
  - tukang ke `/tukang`
- Jangan menyimpan password di Firestore.

## 9. Aturan UI dan UX

Tampilan aplikasi harus:

- Sederhana dan mudah dipahami.
- Cocok untuk masyarakat desa.
- Menggunakan bahasa Indonesia.
- Responsif untuk layar HP.
- Memiliki tombol yang jelas.
- Tidak terlalu ramai.
- Menampilkan informasi tukang secara ringkas dan mudah dibaca.

Gunakan warna yang memberi kesan terpercaya dan lokal, misalnya hijau, biru, putih, atau warna netral.

## 10. Halaman yang Harus Dibuat

### 10.1 Halaman Login

Berisi:

- Input email.
- Input password.
- Tombol login.
- Link ke halaman register.
- Validasi sederhana.

### 10.2 Halaman Register

Berisi:

- Nama lengkap.
- Email.
- Nomor HP.
- Alamat.
- Password.
- Pilihan role: pelanggan atau tukang.
- Tombol daftar.

### 10.3 Dashboard Admin

Berisi ringkasan:

- Total pengguna.
- Total tukang.
- Total pesanan.
- Tukang menunggu verifikasi.

### 10.4 Halaman Kelola Tukang

Admin dapat:

- Melihat daftar tukang.
- Melihat status verifikasi.
- Menyetujui tukang.
- Menolak tukang.

### 10.5 Halaman Home Pelanggan

Berisi:

- Hero section DesaFix.
- Kategori jasa.
- Daftar tukang terpercaya.
- Tombol cari tukang.

### 10.6 Halaman Detail Tukang

Berisi:

- Foto tukang.
- Nama tukang.
- Keahlian.
- Lokasi.
- Estimasi harga.
- Rating.
- Ulasan pelanggan.
- Tombol pesan jasa.
- Tombol chat.

### 10.7 Halaman Booking

Berisi:

- Pilihan layanan.
- Tanggal pemesanan.
- Jam pemesanan.
- Alamat pengerjaan.
- Deskripsi masalah.
- Estimasi total harga.
- Tombol kirim pesanan.

### 10.8 Dashboard Tukang

Berisi:

- Total pesanan masuk.
- Pesanan aktif.
- Pesanan selesai.
- Rating rata-rata.

### 10.9 Halaman Pesanan Tukang

Tukang dapat:

- Melihat pesanan masuk.
- Menerima pesanan.
- Menolak pesanan.
- Mengubah status pekerjaan.

### 10.10 Halaman Chat

Berisi:

- Daftar pesan.
- Input pesan.
- Tombol kirim.
- Pesan disimpan ke Firestore.

## 11. Aturan Penulisan Kode

Codex harus mengikuti aturan berikut:

- Gunakan functional components.
- Gunakan React Hooks.
- Gunakan `async/await` untuk operasi Firebase.
- Gunakan `try/catch` pada setiap operasi Firebase.
- Tampilkan pesan error yang mudah dipahami pengguna.
- Hindari duplikasi kode.
- Buat komponen reusable jika ada tampilan yang digunakan berulang.
- Gunakan nama variabel bahasa Inggris yang jelas.
- Teks yang tampil ke pengguna menggunakan bahasa Indonesia.

Contoh penamaan fungsi:

```js
createBooking()
getTukangList()
updateBookingStatus()
verifyTukang()
sendMessage()
addReview()
```

## 12. Aturan Environment Variable

Gunakan file `.env` untuk konfigurasi Firebase.

Contoh `.env.example`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Di `firebase.js`, baca konfigurasi menggunakan `import.meta.env`.

Jangan commit file `.env` asli ke repository.

## 13. Aturan PWA

Aplikasi harus mendukung PWA.

Codex harus:

- Menggunakan `vite-plugin-pwa`.
- Menyediakan `manifest.json`.
- Menyediakan icon aplikasi.
- Mengatur nama aplikasi menjadi `DesaFix`.
- Mengatur short name menjadi `DesaFix`.
- Mengatur display menjadi `standalone`.
- Mengatur theme color dan background color.
- Memastikan aplikasi bisa di-install di browser mobile.

## 14. Aturan Deploy ke Vercel

Aplikasi harus siap di-deploy ke Vercel.

Codex harus memastikan:

- Project bisa dijalankan dengan `npm run dev`.
- Project bisa di-build dengan `npm run build`.
- Tidak ada error build.
- Environment variable Firebase bisa diatur di dashboard Vercel.
- File konfigurasi tidak bergantung pada server lokal.

## 15. Prioritas Pengerjaan

Codex harus mengerjakan aplikasi secara bertahap dengan urutan berikut:

1. Setup project React + Vite.
2. Setup struktur folder.
3. Setup Firebase config.
4. Setup routing.
5. Buat AuthContext.
6. Buat login dan register.
7. Buat role-based protected route.
8. Buat dashboard admin.
9. Buat halaman pelanggan.
10. Buat halaman tukang.
11. Buat fitur kategori jasa.
12. Buat fitur profil tukang.
13. Buat fitur pencarian tukang.
14. Buat fitur booking.
15. Buat fitur status pesanan.
16. Buat fitur chat.
17. Buat fitur review dan rating.
18. Setup PWA.
19. Test semua fitur.
20. Siapkan deploy ke Vercel.

## 16. Batasan Pengembangan Awal

Untuk versi awal atau MVP, Codex cukup fokus pada fitur berikut:

- Register dan login.
- Role admin, pelanggan, dan tukang.
- Pelanggan bisa mencari tukang.
- Pelanggan bisa melihat detail tukang.
- Pelanggan bisa memesan jasa.
- Tukang bisa menerima atau menolak pesanan.
- Pelanggan bisa memberi rating dan ulasan.
- Admin bisa memverifikasi tukang.
- Aplikasi bisa di-deploy ke Vercel.

Fitur pembayaran online belum wajib dibuat pada MVP. Jika diperlukan, cukup siapkan struktur data `paymentStatus` pada booking.

## 17. Larangan

Codex tidak boleh:

- Menggunakan Laravel.
- Menggunakan PHP.
- Menggunakan MySQL.
- Menyimpan password di Firestore.
- Menaruh Firebase secret langsung di kode.
- Membuat struktur folder yang berantakan.
- Membuat semua logic di satu file besar.
- Menghapus fitur utama tanpa alasan.
- Mengubah role pengguna di luar kebutuhan sistem.

## 18. Target Akhir

Target akhir project adalah aplikasi DesaFix berbasis React dan Firebase yang dapat:

- Digunakan oleh pelanggan untuk mencari dan memesan tukang.
- Digunakan oleh tukang untuk menerima pesanan.
- Digunakan oleh admin untuk mengelola data dan verifikasi tukang.
- Diakses secara online melalui Vercel.
- Dipasang di perangkat pengguna sebagai PWA.

