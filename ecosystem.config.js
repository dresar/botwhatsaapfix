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
    },
    {
      name: "admin-panel",
      script: "admin/index.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        ADMIN_PORT: 3000
      },
      // Konfigurasi tambahan untuk performa dan stabilitas
      max_memory_restart: '500M',  // Restart jika penggunaan memori melebihi 500MB
      restart_delay: 3000,         // Tunggu 3 detik sebelum restart
      // Konfigurasi log
      error_file: './logs/admin-panel-error.log',
      out_file: './logs/admin-panel-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};