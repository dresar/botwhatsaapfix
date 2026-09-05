const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// Inisialisasi Google Calendar API
let calendar;

/**
 * Inisialisasi Google Calendar API
 * @returns {boolean} Status inisialisasi
 */
function initGoogleCalendar() {
  if (!config.google.clientId || !config.google.clientSecret || !config.google.refreshToken) {
    console.warn('Konfigurasi Google Calendar tidak lengkap. Fitur Calendar tidak akan berfungsi.');
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
    
    calendar = google.calendar({
      version: 'v3',
      auth: oauth2Client
    });
    
    return true;
  } catch (error) {
    console.error('Error saat menginisialisasi Google Calendar API:', error);
    return false;
  }
}

/**
 * Mendapatkan daftar kalender pengguna
 * @param {object} message - Objek pesan WhatsApp
 * @returns {Promise<object>} Daftar kalender
 */
async function listCalendars(message) {
  try {
    if (!config.features.enableCalendar) {
      await message.reply('❌ Fitur Google Calendar tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Calendar jika belum
    if (!calendar) {
      const initialized = initGoogleCalendar();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Calendar tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang mengambil daftar kalender...');
    
    // Ambil daftar kalender
    const response = await calendar.calendarList.list();
    const calendars = response.data.items;
    
    if (calendars.length === 0) {
      await message.reply('❌ Tidak ada kalender yang ditemukan.');
      return { success: true, calendars: [] };
    }
    
    // Format respons
    let calendarList = '📅 *Daftar Kalender*\n\n';
    
    calendars.forEach((cal, index) => {
      calendarList += `${index + 1}. *${cal.summary}*\n`;
      calendarList += `   ID: ${cal.id}\n`;
      calendarList += `   Akses: ${cal.accessRole}\n\n`;
    });
    
    await message.reply(calendarList);
    
    return {
      success: true,
      calendars: calendars
    };
  } catch (error) {
    console.error('Error saat mengambil daftar kalender:', error);
    await message.reply('❌ Terjadi kesalahan saat mengambil daftar kalender. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

/**
 * Membuat acara baru di Google Calendar
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} calendarId - ID kalender (default: 'primary')
 * @param {string} summary - Judul acara
 * @param {string} description - Deskripsi acara
 * @param {string} location - Lokasi acara (opsional)
 * @param {Date} startDateTime - Waktu mulai acara
 * @param {Date} endDateTime - Waktu selesai acara
 * @param {Array} attendees - Daftar email peserta (opsional)
 * @returns {Promise<object>} Informasi acara yang dibuat
 */
async function createEvent(message, calendarId = 'primary', summary, description, location = '', startDateTime, endDateTime, attendees = []) {
  try {
    if (!config.features.enableCalendar) {
      await message.reply('❌ Fitur Google Calendar tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Calendar jika belum
    if (!calendar) {
      const initialized = initGoogleCalendar();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Calendar tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang membuat acara baru di Google Calendar...');
    
    // Format attendees jika ada
    const attendeesList = attendees.map(email => ({ email }));
    
    // Buat acara baru
    const event = {
      summary: summary,
      location: location,
      description: description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Jakarta'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Jakarta'
      },
      attendees: attendeesList,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };
    
    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
      sendUpdates: attendeesList.length > 0 ? 'all' : 'none'
    });
    
    // Format tanggal untuk respons
    const startDate = new Date(response.data.start.dateTime);
    const endDate = new Date(response.data.end.dateTime);
    const formattedStart = startDate.toLocaleString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
    const formattedEnd = endDate.toLocaleString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
    
    // Kirim respons ke pengguna
    await message.reply(
      `✅ Acara berhasil dibuat di Google Calendar!\n\n` +
      `📝 *Judul:* ${response.data.summary}\n` +
      `📅 *Mulai:* ${formattedStart}\n` +
      `⏱️ *Selesai:* ${formattedEnd}\n` +
      `📍 *Lokasi:* ${response.data.location || '-'}\n` +
      `🔗 *Link:* ${response.data.htmlLink}\n\n` +
      `Anda dapat mengakses dan mengedit acara ini melalui link di atas.`
    );
    
    return {
      success: true,
      eventId: response.data.id,
      summary: response.data.summary,
      htmlLink: response.data.htmlLink
    };
  } catch (error) {
    console.error('Error saat membuat acara di Google Calendar:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat acara di Google Calendar. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

/**
 * Mendapatkan daftar acara dari Google Calendar
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} calendarId - ID kalender (default: 'primary')
 * @param {Date} timeMin - Waktu minimum (default: waktu sekarang)
 * @param {Date} timeMax - Waktu maksimum (default: 7 hari dari sekarang)
 * @param {number} maxResults - Jumlah maksimum hasil (default: 10)
 * @returns {Promise<object>} Daftar acara
 */
async function listEvents(message, calendarId = 'primary', timeMin = new Date(), timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxResults = 10) {
  try {
    if (!config.features.enableCalendar) {
      await message.reply('❌ Fitur Google Calendar tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Calendar jika belum
    if (!calendar) {
      const initialized = initGoogleCalendar();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Calendar tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang mengambil daftar acara dari Google Calendar...');
    
    // Ambil daftar acara
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const events = response.data.items;
    
    if (events.length === 0) {
      await message.reply('❌ Tidak ada acara yang ditemukan dalam rentang waktu tersebut.');
      return { success: true, events: [] };
    }
    
    // Format respons
    let eventList = '📅 *Daftar Acara*\n\n';
    
    events.forEach((event, index) => {
      const start = event.start.dateTime || event.start.date;
      const startDate = new Date(start);
      const formattedStart = startDate.toLocaleString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });
      
      eventList += `${index + 1}. *${event.summary}*\n`;
      eventList += `   📅 ${formattedStart}\n`;
      eventList += `   📍 ${event.location || '-'}\n`;
      eventList += `   🔗 ${event.htmlLink}\n\n`;
    });
    
    await message.reply(eventList);
    
    return {
      success: true,
      events: events
    };
  } catch (error) {
    console.error('Error saat mengambil daftar acara dari Google Calendar:', error);
    await message.reply('❌ Terjadi kesalahan saat mengambil daftar acara. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

module.exports = {
  initGoogleCalendar,
  listCalendars,
  createEvent,
  listEvents
};