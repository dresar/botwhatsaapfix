/**
 * Routes untuk Admin Panel
 */

const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const { isAuthenticated, isNotAuthenticated, login, logout } = require('./auth');

// Halaman login
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', { error: req.session.error || null });
  delete req.session.error;
});

// Proses login
router.post('/login', isNotAuthenticated, async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    req.session.error = 'Username dan password diperlukan';
    return res.redirect('/login');
  }
  
  const result = await login(username, password);
  
  if (result.success) {
    req.session.isAuthenticated = true;
    req.session.username = username;
    req.session.isMainAdmin = result.isMainAdmin;
    
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    
    res.redirect(returnTo);
  } else {
    req.session.error = result.message;
    res.redirect('/login');
  }
});

// Proses logout
router.get('/logout', (req, res) => {
  logout(req, res);
});

// Dashboard
router.get('/', isAuthenticated, (req, res) => {
  try {
    // Baca file status.json
    let botStatus = {
      running: false,
      lastRestart: null,
      uptime: 0,
      memory: 0,
      cpu: 0,
      restarts: 0,
      lastUpdate: null
    };
    
    if (fs.existsSync(config.statusPath)) {
      botStatus = fs.readJsonSync(config.statusPath);
    }
    
    // Dapatkan status fitur
    const featureStatus = config.getFeatureStatus();
    
    // Periksa apakah QR code ada
    const qrCodeExists = fs.existsSync(config.qrCodePath);
    
    // Tambahkan informasi sistem
    const os = require('os');
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      cpu: `${os.loadavg()[0].toFixed(2)}%`,
      uptime: `${Math.floor(os.uptime() / 3600)} jam ${Math.floor((os.uptime() % 3600) / 60)} menit`
    };
    
    res.render('dashboard', {
      username: req.session.username,
      botStatus,
      featureStatus,
      qrCodeExists,
      systemInfo
    });
  } catch (error) {
    console.error('Gagal memuat dashboard:', error);
    res.status(500).send('Terjadi kesalahan saat memuat dashboard');
  }
});

// Halaman pengaturan
router.get('/settings', isAuthenticated, (req, res) => {
  res.render('settings', {
    username: req.session.username,
    isMainAdmin: req.session.isMainAdmin !== false, // true jika tidak disetel atau true
    additionalAdmins: config.additionalAdmins,
    success: req.session.success,
    error: req.session.error
  });
  
  delete req.session.success;
  delete req.session.error;
});

// Proses ubah password
router.post('/settings/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      req.session.error = 'Semua field diperlukan';
      return res.redirect('/settings');
    }
    
    if (newPassword !== confirmPassword) {
      req.session.error = 'Password baru dan konfirmasi password tidak cocok';
      return res.redirect('/settings');
    }
    
    if (newPassword.length < 6) {
      req.session.error = 'Password baru harus minimal 6 karakter';
      return res.redirect('/settings');
    }
    
    // Verifikasi password saat ini
    const isMatch = await config.verifyPassword(currentPassword);
    
    if (!isMatch) {
      req.session.error = 'Password saat ini salah';
      return res.redirect('/settings');
    }
    
    // Ubah password
    const result = await config.changePassword(newPassword);
    
    if (result) {
      req.session.success = 'Password berhasil diubah';
    } else {
      req.session.error = 'Gagal mengubah password';
    }
    
    res.redirect('/settings');
  } catch (error) {
    console.error('Gagal mengubah password:', error);
    req.session.error = 'Terjadi kesalahan saat mengubah password';
    res.redirect('/settings');
  }
});

// Tambah admin baru
router.post('/settings/add-admin', isAuthenticated, async (req, res) => {
  try {
    // Hanya admin utama yang bisa menambah admin baru
    if (req.session.isMainAdmin === false) {
      req.session.error = 'Anda tidak memiliki izin untuk menambahkan admin';
      return res.redirect('/settings');
    }
    
    const { newUsername, newAdminPassword, confirmAdminPassword } = req.body;
    
    if (!newUsername || !newAdminPassword || !confirmAdminPassword) {
      req.session.error = 'Semua field diperlukan';
      return res.redirect('/settings');
    }
    
    if (newAdminPassword !== confirmAdminPassword) {
      req.session.error = 'Password dan konfirmasi password tidak cocok';
      return res.redirect('/settings');
    }
    
    if (newAdminPassword.length < 6) {
      req.session.error = 'Password harus minimal 6 karakter';
      return res.redirect('/settings');
    }
    
    // Periksa apakah username sudah ada
    if (newUsername === config.admin.username || 
        config.additionalAdmins.some(admin => admin.username === newUsername)) {
      req.session.error = 'Username sudah digunakan';
      return res.redirect('/settings');
    }
    
    // Tambahkan admin baru
    const result = await config.addAdmin(newUsername, newAdminPassword);
    
    if (result) {
      req.session.success = 'Admin baru berhasil ditambahkan';
    } else {
      req.session.error = 'Gagal menambahkan admin baru';
    }
    
    res.redirect('/settings');
  } catch (error) {
    console.error('Gagal menambahkan admin:', error);
    req.session.error = 'Terjadi kesalahan saat menambahkan admin';
    res.redirect('/settings');
  }
});

// Hapus admin
router.post('/settings/remove-admin', isAuthenticated, async (req, res) => {
  try {
    // Hanya admin utama yang bisa menghapus admin
    if (req.session.isMainAdmin === false) {
      req.session.error = 'Anda tidak memiliki izin untuk menghapus admin';
      return res.redirect('/settings');
    }
    
    const { username } = req.body;
    
    if (!username) {
      req.session.error = 'Username diperlukan';
      return res.redirect('/settings');
    }
    
    // Hapus admin
    const result = await config.removeAdmin(username);
    
    if (result) {
      req.session.success = 'Admin berhasil dihapus';
    } else {
      req.session.error = 'Gagal menghapus admin';
    }
    
    res.redirect('/settings');
  } catch (error) {
    console.error('Gagal menghapus admin:', error);
    req.session.error = 'Terjadi kesalahan saat menghapus admin';
    res.redirect('/settings');
  }
});

// Halaman QR code
router.get('/qrcode', isAuthenticated, (req, res) => {
  try {
    const qrCodeExists = fs.existsSync(config.qrCodePath);
    
    res.render('qrcode', {
      username: req.session.username,
      qrCodeExists
    });
  } catch (error) {
    console.error('Gagal memuat halaman QR code:', error);
    res.status(500).send('Terjadi kesalahan saat memuat halaman QR code');
  }
});

// Mendapatkan gambar QR code
router.get('/qrcode/image', isAuthenticated, (req, res) => {
  try {
    if (fs.existsSync(config.qrCodePath)) {
      res.sendFile(config.qrCodePath);
    } else {
      res.status(404).send('QR code tidak tersedia');
    }
  } catch (error) {
    console.error('Gagal mendapatkan gambar QR code:', error);
    res.status(500).send('Terjadi kesalahan saat mendapatkan gambar QR code');
  }
});

// Halaman log
router.get('/logs', isAuthenticated, (req, res) => {
  res.render('logs', {
    username: req.session.username
  });
});

module.exports = router;