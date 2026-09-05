#!/bin/bash

# Script untuk setup WhatsApp Bot di cPanel
echo "=== Setup WhatsApp Bot di cPanel ==="

# Buat direktori yang diperlukan
echo "Membuat direktori yang diperlukan..."
mkdir -p logs temp data uploads stickers

# Periksa versi Node.js
echo "Memeriksa versi Node.js..."
node_version=$(node -v)
if [[ $node_version < "v18" ]]; then
  echo "PERINGATAN: Bot membutuhkan Node.js v18 atau lebih tinggi. Versi terdeteksi: $node_version"
  echo "Silakan upgrade Node.js melalui cPanel atau hubungi penyedia hosting Anda."
else
  echo "Versi Node.js: $node_version (OK)"
fi

# Install dependensi
echo "Menginstall dependensi npm..."
npm install

# Install Express untuk web interface
echo "Menginstall Express untuk web interface..."
npm install express --save

# Periksa PM2
echo "Memeriksa PM2..."
if ! command -v pm2 &> /dev/null; then
  echo "PM2 tidak ditemukan. Menginstall PM2 secara global..."
  npm install -g pm2
else
  echo "PM2 sudah terinstall."
fi

# Buat file ecosystem.config.js jika belum ada
if [ ! -f ecosystem.config.js ]; then
  echo "Membuat file konfigurasi PM2..."
  cat > ecosystem.config.js << 'EOL'
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
EOL
  echo "File ecosystem.config.js berhasil dibuat."
fi

# Buat file .env jika belum ada
if [ ! -f .env ]; then
  echo "Membuat file .env template..."
  cat > .env << 'EOL'
# Konfigurasi Bot
BOT_NAME=WhatsApp Bot

# Google API Credentials
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
GOOGLE_REFRESH_TOKEN=your_refresh_token

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Database Settings
DB_PATH=./data/bot.sqlite
ENABLE_GROUP_DATABASES=true
GROUP_DB_DIR=./data/groups

# Admin Numbers (comma separated, format: countrycode+number)
ADMIN_NUMBERS=6281234567890

# Storage Directories
TEMP_DIR=./temp
DATA_DIR=./data
UPLOADS_DIR=./uploads
STICKERS_DIR=./stickers

# Feature Toggles
ENABLE_AI=true
ENABLE_DRIVE=true
ENABLE_KEEP=true
ENABLE_SQLITE_LOGGING=true
ENABLE_DOCS=true
ENABLE_CALENDAR=true
ENABLE_TASKS=true
ENABLE_WIKIPEDIA=true

# Web Interface Settings
PORT=8080

# Puppeteer Path (untuk cPanel)
PUPPETEER_EXECUTABLE_PATH=/path/to/chromium
EOL
  echo "File .env template berhasil dibuat. Silakan edit dengan nilai yang sesuai."
fi

# Periksa Chromium
echo "Memeriksa Chromium..."
if [ -z "$PUPPETEER_EXECUTABLE_PATH" ]; then
  echo "PERINGATAN: Path Chromium belum dikonfigurasi."
  echo "Anda perlu mengatur PUPPETEER_EXECUTABLE_PATH di file .env"
  echo "Contoh: PUPPETEER_EXECUTABLE_PATH=/home/username/chromium/chrome"
  
  # Coba deteksi Chromium di beberapa lokasi umum
  possible_paths=(
    "/usr/bin/chromium"
    "/usr/bin/chromium-browser"
    "/usr/bin/google-chrome"
    "$HOME/chromium/chrome"
  )
  
  for path in "${possible_paths[@]}"; do
    if [ -f "$path" ]; then
      echo "Chromium ditemukan di: $path"
      echo "Tambahkan path ini ke file .env Anda:"
      echo "PUPPETEER_EXECUTABLE_PATH=$path"
      break
    fi
  done
else
  if [ -f "$PUPPETEER_EXECUTABLE_PATH" ]; then
    echo "Chromium ditemukan di: $PUPPETEER_EXECUTABLE_PATH (OK)"
  else
    echo "PERINGATAN: Chromium tidak ditemukan di path yang dikonfigurasi: $PUPPETEER_EXECUTABLE_PATH"
    echo "Silakan periksa dan perbarui path di file .env"
  fi
fi

echo "Setup selesai!"
echo "Untuk menjalankan bot dan web interface, gunakan perintah: pm2 start ecosystem.config.js"
echo "Untuk melihat log bot, gunakan perintah: pm2 logs whatsapp-bot"
echo "Untuk melihat log web interface, gunakan perintah: pm2 logs web-interface"
echo "Untuk menghentikan semua aplikasi, gunakan perintah: pm2 stop all"
echo "Web interface dapat diakses di: http://localhost:8080 atau http://your-domain.com:8080"