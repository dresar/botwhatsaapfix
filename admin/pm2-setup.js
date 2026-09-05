/**
 * Script untuk mengatur Admin Panel dengan PM2
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Fungsi utama setup
function setup() {
  console.log('\n=== Mengatur Admin Panel dengan PM2 ===\n');
  
  try {
    // Periksa apakah PM2 terinstal
    console.log('Memeriksa instalasi PM2...');
    try {
      execSync('pm2 --version', { stdio: 'ignore' });
      console.log('PM2 sudah terinstal.');
    } catch (error) {
      console.log('PM2 belum terinstal. Menginstal PM2...');
      execSync('npm install -g pm2', { stdio: 'inherit' });
    }
    
    // Buat atau perbarui konfigurasi PM2
    console.log('\nMembuat konfigurasi PM2 untuk Admin Panel...');
    
    // Periksa apakah ecosystem.config.js sudah ada
    const ecosystemPath = path.join(__dirname, '..', 'ecosystem.config.js');
    let ecosystemContent = '';
    
    if (fs.existsSync(ecosystemPath)) {
      // Baca file ecosystem.config.js yang ada
      ecosystemContent = fs.readFileSync(ecosystemPath, 'utf8');
      
      // Periksa apakah konfigurasi admin-panel sudah ada
      if (ecosystemContent.includes('name: "admin-panel"')) {
        console.log('Konfigurasi admin-panel sudah ada di ecosystem.config.js');
      } else {
        // Tambahkan konfigurasi admin-panel
        const adminPanelConfig = `
    {
      name: "admin-panel",
      script: "./admin/index.js",
      watch: false,
      max_memory_restart: "200M",
      restart_delay: 3000,
      env: {
        NODE_ENV: "production"
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "./logs/admin-panel-out.log",
      error_file: "./logs/admin-panel-error.log"
    },`;
        
        // Sisipkan konfigurasi admin-panel setelah array apps dibuka
        ecosystemContent = ecosystemContent.replace(
          'apps: [',
          'apps: [' + adminPanelConfig
        );
        
        // Tulis kembali file ecosystem.config.js
        fs.writeFileSync(ecosystemPath, ecosystemContent);
        console.log('Konfigurasi admin-panel ditambahkan ke ecosystem.config.js');
      }
    } else {
      // Buat file ecosystem.config.js baru
      ecosystemContent = `module.exports = {
  apps: [
    {
      name: "admin-panel",
      script: "./admin/index.js",
      watch: false,
      max_memory_restart: "200M",
      restart_delay: 3000,
      env: {
        NODE_ENV: "production"
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "./logs/admin-panel-out.log",
      error_file: "./logs/admin-panel-error.log"
    }
  ]
};
`;
      
      fs.writeFileSync(ecosystemPath, ecosystemContent);
      console.log('File ecosystem.config.js dibuat dengan konfigurasi admin-panel');
    }
    
    // Buat direktori logs jika belum ada
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('Direktori logs dibuat');
    }
    
    console.log('\n=== Setup Selesai ===');
    console.log('\nUntuk menjalankan Admin Panel dengan PM2:');
    console.log('1. Jalankan: pm2 start ecosystem.config.js');
    console.log('2. Untuk memastikan PM2 berjalan saat startup: pm2 save && pm2 startup');
    console.log('3. Akses Admin Panel di: http://localhost:3000 (atau port yang dikonfigurasi)');
    
  } catch (error) {
    console.error('\nTerjadi kesalahan saat setup:', error);
  }
}

// Jalankan setup
setup();