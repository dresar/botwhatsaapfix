// status-updater.js - Script untuk memperbarui status bot
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Buat direktori logs jika belum ada
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Path file status
const statusFilePath = path.join(logsDir, 'status.json');

// Fungsi untuk memeriksa apakah bot berjalan
function checkBotStatus() {
  return new Promise((resolve) => {
    exec('pm2 jlist', (error, stdout) => {
      if (error) {
        console.error(`Error executing pm2 command: ${error}`);
        resolve(false);
        return;
      }
      
      try {
        const processes = JSON.parse(stdout);
        const botProcess = processes.find(p => p.name === 'whatsapp-bot');
        
        if (botProcess && botProcess.pm2_env.status === 'online') {
          // Bot berjalan
          const uptime = Math.floor((Date.now() - botProcess.pm2_env.pm_uptime) / 1000);
          let uptimeStr = '';
          
          if (uptime >= 86400) {
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            uptimeStr = `${days} hari ${hours} jam`;
          } else if (uptime >= 3600) {
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            uptimeStr = `${hours} jam ${minutes} menit`;
          } else if (uptime >= 60) {
            const minutes = Math.floor(uptime / 60);
            uptimeStr = `${minutes} menit`;
          } else {
            uptimeStr = `${uptime} detik`;
          }
          
          const lastRestart = new Date(botProcess.pm2_env.pm_uptime).toLocaleString('id-ID');
          
          resolve({
            running: true,
            lastRestart,
            uptime: uptimeStr,
            memory: Math.round(botProcess.monit.memory / 1024 / 1024) + ' MB',
            cpu: botProcess.monit.cpu + '%',
            restarts: botProcess.pm2_env.restart_time
          });
        } else {
          // Bot tidak berjalan
          resolve({
            running: false,
            lastRestart: 'Tidak diketahui',
            uptime: 'Tidak aktif',
            memory: '0 MB',
            cpu: '0%',
            restarts: 0
          });
        }
      } catch (parseError) {
        console.error(`Error parsing PM2 output: ${parseError}`);
        resolve({
          running: false,
          lastRestart: 'Error',
          uptime: 'Error',
          memory: 'Error',
          cpu: 'Error',
          restarts: 0
        });
      }
    });
  });
}

// Fungsi untuk memperbarui file status
async function updateStatusFile() {
  try {
    const status = await checkBotStatus();
    
    // Tambahkan timestamp
    status.lastUpdate = new Date().toLocaleString('id-ID');
    
    // Tulis ke file
    fs.writeFileSync(statusFilePath, JSON.stringify(status, null, 2));
    console.log(`Status updated at ${status.lastUpdate}`);
  } catch (error) {
    console.error(`Error updating status file: ${error}`);
  }
}

// Perbarui status setiap 1 menit
setInterval(updateStatusFile, 60000);

// Perbarui status saat pertama kali dijalankan
updateStatusFile();

console.log('Status updater started');