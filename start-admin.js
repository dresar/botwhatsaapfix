/**
 * Script untuk menjalankan Admin Panel WhatsApp Bot
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Fungsi utama
function startAdmin() {
  console.log('\n=== Menjalankan Admin Panel WhatsApp Bot ===\n');
  
  try {
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
    
    // Jalankan admin panel
    console.log('Menjalankan Admin Panel...');
    execSync('node admin/index.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('\nTerjadi kesalahan saat menjalankan Admin Panel:', error);
  }
}

// Jalankan fungsi utama
startAdmin();