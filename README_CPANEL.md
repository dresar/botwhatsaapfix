# Panduan Hosting Bot WhatsApp di cPanel

Panduan ini menjelaskan langkah-langkah untuk menghosting bot WhatsApp berbasis whatsapp-web.js di cPanel, termasuk web interface untuk monitoring status bot.

## Persyaratan Sistem

- Node.js versi 18.0.0 atau lebih tinggi (direkomendasikan versi 20+)
- NPM versi 8.0.0 atau lebih tinggi
- Akses SSH ke server cPanel
- Akses ke terminal cPanel
- Paket hosting yang mendukung Node.js

## Persiapan di cPanel

1. **Aktifkan Node.js di cPanel**
   - Login ke cPanel
   - Cari dan klik "Setup Node.js App"
   - Klik "Create Application"
   - Pilih versi Node.js terbaru yang tersedia (minimal v18)
   - Tentukan direktori aplikasi (misalnya: `whatsapp-bot`)
   - Tentukan Application URL (misalnya: `https://yourdomain.com/whatsapp-bot`)
   - Pilih Application mode: Production
   - Klik "Create"

2. **Siapkan Environment Variables**
   - Di halaman aplikasi Node.js, klik tab "Environment Variables"
   - Tambahkan semua variabel lingkungan yang diperlukan dari file `.env`:
     ```
     BOT_NAME=Eka
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
     GOOGLE_REFRESH_TOKEN=your_refresh_token
     GEMINI_API_KEY=your_gemini_api_key
     ENABLE_GROUP_DATABASES=true
     ADMIN_NUMBERS=your_phone_number
     ENABLE_AI=true
     ENABLE_DRIVE=true
     ENABLE_KEEP=true
     ENABLE_SQLITE_LOGGING=true
     ENABLE_DOCS=true
     ENABLE_CALENDAR=true
     ENABLE_TASKS=true
     ENABLE_WIKIPEDIA=true
     PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
     PORT=8080
     ```
   - Klik "Save"

## Instalasi Bot WhatsApp

1. **Upload Kode Bot**
   - Gunakan File Manager cPanel atau FTP untuk mengupload semua file bot ke direktori aplikasi yang telah ditentukan
   - Pastikan struktur folder tetap sama seperti di lokal

2. **Instalasi Dependensi**
   - Akses SSH ke server cPanel Anda
   - Navigasi ke direktori aplikasi:
     ```bash
     cd /home/username/whatsapp-bot
     ```
   - Install dependensi:
     ```bash
     npm install
     ```
   - Install Express untuk web interface:
     ```bash
     npm install express --save
     ```

3. **Instalasi Chromium**
   - Bot ini membutuhkan browser Chromium untuk menjalankan WhatsApp Web
   - Install Chromium di server (jika belum tersedia):
     ```bash
     # Untuk server berbasis Debian/Ubuntu
     apt-get update
     apt-get install -y chromium-browser
     
     # Untuk server berbasis CentOS
     yum install -y chromium
     ```
   - Jika Anda tidak memiliki akses root, hubungi penyedia hosting untuk menginstal Chromium
   - Alternatif: Gunakan layanan browser headless seperti Puppeteer Cluster atau browserless.io

4. **Konfigurasi PM2**
   - Install PM2 secara global:
     ```bash
     npm install -g pm2
     ```
   - Gunakan file konfigurasi PM2 (`ecosystem.config.js`) yang sudah disediakan atau buat baru:
     ```javascript
     module.exports = {
       apps: [
         {
           name: "whatsapp-bot",
           script: "index.js",
           watch: false,
           env: {
             NODE_ENV: "production"
           },
           // Konfigurasi tambahan untuk performa dan stabilitas
           max_memory_restart: '1G',  // Restart jika penggunaan memori melebihi 1GB
           restart_delay: 3000,       // Tunggu 3 detik sebelum restart
           max_restarts: 10,          // Maksimal 10 kali restart dalam window
           exp_backoff_restart_delay: 100, // Penundaan restart eksponensial
           // Konfigurasi log
           error_file: './logs/pm2-error.log',
           out_file: './logs/pm2-out.log',
           log_date_format: 'YYYY-MM-DD HH:mm:ss',
           // Konfigurasi cluster (opsional)
           instances: 1,              // Jumlah instance yang akan dijalankan
           exec_mode: 'fork'          // Mode eksekusi (fork atau cluster)
         },
         {
           name: "status-updater",
           script: "status-updater.js",
           watch: false,
           env: {
             NODE_ENV: "production"
           },
           // Konfigurasi log
           error_file: './logs/status-updater-error.log',
           out_file: './logs/status-updater-out.log',
           log_date_format: 'YYYY-MM-DD HH:mm:ss'
         },
         {
           name: "web-interface",
           script: "app.js",
           watch: false,
           env: {
             NODE_ENV: "production",
             PORT: 8080
           },
           // Konfigurasi log
           error_file: './logs/web-interface-error.log',
           out_file: './logs/web-interface-out.log',
           log_date_format: 'YYYY-MM-DD HH:mm:ss'
         }
       ]
     };
     ```
   - Mulai aplikasi dengan PM2:
     ```bash
     pm2 start ecosystem.config.js
     ```
   - Pastikan aplikasi berjalan otomatis saat server restart:
     ```bash
     pm2 startup
     pm2 save
     ```

