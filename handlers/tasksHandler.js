const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// Inisialisasi Google Tasks API
let tasks;

/**
 * Inisialisasi Google Tasks API
 * @returns {boolean} Status inisialisasi
 */
function initGoogleTasks() {
  if (!config.google.clientId || !config.google.clientSecret || !config.google.refreshToken) {
    console.warn('Konfigurasi Google Tasks tidak lengkap. Fitur Tasks tidak akan berfungsi.');
    return false;
  }
  
  try {
    const oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
    
    oauth2Client.setCredentials({
      refresh_token: config.google.refreshToken
    });
    
    tasks = google.tasks({
      version: 'v1',
      auth: oauth2Client
    });
    
    return true;
  } catch (error) {
    console.error('Error saat menginisialisasi Google Tasks API:', error);
    return false;
  }
}

/**
 * Mendapatkan daftar task list pengguna
 * @param {object} message - Objek pesan WhatsApp
 * @returns {Promise<object>} Daftar task list
 */
async function listTaskLists(message) {
  try {
    if (!config.features.enableTasks) {
      await message.reply('❌ Fitur Google Tasks tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Tasks jika belum
    if (!tasks) {
      const initialized = initGoogleTasks();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Tasks tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang mengambil daftar task list...');
    
    // Ambil daftar task list
    const response = await tasks.tasklists.list({
      maxResults: 100
    });
    
    const taskLists = response.data.items;
    
    if (!taskLists || taskLists.length === 0) {
      await message.reply('❌ Tidak ada task list yang ditemukan.');
      return { success: true, taskLists: [] };
    }
    
    // Format respons
    let taskListText = '📋 *Daftar Task List*\n\n';
    
    taskLists.forEach((taskList, index) => {
      taskListText += `${index + 1}. *${taskList.title}*\n`;
      taskListText += `   ID: ${taskList.id}\n\n`;
    });
    
    await message.reply(taskListText);
    
    return {
      success: true,
      taskLists: taskLists
    };
  } catch (error) {
    console.error('Error saat mengambil daftar task list:', error);
    await message.reply('❌ Terjadi kesalahan saat mengambil daftar task list. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

/**
 * Membuat task list baru
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} title - Judul task list
 * @returns {Promise<object>} Informasi task list yang dibuat
 */
async function createTaskList(message, title) {
  try {
    if (!config.features.enableTasks) {
      await message.reply('❌ Fitur Google Tasks tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Tasks jika belum
    if (!tasks) {
      const initialized = initGoogleTasks();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Tasks tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang membuat task list baru...');
    
    // Buat task list baru
    const response = await tasks.tasklists.insert({
      requestBody: {
        title: title
      }
    });
    
    // Kirim respons ke pengguna
    await message.reply(
      `✅ Task list berhasil dibuat!\n\n` +
      `📝 *Judul:* ${response.data.title}\n` +
      `🆔 *ID:* ${response.data.id}`
    );
    
    return {
      success: true,
      taskListId: response.data.id,
      title: response.data.title
    };
  } catch (error) {
    console.error('Error saat membuat task list:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat task list. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

/**
 * Mendapatkan daftar tugas dari task list
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} taskListId - ID task list
 * @param {boolean} showCompleted - Menampilkan tugas yang sudah selesai
 * @returns {Promise<object>} Daftar tugas
 */
async function listTasks(message, taskListId, showCompleted = false) {
  try {
    if (!config.features.enableTasks) {
      await message.reply('❌ Fitur Google Tasks tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Tasks jika belum
    if (!tasks) {
      const initialized = initGoogleTasks();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Tasks tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang mengambil daftar tugas...');
    
    // Ambil daftar tugas
    const response = await tasks.tasks.list({
      tasklist: taskListId,
      showCompleted: showCompleted,
      maxResults: 100
    });
    
    const taskItems = response.data.items;
    
    if (!taskItems || taskItems.length === 0) {
      await message.reply('❌ Tidak ada tugas yang ditemukan dalam task list ini.');
      return { success: true, tasks: [] };
    }
    
    // Format respons
    let taskText = '📋 *Daftar Tugas*\n\n';
    
    taskItems.forEach((task, index) => {
      const status = task.status === 'completed' ? '✅' : '⬜';
      const dueDate = task.due ? new Date(task.due).toLocaleDateString('id-ID') : '-';
      
      taskText += `${index + 1}. ${status} *${task.title}*\n`;
      if (task.notes) taskText += `   📝 ${task.notes}\n`;
      taskText += `   📅 Tenggat: ${dueDate}\n`;
      taskText += `   🆔 ID: ${task.id}\n\n`;
    });
    
    await message.reply(taskText);
    
    return {
      success: true,
      tasks: taskItems
    };
  } catch (error) {
    console.error('Error saat mengambil daftar tugas:', error);
    await message.reply('❌ Terjadi kesalahan saat mengambil daftar tugas. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

/**
 * Membuat tugas baru
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} taskListId - ID task list
 * @param {string} title - Judul tugas
 * @param {string} notes - Catatan tugas (opsional)
 * @param {Date} dueDate - Tenggat waktu (opsional)
 * @returns {Promise<object>} Informasi tugas yang dibuat
 */
async function createTask(message, taskListId, title, notes = '', dueDate = null) {
  try {
    if (!config.features.enableTasks) {
      await message.reply('❌ Fitur Google Tasks tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Tasks jika belum
    if (!tasks) {
      const initialized = initGoogleTasks();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Tasks tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang membuat tugas baru...');
    
    // Siapkan data tugas
    const taskData = {
      title: title,
      notes: notes
    };
    
    // Tambahkan tenggat waktu jika ada
    if (dueDate) {
      // Format tanggal sesuai RFC 3339
      const formattedDate = dueDate.toISOString();
      taskData.due = formattedDate;
    }
    
    // Buat tugas baru
    const response = await tasks.tasks.insert({
      tasklist: taskListId,
      requestBody: taskData
    });
    
    // Format tanggal untuk respons
    const dueDateFormatted = response.data.due 
      ? new Date(response.data.due).toLocaleDateString('id-ID') 
      : 'Tidak ada';
    
    // Kirim respons ke pengguna
    await message.reply(
      `✅ Tugas berhasil dibuat!\n\n` +
      `📝 *Judul:* ${response.data.title}\n` +
      `📝 *Catatan:* ${response.data.notes || '-'}\n` +
      `📅 *Tenggat:* ${dueDateFormatted}\n` +
      `🆔 *ID:* ${response.data.id}`
    );
    
    return {
      success: true,
      taskId: response.data.id,
      title: response.data.title
    };
  } catch (error) {
    console.error('Error saat membuat tugas:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat tugas. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

/**
 * Menandai tugas sebagai selesai
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} taskListId - ID task list
 * @param {string} taskId - ID tugas
 * @returns {Promise<object>} Status operasi
 */
async function completeTask(message, taskListId, taskId) {
  try {
    if (!config.features.enableTasks) {
      await message.reply('❌ Fitur Google Tasks tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Tasks jika belum
    if (!tasks) {
      const initialized = initGoogleTasks();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Tasks tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang menandai tugas sebagai selesai...');
    
    // Ambil tugas terlebih dahulu
    const taskResponse = await tasks.tasks.get({
      tasklist: taskListId,
      task: taskId
    });
    
    const task = taskResponse.data;
    
    // Update status tugas menjadi selesai
    task.status = 'completed';
    task.completed = new Date().toISOString();
    
    // Update tugas
    const response = await tasks.tasks.update({
      tasklist: taskListId,
      task: taskId,
      requestBody: task
    });
    
    // Kirim respons ke pengguna
    await message.reply(
      `✅ Tugas berhasil ditandai sebagai selesai!\n\n` +
      `📝 *Judul:* ${response.data.title}\n` +
      `🆔 *ID:* ${response.data.id}`
    );
    
    return {
      success: true,
      taskId: response.data.id,
      title: response.data.title,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error saat menandai tugas sebagai selesai:', error);
    await message.reply('❌ Terjadi kesalahan saat menandai tugas sebagai selesai. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

module.exports = {
  initGoogleTasks,
  listTaskLists,
  createTaskList,
  listTasks,
  createTask,
  completeTask
};