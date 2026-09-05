
# Bot WhatsApp

Bot WhatsApp dengan berbagai fitur seperti pengingat tugas, pengolahan file, kecerdasan buatan (AI), integrasi Google Drive dan Google Keep, serta perintah admin. Bot ini dibuat menggunakan Node.js dan library whatsapp-web.js. Dilengkapi dengan web interface untuk monitoring status bot.

## Fitur

### Login WhatsApp dengan QR Code
- Menggunakan whatsapp-web.js untuk memunculkan QR Code yang bisa dipindai melalui WhatsApp di ponsel untuk login.

### Perintah Pengingat Tugas
- `!tambah_tugas [nama_tugas]`: Menambahkan tugas baru.
- `!list_tugas`: Menampilkan semua tugas yang telah dicatat.
- `!ingatkan_tugas [tugas] [waktu]`: Menambahkan pengingat untuk tugas pada waktu tertentu.

### Perintah Pengolahan File
- `!pdf_to_word [file]`: Mengonversi file PDF menjadi Word.
- `!word_to_pdf [file]`: Mengonversi file Word menjadi PDF.
- `!image_to_text [file]`: Menggunakan OCR untuk mengonversi gambar menjadi teks.
- `!compress_file [file]`: Mengompres file PDF atau gambar untuk mengurangi ukuran.

### Perintah Kecerdasan Buatan (AI)
- `!gemini [pertanyaan]` atau `!ai [pertanyaan]`: Mengajukan pertanyaan ke Google Gemini AI.
- `!gartisan [pertanyaan]`: Mengajukan pertanyaan ke AI Gartisan.
- `!analisis_gambar` atau `!analyze_image`: Menganalisis gambar menggunakan AI.

### Perintah Google Drive
- `!simpan_gambar` atau `!save_image`: Menyimpan gambar ke Google Drive.
- `!list_gambar [jumlah]`: Menampilkan daftar gambar yang tersimpan di Google Drive.
- `!hapus_gambar [id_file]`: Menghapus gambar dari Google Drive.

### Perintah Google Keep
- `!buat_catatan [judul] [isi]` atau `!create_note [judul] [isi]`: Membuat catatan baru di Google Keep.
- `!list_catatan [jumlah]`: Menampilkan daftar catatan yang tersimpan di Google Keep.

### Perintah Admin
- `!kick [nomor_anggota]`: Mengeluarkan anggota dari grup.
- `!broadcast [pesan]`: Mengirimkan pengumuman atau pesan kepada seluruh anggota grup.
- `!stats`: Menampilkan statistik bot, seperti jumlah anggota grup, tugas yang masih aktif, atau status server bot.
- `!mute [durasi]`: Menonaktifkan bot sementara untuk durasi tertentu.
- `!unmute`: Mengaktifkan kembali bot setelah dimute.
- `!ban [nomor_anggota]`: Membanned anggota dari grup (admin hanya).
- `!unban [nomor_anggota]`: Membuka banned anggota dari grup.

### Perintah Pengolahan Media
- `!sticker [file]`: Mengubah gambar menjadi stiker WhatsApp.

### Perintah Tambahan
- `!translate [bahasa_asal] [bahasa_tujuan] [teks]`: Menerjemahkan teks antara bahasa tertentu.
- `!weather [lokasi]`: Menampilkan informasi cuaca untuk lokasi tertentu.

### Perintah Umum
- `!menu`: Menampilkan menu perintah yang tersedia.
- `!help [perintah]`: Menampilkan bantuan tentang penggunaan perintah tertentu.

## Persyaratan

- Node.js (versi 14 atau lebih tinggi)
- NPM (Node Package Manager)
- SQLite3 (untuk database)

## Instalasi

1. Clone repositori ini atau download sebagai ZIP.
2. Buka terminal dan navigasi ke direktori proyek.
3. Jalankan perintah berikut untuk menginstal dependensi:

```bash
npm install
```

4. Instal SQLite3 jika belum terinstal:

```bash
# Untuk Windows
npm install sqlite3 better-sqlite3

# Untuk Linux/macOS
sudo apt-get install sqlite3 # Untuk Debian/Ubuntu
brew install sqlite3 # Untuk macOS dengan Homebrew
```

5. Buat file `.env` berdasarkan `.env.example` dan isi dengan konfigurasi yang sesuai:

```bash
cp .env.example .env
```

6. Edit file `.env` dan sesuaikan konfigurasi berikut:
   - `BOT_NAME`: Nama bot WhatsApp
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`: Kredensial Google API untuk fitur Drive dan Keep
   - `GEMINI_API_KEY`, `AI_GARTISAN_API_KEY`: API key untuk fitur AI
   - `DB_PATH`: Path database SQLite (default: ./data/whatsapp_bot.db)
   - `ENABLE_AI`, `ENABLE_DRIVE`, `ENABLE_KEEP`, `ENABLE_SQLITE_LOGGING`: Aktifkan/nonaktifkan fitur (true/false)

## Penggunaan

1. Jalankan bot dengan perintah:

```bash
node index.js
```

2. Pindai kode QR yang muncul di terminal dengan WhatsApp di ponsel Anda.

## Deployment di cPanel

Untuk menjalankan bot di cPanel, lihat panduan lengkap di [README_CPANEL.md](README_CPANEL.md).

Bot ini dapat dijalankan di cPanel dengan menggunakan Node.js Application dan PM2 untuk manajemen proses. Web interface juga tersedia untuk memantau status bot.

2. Scan QR Code yang muncul di terminal menggunakan aplikasi WhatsApp di ponsel Anda.
3. Setelah berhasil login, bot siap digunakan di grup WhatsApp.

### Konfigurasi Admin

Untuk mengatur nomor admin (6282392115909) agar memiliki akses penuh ke bot:

1. Pastikan nomor tersebut sudah menjadi admin di grup WhatsApp.
2. Bot secara otomatis mengenali admin grup dan memberikan akses ke perintah admin.
3. Nomor admin dapat menggunakan semua perintah admin seperti `!kick`, `!ban`, dll.
4. Jika bot belum menjadi admin di grup, perintah seperti `!kick` tidak akan berfungsi. Bot akan memberikan peringatan untuk menjadikan bot sebagai admin grup.

### Database Per Grup

Bot ini menggunakan database SQLite dengan struktur yang memisahkan data per grup:

- Setiap grup memiliki ID unik yang digunakan sebagai referensi dalam database.
- Tugas, catatan, dan interaksi AI disimpan dengan referensi ke ID grup.
- Saat bot bergabung dengan grup baru, database otomatis membuat entri baru untuk grup tersebut.
- Data dari satu grup tidak akan muncul di grup lain.

## Catatan

- Bot hanya merespon pesan di dalam grup dan tidak berfungsi di chat pribadi.
- Perintah admin hanya dapat digunakan oleh admin grup.
- Untuk fitur pengolahan file, pastikan file yang dikirim sesuai dengan jenis yang diminta.
- Nomor admin (6282392115909) dapat menggunakan perintah khusus untuk memeriksa penggunaan bot dan mengelola fitur.
- Pastikan bot sudah menjadi admin di grup untuk menggunakan fitur kick, hapus pesan, dll.

## Pengembangan

Untuk pengembangan lebih lanjut, Anda dapat menjalankan bot dengan mode development:

```bash
npm run dev
```

Ini akan menjalankan bot dengan nodemon yang akan memuat ulang bot secara otomatis saat ada perubahan kode.

## Lisensi

ISC