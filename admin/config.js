/**
 * Konfigurasi untuk Admin Panel
 */

const path = require('path');
const fs = require('fs-extra');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Muat variabel lingkungan dari file .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Konfigurasi default
const config = {
  // Port untuk server admin
  port: 3002, // Mengubah port dari 3001 ke 3002 untuk menghindari konflik
  
  // Kredensial admin
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2b$10$Xt0WT1Uu.rVN3dQZQCQW6uIXFTX9G.ztNxRZpQdgc0tGWMBDAPU3K', // Default: 'admin'
  },
  
  // Daftar admin tambahan
  additionalAdmins: JSON.parse(process.env.ADDITIONAL_ADMINS || '[]'),
  
  // Rahasia sesi
  session: {
    secret: process.env.SESSION_SECRET || 'whatsapp-bot-admin-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 jam
    },
  },
  
  // Path ke file status
  statusPath: path.join(__dirname, '..', 'logs', 'status.json'),
  
  // Path ke file konfigurasi
  configPath: path.join(__dirname, '..', 'config.js'),
  
  // Path ke file .env
  envPath: envPath,
  
  // Path ke file QR code
  qrCodePath: path.join(__dirname, '..', 'temp', 'last-qr.png'),
  
  // Path ke direktori logs
  logsDir: path.join(__dirname, '..', 'logs'),
  
  // Nama proses PM2
  pm2Process: 'whatsapp-bot',
  
  // Nama proses admin panel PM2
  adminPm2Process: 'admin-panel',
};

// Fungsi untuk memverifikasi password
config.verifyPassword = async (password) => {
  return bcrypt.compare(password, config.admin.passwordHash);
};

// Fungsi untuk mengubah password admin
config.changePassword = async (newPassword) => {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Baca file .env
    let envContent = fs.readFileSync(config.envPath, 'utf8');
    
    // Perbarui ADMIN_PASSWORD_HASH
    const regex = new RegExp(`^ADMIN_PASSWORD_HASH=.*`, 'gm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `ADMIN_PASSWORD_HASH=${passwordHash}`);
    } else {
      envContent += `\nADMIN_PASSWORD_HASH=${passwordHash}`;
    }
    
    // Tulis kembali file .env
    fs.writeFileSync(config.envPath, envContent);
    
    // Perbarui konfigurasi
    config.admin.passwordHash = passwordHash;
    
    return true;
  } catch (error) {
    console.error('Gagal mengubah password:', error);
    return false;
  }
};

// Fungsi untuk menambahkan admin baru
config.addAdmin = async (username, password) => {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Buat objek admin baru
    const newAdmin = { username, passwordHash };
    
    // Tambahkan ke daftar admin
    config.additionalAdmins.push(newAdmin);
    
    // Baca file .env
    let envContent = fs.readFileSync(config.envPath, 'utf8');
    
    // Perbarui ADDITIONAL_ADMINS
    const regex = new RegExp(`^ADDITIONAL_ADMINS=.*`, 'gm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `ADDITIONAL_ADMINS=${JSON.stringify(config.additionalAdmins)}`);
    } else {
      envContent += `\nADDITIONAL_ADMINS=${JSON.stringify(config.additionalAdmins)}`;
    }
    
    // Tulis kembali file .env
    fs.writeFileSync(config.envPath, envContent);
    
    return true;
  } catch (error) {
    console.error('Gagal menambahkan admin:', error);
    return false;
  }
};

// Fungsi untuk menghapus admin
config.removeAdmin = async (username) => {
  try {
    // Filter admin yang akan dihapus
    config.additionalAdmins = config.additionalAdmins.filter(admin => admin.username !== username);
    
    // Baca file .env
    let envContent = fs.readFileSync(config.envPath, 'utf8');
    
    // Perbarui ADDITIONAL_ADMINS
    const regex = new RegExp(`^ADDITIONAL_ADMINS=.*`, 'gm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `ADDITIONAL_ADMINS=${JSON.stringify(config.additionalAdmins)}`);
    } else {
      envContent += `\nADDITIONAL_ADMINS=${JSON.stringify(config.additionalAdmins)}`;
    }
    
    // Tulis kembali file .env
    fs.writeFileSync(config.envPath, envContent);
    
    return true;
  } catch (error) {
    console.error('Gagal menghapus admin:', error);
    return false;
  }
};

// Fungsi untuk mendapatkan status fitur dari file .env
config.getFeatureStatus = () => {
  try {
    return {
      ai: process.env.ENABLE_AI === 'true',
      drive: process.env.ENABLE_DRIVE === 'true',
      keep: process.env.ENABLE_KEEP === 'true',
      sqliteLogging: process.env.ENABLE_SQLITE_LOGGING === 'true',
      docs: process.env.ENABLE_DOCS === 'true',
      calendar: process.env.ENABLE_CALENDAR === 'true',
      tasks: process.env.ENABLE_TASKS === 'true',
      wikipedia: process.env.ENABLE_WIKIPEDIA === 'true',
    };
  } catch (error) {
    console.error('Gagal mendapatkan status fitur:', error);
    return {
      ai: false,
      drive: false,
      keep: false,
      sqliteLogging: false,
      docs: false,
      calendar: false,
      tasks: false,
      wikipedia: false,
    };
  }
};

// Fungsi untuk mengubah status fitur
config.toggleFeature = (feature, enabled) => {
  try {
    // Pemetaan nama fitur ke variabel lingkungan
    const featureEnvMap = {
      ai: 'ENABLE_AI',
      drive: 'ENABLE_DRIVE',
      keep: 'ENABLE_KEEP',
      sqliteLogging: 'ENABLE_SQLITE_LOGGING',
      docs: 'ENABLE_DOCS',
      calendar: 'ENABLE_CALENDAR',
      tasks: 'ENABLE_TASKS',
      wikipedia: 'ENABLE_WIKIPEDIA',
    };
    
    // Periksa apakah fitur valid
    if (!featureEnvMap[feature]) {
      throw new Error(`Fitur tidak valid: ${feature}`);
    }
    
    // Baca file .env
    let envContent = fs.readFileSync(config.envPath, 'utf8');
    
    // Perbarui status fitur
    const envVar = featureEnvMap[feature];
    const regex = new RegExp(`^${envVar}=.*`, 'gm');
    const newValue = enabled ? 'true' : 'false';
    
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${envVar}=${newValue}`);
    } else {
      envContent += `\n${envVar}=${newValue}`;
    }
    
    // Tulis kembali file .env
    fs.writeFileSync(config.envPath, envContent);
    
    // Perbarui variabel lingkungan
    process.env[envVar] = newValue;
    
    return true;
  } catch (error) {
    console.error(`Gagal mengubah status fitur ${feature}:`, error);
    return false;
  }
};

module.exports = config;