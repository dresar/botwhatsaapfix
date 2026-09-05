# WhatsApp Bot Admin Panel

Admin Panel untuk mengelola WhatsApp Bot dengan fitur-fitur berikut:

- Login dan autentikasi admin
- Dashboard dengan status bot dan sistem
- Kontrol bot (start, stop, restart)
- Manajemen fitur (aktifkan/nonaktifkan)
- Scan QR Code WhatsApp
- Melihat log bot

## Instalasi

1. Pastikan Anda sudah menginstal Node.js (versi 14 atau lebih tinggi)
2. Masuk ke direktori admin:
   ```
   cd admin
   ```
3. Instal dependensi:
   ```
   npm install
   ```
4. Konfigurasi kredensial admin di file `.env` di direktori utama:
   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=$2b$10$Xt0WT1Uu.rVN3dQZQCQW6uIXFTX9G.ztNxRZpQdgc0tGWMBDAPU3K
   ADMIN_PORT=3000
   SESSION_SECRET=whatsapp-bot-admin-secret
   ```
   Catatan: Password default adalah "admin"

## Menjalankan Admin Panel

1. Jalankan server admin:
   ```
   npm start
   ```
2. Akses admin panel di browser:
   ```
   http://localhost:3000
   ```
3. Login dengan kredensial yang telah dikonfigurasi

## Fitur

### Dashboard

Menampilkan informasi tentang:
- Status bot (aktif/tidak aktif)
- Uptime bot
- Penggunaan memori dan CPU
- Jumlah restart
- Status fitur yang diaktifkan
- Informasi sistem (platform, arsitektur, versi Node.js, dll)

### Kontrol Bot

- Mulai bot
- Hentikan bot
- Restart bot

### Manajemen Fitur

Aktifkan atau nonaktifkan fitur-fitur berikut:
- AI
- Google Drive
- Google Keep
- SQLite Logging
- Google Docs
- Google Calendar
- Google Tasks
- Wikipedia

### QR Code

Menampilkan QR Code untuk login WhatsApp. Jika QR Code tidak tersedia, Anda dapat me-restart bot untuk mendapatkan QR Code baru.

### Log

Melihat log bot (output dan error) untuk membantu troubleshooting.

## Keamanan

Admin panel dilindungi dengan autentikasi username dan password. Pastikan untuk mengubah kredensial default untuk keamanan yang lebih baik.

## Pengembangan

Untuk pengembangan, Anda dapat menjalankan server dengan mode development:

```
npm run dev
```

Ini akan memulai server dengan nodemon yang akan memuat ulang server secara otomatis saat ada perubahan kode.