const { google } = require('googleapis');
const fs = require('fs-extra');
const config = require('./config');
const { saveKeepNote, updateKeepNoteInfo } = require('./database');

// Variabel untuk menyimpan instance OAuth2 client
let oAuth2Client = null;

// Nama tasklist untuk menyimpan catatan WhatsApp
const TASKLIST_NAME = 'WhatsApp Notes';
let tasklistId = null;

/**
 * Inisialisasi Google Tasks API (sebagai alternatif untuk Google Keep)
 * @returns {boolean} - Status inisialisasi
 */
async function initKeepAPI() {
  try {
    if (!config.features.enableKeep) {
      console.log('Fitur Google Keep tidak diaktifkan.');
      return false;
    }

    // Periksa apakah kredensial Google API tersedia
    if (!config.google.clientId || !config.google.clientSecret || !config.google.refreshToken) {
      console.error('Kredensial Google API tidak lengkap. Periksa file .env');
      return false;
    }

    // Buat OAuth2 client
    oAuth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    // Set refresh token
    oAuth2Client.setCredentials({
      refresh_token: config.google.refreshToken
    });

    // Buat instance Tasks API
    const tasks = google.tasks({ version: 'v1', auth: oAuth2Client });

    // Dapatkan atau buat tasklist untuk WhatsApp Notes
    const tasklistsResponse = await tasks.tasklists.list();
    const tasklists = tasklistsResponse.data.items || [];

    // Cari tasklist yang sudah ada
    const existingTasklist = tasklists.find(list => list.title === TASKLIST_NAME);
    if (existingTasklist) {
      tasklistId = existingTasklist.id;
    } else {
      // Buat tasklist baru jika belum ada
      const newTasklist = await tasks.tasklists.insert({
        requestBody: {
          title: TASKLIST_NAME
        }
      });
      tasklistId = newTasklist.data.id;
    }

    console.log('Google Tasks API berhasil diinisialisasi sebagai alternatif Google Keep.');
    return true;
  } catch (error) {
    console.error('Error saat menginisialisasi Google Tasks API:', error);
    return false;
  }
}

/**
 * Membuat catatan di Google Tasks (sebagai alternatif Google Keep)
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} title - Judul catatan
 * @param {string} content - Isi catatan
 * @returns {Promise<object>} - Informasi catatan yang dibuat
 */
async function createNote(message, title, content) {
  try {
    if (!config.features.enableKeep) {
      return { success: false, message: "Fitur Google Keep tidak diaktifkan. Silakan aktifkan di file konfigurasi." };
    }

    if (!oAuth2Client || !tasklistId) {
      const initialized = await initKeepAPI();
      if (!initialized) {
        return { success: false, message: "Gagal menginisialisasi Google Tasks API. Periksa kredensial di file .env" };
      }
    }

    // Kirim pesan sedang mengetik
    const chat = await message.getChat();
    chat.sendStateTyping();

    // Buat instance Tasks API
    const tasks = google.tasks({ version: 'v1', auth: oAuth2Client });

    // Buat task baru (sebagai catatan)
    const taskResponse = await tasks.tasks.insert({
      tasklist: tasklistId,
      requestBody: {
        title: title,
        notes: content,
        due: new Date().toISOString()
      }
    });

    // Simpan catatan ke database
    const sender = message.author || message.from;
    const chatId = message.from;
    const noteId = await saveKeepNote(
      title,
      content,
      sender,
      taskResponse.data.id,
      `https://tasks.google.com/`
    );

    return {
      success: true,
      message: "Catatan berhasil dibuat di Google Tasks",
      noteId: noteId,
      taskId: taskResponse.data.id,
      title: title,
      content: content
    };
  } catch (error) {
    console.error('Error saat membuat catatan di Google Tasks:', error);
    return { 
      success: false, 
      message: `Terjadi kesalahan saat membuat catatan: ${error.message}` 
    };
  }
}

/**
 * Mendapatkan daftar catatan dari Google Tasks
 * @param {object} message - Objek pesan WhatsApp
 * @param {number} limit - Jumlah maksimal catatan yang ditampilkan
 * @returns {Promise<object>} - Daftar catatan
 */
async function listNotes(message, limit = 10) {
  try {
    if (!config.features.enableKeep) {
      return { success: false, message: "Fitur Google Keep tidak diaktifkan. Silakan aktifkan di file konfigurasi." };
    }

    if (!oAuth2Client || !tasklistId) {
      const initialized = await initKeepAPI();
      if (!initialized) {
        return { success: false, message: "Gagal menginisialisasi Google Tasks API. Periksa kredensial di file .env" };
      }
    }

    // Kirim pesan sedang mengetik
    const chat = await message.getChat();
    chat.sendStateTyping();

    // Buat instance Tasks API
    const tasks = google.tasks({ version: 'v1', auth: oAuth2Client });

    // Dapatkan daftar task (catatan)
    const tasksResponse = await tasks.tasks.list({
      tasklist: tasklistId,
      maxResults: limit
    });

    const notes = tasksResponse.data.items || [];
    if (notes.length === 0) {
      return { success: true, message: "Tidak ada catatan yang ditemukan", notes: [] };
    }

    // Format catatan untuk ditampilkan
    const formattedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.notes || '(Tidak ada isi)',
      updated: note.updated
    }));

    return {
      success: true,
      message: `Ditemukan ${notes.length} catatan:`,
      notes: formattedNotes
    };
  } catch (error) {
    console.error('Error saat mendapatkan daftar catatan dari Google Tasks:', error);
    return { 
      success: false, 
      message: `Terjadi kesalahan saat mendapatkan daftar catatan: ${error.message}` 
    };
  }
}

/**
 * Menghapus catatan dari Google Tasks
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} taskId - ID task di Google Tasks
 * @returns {Promise<object>} - Status penghapusan
 */
async function deleteNote(message, taskId) {
  try {
    if (!config.features.enableKeep) {
      return { success: false, message: "Fitur Google Keep tidak diaktifkan. Silakan aktifkan di file konfigurasi." };
    }

    if (!oAuth2Client || !tasklistId) {
      const initialized = await initKeepAPI();
      if (!initialized) {
        return { success: false, message: "Gagal menginisialisasi Google Tasks API. Periksa kredensial di file .env" };
      }
    }

    if (!taskId) {
      return { success: false, message: "ID catatan tidak valid." };
    }

    // Kirim pesan sedang mengetik
    const chat = await message.getChat();
    chat.sendStateTyping();

    // Buat instance Tasks API
    const tasks = google.tasks({ version: 'v1', auth: oAuth2Client });

    // Hapus task (catatan) dari Google Tasks
    await tasks.tasks.delete({
      tasklist: tasklistId,
      task: taskId
    });

    return {
      success: true,
      message: "Catatan berhasil dihapus",
      taskId: taskId
    };
  } catch (error) {
    console.error('Error saat menghapus catatan dari Google Tasks:', error);
    
    // Periksa jika error karena catatan tidak ditemukan
    if (error.code === 404) {
      return { 
        success: false, 
        message: "Catatan tidak ditemukan. Mungkin sudah dihapus sebelumnya." 
      };
    }
    
    return { 
      success: false, 
      message: `Terjadi kesalahan saat menghapus catatan: ${error.message}` 
    };
  }
}

module.exports = {
  initKeepAPI,
  createNote,
  listNotes,
  deleteNote
};