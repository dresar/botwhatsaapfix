/**
 * Admin Panel untuk WhatsApp Bot
 */

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');

// Import konfigurasi dan middleware
const config = require('./config');
const routes = require('./routes');
const apiRoutes = require('./api');

// Inisialisasi Express
const app = express();
const port = config.port;

// Konfigurasi Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// Tambahkan akses ke direktori temp
app.use('/temp', express.static(path.join(__dirname, '..', 'temp')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Konfigurasi session
app.use(session(config.session));

// Gunakan routes
app.use('/', routes);
app.use('/api', apiRoutes);

// Mulai server
app.listen(port, () => {
  console.log(`Admin Panel berjalan di http://localhost:${port}`);
  
  // Buat direktori logs jika belum ada
  if (!fs.existsSync(config.logsDir)) {
    fs.mkdirSync(config.logsDir, { recursive: true });
  }
});