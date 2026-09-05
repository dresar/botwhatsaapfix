/**
 * Script untuk menjalankan Admin Panel WhatsApp Bot dengan PM2
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Fungsi utama
function startAdminWithPM2() {
  console.log('\n=== Menjalankan Admin Panel WhatsApp Bot dengan PM2 ===\n');
  
  try {
    // Periksa apakah PM2 terinstal
    try {
      execSync('pm2 --version', { stdio: 'ignore' });
      console.log('PM2 terdeteksi.');
    } catch (error) {
      console.log('PM2 belum terinstal. Menginstal PM2...');
      execSync('npm install -g pm2', { stdio: 'inherit' });
    }
    
    // Periksa apakah direktori admin ada
    const adminDir = path.join(__dirname, 'admin');
    if (!fs.existsSync(adminDir)) {
      console.error('Direktori admin tidak ditemukan!');
      return;
    }
    
    // Periksa apakah file index.js ada
    const indexPath = path.join(adminDir, 'index.js');
    if (!fs.existsSync(indexPath)) {
      console.error('File index.js tidak ditemukan di direktori admin!');
      return;
    }
    
    // Periksa apakah admin panel sudah berjalan di PM2
    try {
      const pmList = execSync('pm2 list').toString();
      if (pmList.includes('admin-panel')) {
        console.log('Admin Panel sudah berjalan di PM2. Me-restart...');
        execSync('pm2 restart admin-panel', { stdio: 'inherit' });
      } else {
        console.log('Menjalankan Admin Panel dengan PM2...');
        execSync('pm2 start admin/index.js --name admin-panel', { stdio: 'inherit' });
      }
    } catch (error) {
      console.log('Menjalankan Admin Panel dengan PM2...');
      execSync('pm2 start admin/index.js --name admin-panel', { stdio: 'inherit' });
    }
    
    console.log('\n=== Admin Panel berhasil dijalankan dengan PM2 ===');
    console.log('Untuk melihat log: pm2 logs admin-panel');
    console.log('Untuk menghentikan: pm2 stop admin-panel');
    console.log('Untuk me-restart: pm2 restart admin-panel');
    console.log('\nAkses Admin Panel di: http://localhost:3000');
  } catch (error) {
    console.error('\nTerjadi kesalahan saat menjalankan Admin Panel dengan PM2:', error);
  }
}

// Jalankan fungsi utama
startAdminWithPM2();