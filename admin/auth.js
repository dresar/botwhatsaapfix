/**
 * Middleware autentikasi untuk Admin Panel
 */

const config = require('./config');
const bcrypt = require('bcrypt');

// Middleware untuk memeriksa apakah pengguna sudah login
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  
  // Jika mengakses API, kembalikan respons JSON
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }
  
  // Simpan URL yang diminta untuk redirect setelah login
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

// Middleware untuk memeriksa apakah pengguna sudah login untuk API
const isAuthenticatedApi = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  
  return res.status(401).json({ error: 'Tidak terautentikasi' });
};

// Middleware untuk memeriksa apakah pengguna sudah login untuk halaman login
const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return res.redirect(req.session.returnTo || '/');
  }
  
  next();
};

// Fungsi untuk login
const login = async (username, password) => {
  try {
    // Periksa admin utama
    if (username === config.admin.username) {
      const isMatch = await config.verifyPassword(password);
      if (isMatch) {
        return { success: true, isMainAdmin: true };
      }
    }
    
    // Periksa admin tambahan
    const additionalAdmin = config.additionalAdmins.find(admin => admin.username === username);
    if (additionalAdmin) {
      const isMatch = await bcrypt.compare(password, additionalAdmin.passwordHash);
      if (isMatch) {
        return { success: true, isMainAdmin: false };
      }
    }
    
    // Jika tidak ada yang cocok
    return { success: false, message: 'Username atau password salah' };
  } catch (error) {
    console.error('Kesalahan saat verifikasi password:', error);
    return { success: false, message: 'Terjadi kesalahan saat login' };
  }
};

// Fungsi untuk logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Kesalahan saat logout:', err);
    }
    res.redirect('/login');
  });
};

module.exports = {
  isAuthenticated,
  isAuthenticatedApi,
  isNotAuthenticated,
  login,
  logout
};