5. **Konfigurasi Web Interface**
   - Pastikan port yang digunakan oleh web interface (default: 8080) diizinkan oleh firewall server
   - Untuk mengakses web interface melalui domain, tambahkan proxy di cPanel:
     - Di cPanel, cari dan klik "Node.js"
     - Pilih aplikasi Anda
     - Klik tab "Proxy"
     - Tambahkan proxy dengan port yang sama dengan yang dikonfigurasi di `.env` (8080)
   - Web interface akan tersedia di:
     - Jika menggunakan domain: `https://yourdomain.com`
     - Jika menggunakan IP: `http://your-ip:8080`

## Komponen Sistem

Bot WhatsApp ini terdiri dari tiga komponen utama yang dikelola oleh PM2:

1. **whatsapp-bot (index.js)**
   - Komponen utama yang menjalankan bot WhatsApp
   - Menangani semua interaksi dengan WhatsApp
   - Memproses perintah dan mengirim respons

2. **status-updater (status-updater.js)**
   - Memantau status bot WhatsApp secara berkala
   - Menyimpan informasi status ke file JSON
   - Mengumpulkan data seperti uptime, penggunaan memori, dan CPU

3. **web-interface (app.js)**
   - Menyediakan antarmuka web untuk memantau status bot
   - Menampilkan informasi status bot secara real-time
   - Menyediakan API endpoint untuk mendapatkan status dalam format JSON

## Fitur Web Interface

Web interface menyediakan informasi status bot secara real-time:

- Status bot (aktif/tidak aktif)
- Waktu restart terakhir
- Uptime bot
- Penggunaan memori dan CPU
- Jumlah restart
- Informasi sistem server

Status diperbarui setiap menit oleh `status-updater.js` dan halaman web diperbarui otomatis setiap 30 detik.

## Mengatasi Masalah Umum

### 1. Masalah Puppeteer/Chromium

Jika Anda mengalami masalah dengan Puppeteer atau Chromium:

- Pastikan path Chromium benar di variabel lingkungan `PUPPETEER_EXECUTABLE_PATH`
- Gunakan opsi `--no-sandbox` dan `--disable-setuid-sandbox` (sudah dikonfigurasi di kode)
- Pertimbangkan untuk menggunakan layanan browser headless eksternal

### 2. Masalah Memori

Bot WhatsApp dapat menggunakan banyak memori karena menjalankan browser:

- Pastikan paket hosting Anda memiliki memori yang cukup (minimal 1GB RAM)
- Gunakan opsi Puppeteer untuk menghemat memori (sudah dikonfigurasi di kode)
- Pertimbangkan untuk meningkatkan paket hosting jika bot sering crash

### 3. Masalah Web Interface

Jika web interface tidak dapat diakses:

- Periksa apakah port 8080 (atau port yang Anda konfigurasi) terbuka di firewall server
- Periksa log web interface: `pm2 logs web-interface`
- Pastikan Express terinstal: `npm install express --save`
- Jika menggunakan domain, pastikan proxy dikonfigurasi dengan benar di cPanel

### 4. Masalah Koneksi

Jika bot sering terputus dari WhatsApp:

- Pastikan server memiliki koneksi internet yang stabil
- Gunakan PM2 untuk restart otomatis jika aplikasi crash
- Pertimbangkan untuk menggunakan layanan monitoring seperti UptimeRobot

## Perintah PM2 Berguna

- Mulai semua aplikasi: `pm2 start ecosystem.config.js`
- Mulai bot saja: `pm2 start whatsapp-bot`
- Mulai web interface: `pm2 start web-interface`
- Hentikan bot: `pm2 stop whatsapp-bot`
- Restart bot: `pm2 restart whatsapp-bot`
- Lihat log bot: `pm2 logs whatsapp-bot`
- Lihat log web interface: `pm2 logs web-interface`
- Lihat status semua aplikasi: `pm2 status`
- Monitoring real-time: `pm2 monit`
- Hapus dari PM2: `pm2 delete whatsapp-bot`
- Hentikan semua aplikasi: `pm2 stop all`

## Pemeliharaan

- **Monitoring**: Gunakan `pm2 monit` dan web interface untuk memantau penggunaan sumber daya
- **Log**: Periksa log dengan `pm2 logs whatsapp-bot`
- **Update**: Perbarui dependensi secara berkala dengan `npm update`

## Catatan Penting

- Bot WhatsApp membutuhkan scan QR code saat pertama kali dijalankan. Anda perlu mengakses log aplikasi untuk melihat QR code
- Setelah scan QR code, autentikasi akan disimpan di folder `.wwebjs_auth`
- Pastikan folder `.wwebjs_auth` tidak dihapus agar tidak perlu scan QR code lagi
- Web interface hanya untuk pemantauan status, bukan untuk mengelola bot
- Beberapa penyedia hosting mungkin memiliki kebijakan yang melarang bot atau skrip otomatis. Periksa Terms of Service penyedia hosting Anda

## Alternatif cPanel

Jika cPanel tidak mendukung semua kebutuhan bot, pertimbangkan platform hosting alternatif:

- VPS (DigitalOcean, Linode, Vultr)
- Platform khusus Node.js (Heroku, Railway, Render)
- Layanan container (AWS ECS, Google Cloud Run)

Platform-platform ini mungkin lebih cocok untuk menjalankan bot WhatsApp karena memberikan kontrol lebih besar atas lingkungan server.