/**
 * Script instalasi untuk Admin Panel WhatsApp Bot
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fungsi untuk membuat prompt yang menunggu input
const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

// Fungsi utama instalasi
async function install() {
  console.log('\n=== Instalasi Admin Panel WhatsApp Bot ===\n');
  
  try {
    // Buat direktori yang diperlukan
    console.log('Membuat direktori yang diperlukan...');
    fs.ensureDirSync(path.join(__dirname, 'public'));
    fs.ensureDirSync(path.join(__dirname, 'public', 'css'));
    fs.ensureDirSync(path.join(__dirname, 'public', 'js'));
    fs.ensureDirSync(path.join(__dirname, 'public', 'images'));
    fs.ensureDirSync(path.join(__dirname, 'views'));
    
    // Instal dependensi
    console.log('\nMenginstal dependensi...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Konfigurasi admin
    console.log('\n=== Konfigurasi Admin ===');
    console.log('Silakan buat kredensial admin (atau tekan Enter untuk menggunakan default):\n');
    
    const defaultUsername = 'admin';
    const defaultPassword = 'admin';
    
    let username = await prompt(`Username (default: ${defaultUsername}): `);
    username = username.trim() || defaultUsername;
    
    let password = await prompt(`Password (default: ${defaultPassword}): `);
    password = password.trim() || defaultPassword;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Buat atau perbarui file .env
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Tambahkan atau perbarui variabel admin
    const envVars = {
      ADMIN_USERNAME: username,
      ADMIN_PASSWORD_HASH: passwordHash,
      ADMIN_PORT: '3000',
      SESSION_SECRET: `whatsapp-bot-secret-${Math.random().toString(36).substring(2, 15)}`
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*`, 'gm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n=== Instalasi Selesai ===');
    console.log(`\nAdmin Panel berhasil diinstal!`);
    console.log(`\nUntuk menjalankan Admin Panel:`);
    console.log(`1. Jalankan: node index.js`);
    console.log(`2. Akses: http://localhost:3000`);
    console.log(`3. Login dengan username: ${username} dan password yang Anda buat`);
    
  } catch (error) {
    console.error('\nTerjadi kesalahan saat instalasi:', error);
  } finally {
    rl.close();
  }
}

// Jalankan instalasi
install();