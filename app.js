const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8080;

// Path ke file status
const statusFilePath = path.join(__dirname, 'logs', 'status.json');

// Fungsi untuk mendapatkan status bot
function getBotStatus() {
  try {
    if (fs.existsSync(statusFilePath)) {
      const statusData = fs.readFileSync(statusFilePath, 'utf8');
      return JSON.parse(statusData);
    } else {
      return {
        running: false,
        lastRestart: 'Tidak diketahui',
        uptime: 'Tidak aktif',
        memory: '0 MB',
        cpu: '0%',
        restarts: 0,
        lastUpdate: new Date().toLocaleString('id-ID')
      };
    }
  } catch (error) {
    console.error(`Error reading status file: ${error}`);
    return {
      running: false,
      lastRestart: 'Error',
      uptime: 'Error',
      memory: 'Error',
      cpu: 'Error',
      restarts: 0,
      lastUpdate: new Date().toLocaleString('id-ID')
    };
  }
}

// Fungsi untuk mendapatkan informasi sistem
function getSystemInfo() {
  const uptime = os.uptime();
  const uptimeStr = formatUptime(uptime);
  
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    memory: `${Math.round(os.freemem() / 1024 / 1024)} MB free of ${Math.round(os.totalmem() / 1024 / 1024)} MB`,
    cpuUsage: `${os.loadavg()[0].toFixed(2)}%`,
    uptime: uptimeStr
  };
}

// Fungsi untuk memformat uptime
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Rute utama
app.get('/', (req, res) => {
  const systemInfo = getSystemInfo();
  const botStatus = getBotStatus();
  
  const html = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status WhatsApp Bot</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .container {
        background-color: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      h1 {
        color: #4CAF50;
        border-bottom: 2px solid #4CAF50;
        padding-bottom: 10px;
      }
      .status-card {
        background-color: #f9f9f9;
        border-left: 4px solid #4CAF50;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 4px;
      }
      .status-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }
      .active {
        background-color: #4CAF50;
      }
      .inactive {
        background-color: #F44336;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      .info-item {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 4px;
      }
      .label {
        font-weight: bold;
        color: #555;
      }
      .refresh-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 20px;
      }
      .refresh-btn:hover {
        background-color: #45a049;
      }
      footer {
        margin-top: 30px;
        text-align: center;
        font-size: 14px;
        color: #777;
      }
      .auto-refresh {
        font-size: 12px;
        color: #777;
        margin-top: 5px;
      }
    </style>
    <script>
      // Auto refresh setiap 30 detik
      setTimeout(function() {
        window.location.reload();
      }, 30000);
    </script>
  </head>
  <body>
    <div class="container">
      <h1>Status WhatsApp Bot</h1>
      
      <div class="status-card">
        <h2>
          <span class="status-indicator ${botStatus.running ? 'active' : 'inactive'}"></span>
          Bot Status: ${botStatus.running ? 'Aktif' : 'Tidak Aktif'}
        </h2>
        <p><span class="label">Restart Terakhir:</span> ${botStatus.lastRestart}</p>
        <p><span class="label">Uptime:</span> ${botStatus.uptime}</p>
        <p><span class="label">Penggunaan Memori:</span> ${botStatus.memory}</p>
        <p><span class="label">Penggunaan CPU:</span> ${botStatus.cpu}</p>
        <p><span class="label">Jumlah Restart:</span> ${botStatus.restarts}</p>
        <p><span class="label">Terakhir Diperbarui:</span> ${botStatus.lastUpdate}</p>
      </div>
      
      <h2>Informasi Sistem</h2>
      <div class="info-grid">
        <div class="info-item">
          <p><span class="label">Platform:</span> ${systemInfo.platform}</p>
          <p><span class="label">Arsitektur:</span> ${systemInfo.arch}</p>
          <p><span class="label">Versi Node.js:</span> ${systemInfo.nodeVersion}</p>
        </div>
        <div class="info-item">
          <p><span class="label">Penggunaan Memori:</span> ${systemInfo.memory}</p>
          <p><span class="label">Penggunaan CPU:</span> ${systemInfo.cpuUsage}</p>
          <p><span class="label">Uptime Server:</span> ${systemInfo.uptime}</p>
        </div>
      </div>
      
      <button class="refresh-btn" onclick="window.location.reload();">Refresh Status</button>
      <p class="auto-refresh">Halaman ini akan diperbarui otomatis setiap 30 detik</p>
    </div>
    
    <footer>
      &copy; ${new Date().getFullYear()} WhatsApp Bot Status Page
    </footer>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Rute API untuk mendapatkan status dalam format JSON
app.get('/api/status', (req, res) => {
  const systemInfo = getSystemInfo();
  const botStatus = getBotStatus();
  
  res.json({
    bot: botStatus,
    system: systemInfo
  });
});

// Mulai server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Buat direktori logs jika belum ada
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}