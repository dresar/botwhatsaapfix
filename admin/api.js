/**
 * API routes untuk Admin Panel
 */

const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const config = require('./config');
const { isAuthenticatedApi } = require('./auth');

// Middleware untuk semua rute API
router.use(isAuthenticatedApi);

// Mendapatkan status bot
router.get('/status', (req, res) => {
  try {
    // Baca file status.json
    if (fs.existsSync(config.statusPath)) {
      const statusData = fs.readJsonSync(config.statusPath);
      res.json(statusData);
    } else {
      res.json({
        running: false,
        lastRestart: null,
        uptime: 0,
        memory: 0,
        cpu: 0,
        restarts: 0,
        lastUpdate: null
      });
    }
  } catch (error) {
    console.error('Gagal mendapatkan status bot:', error);
    res.status(500).json({ error: 'Gagal mendapatkan status bot' });
  }
});

// Mendapatkan informasi sistem
router.get('/system', (req, res) => {
  try {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
      },
      cpuUsage: 0,
      uptime: os.uptime()
    };
    
    // Dapatkan penggunaan CPU
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    systemInfo.cpuUsage = ((1 - totalIdle / totalTick) * 100).toFixed(2);
    
    res.json(systemInfo);
  } catch (error) {
    console.error('Gagal mendapatkan informasi sistem:', error);
    res.status(500).json({ error: 'Gagal mendapatkan informasi sistem' });
  }
});

// Mendapatkan status fitur
router.get('/features', (req, res) => {
  try {
    const featureStatus = config.getFeatureStatus();
    res.json(featureStatus);
  } catch (error) {
    console.error('Gagal mendapatkan status fitur:', error);
    res.status(500).json({ error: 'Gagal mendapatkan status fitur' });
  }
});

// Mengubah status fitur
router.post('/features/toggle', (req, res) => {
  try {
    const { feature, enabled } = req.body;
    
    if (!feature) {
      return res.status(400).json({ error: 'Parameter feature diperlukan' });
    }
    
    const result = config.toggleFeature(feature, enabled);
    
    if (result) {
      res.json({ success: true, feature, enabled });
    } else {
      res.status(500).json({ error: 'Gagal mengubah status fitur' });
    }
  } catch (error) {
    console.error('Gagal mengubah status fitur:', error);
    res.status(500).json({ error: 'Gagal mengubah status fitur' });
  }
});

// Memulai bot
router.post('/bot/start', (req, res) => {
  exec(`pm2 start ${config.pm2Process}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Gagal memulai bot: ${error.message}`);
      return res.status(500).json({ error: 'Gagal memulai bot', details: error.message });
    }
    
    if (stderr) {
      console.error(`Stderr saat memulai bot: ${stderr}`);
    }
    
    res.json({ success: true, message: 'Bot berhasil dimulai' });
  });
});

// Menghentikan bot
router.post('/bot/stop', (req, res) => {
  exec(`pm2 stop ${config.pm2Process}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Gagal menghentikan bot: ${error.message}`);
      return res.status(500).json({ error: 'Gagal menghentikan bot', details: error.message });
    }
    
    if (stderr) {
      console.error(`Stderr saat menghentikan bot: ${stderr}`);
    }
    
    res.json({ success: true, message: 'Bot berhasil dihentikan' });
  });
});

// Me-restart bot
router.post('/bot/restart', (req, res) => {
  exec(`pm2 restart ${config.pm2Process}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Gagal me-restart bot: ${error.message}`);
      return res.status(500).json({ error: 'Gagal me-restart bot', details: error.message });
    }
    
    if (stderr) {
      console.error(`Stderr saat me-restart bot: ${stderr}`);
    }
    
    res.json({ success: true, message: 'Bot berhasil di-restart' });
  });
});

// Mendapatkan log bot
router.get('/logs', (req, res) => {
  try {
    const { type = 'out', lines = 100 } = req.query;
    
    // Validasi tipe log
    if (type !== 'out' && type !== 'error') {
      return res.status(400).json({ error: 'Tipe log tidak valid. Gunakan "out" atau "error"' });
    }
    
    // Validasi jumlah baris
    const numLines = parseInt(lines, 10);
    if (isNaN(numLines) || numLines <= 0 || numLines > 1000) {
      return res.status(400).json({ error: 'Jumlah baris tidak valid. Gunakan angka antara 1-1000' });
    }
    
    // Path ke file log
    const logFile = type === 'out' 
      ? path.join(config.logsDir, `${config.pm2Process}-out.log`)
      : path.join(config.logsDir, `${config.pm2Process}-error.log`);
    
    // Periksa apakah file log ada
    if (!fs.existsSync(logFile)) {
      return res.json({ logs: [] });
    }
    
    // Baca file log dan ambil n baris terakhir
    exec(`powershell -Command "Get-Content -Tail ${numLines} '${logFile}'"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Gagal membaca log: ${error.message}`);
        return res.status(500).json({ error: 'Gagal membaca log', details: error.message });
      }
      
      if (stderr) {
        console.error(`Stderr saat membaca log: ${stderr}`);
      }
      
      // Split log menjadi array baris
      const logLines = stdout.split('\n').filter(line => line.trim() !== '');
      
      res.json({ logs: logLines });
    });
  } catch (error) {
    console.error('Gagal mendapatkan log bot:', error);
    res.status(500).json({ error: 'Gagal mendapatkan log bot' });
  }
});

// Mengubah password admin
router.post('/admin/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password saat ini dan password baru diperlukan' });
    }
    
    // Verifikasi password saat ini
    const isMatch = await config.verifyPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Password saat ini salah' });
    }
    
    // Validasi password baru
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru harus minimal 6 karakter' });
    }
    
    // Ubah password
    const result = await config.changePassword(newPassword);
    
    if (result) {
      res.json({ success: true, message: 'Password berhasil diubah' });
    } else {
      res.status(500).json({ error: 'Gagal mengubah password' });
    }
  } catch (error) {
    console.error('Gagal mengubah password:', error);
    res.status(500).json({ error: 'Gagal mengubah password' });
  }
});

// Mendapatkan status QR code
router.get('/qrcode/status', (req, res) => {
  try {
    const qrExists = fs.existsSync(config.qrCodePath);
    res.json({ exists: qrExists });
  } catch (error) {
    console.error('Gagal memeriksa status QR code:', error);
    res.status(500).json({ error: 'Gagal memeriksa status QR code' });
  }
});

module.exports = router;