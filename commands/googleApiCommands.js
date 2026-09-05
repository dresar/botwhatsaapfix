const { MessageMedia } = require('whatsapp-web.js');
const driveHandler = require('../handlers/driveHandler');
const docsHandler = require('../handlers/docsHandler');
const calendarHandler = require('../handlers/calendarHandler');
const tasksHandler = require('../handlers/tasksHandler');
const config = require('../config');

/**
 * Mendaftarkan semua perintah Google API
 * @param {object} client - Klien WhatsApp
 * @param {object} commandRegistry - Registry perintah
 */
function registerGoogleApiCommands(client, commandRegistry) {
  // Google Drive Commands
  if (config.features.enableDrive) {
    commandRegistry.register({
      name: 'drive',
      description: 'Menampilkan bantuan untuk perintah Google Drive',
      execute: async (message, args) => {
        const helpText = `🗄️ *Perintah Google Drive*\n\n` +
                       `!drive list - Menampilkan daftar gambar yang disimpan di Drive\n` +
                       `!drive save - Menyimpan gambar yang dikirim ke Drive\n` +
                       `!drive status - Memeriksa status koneksi Google Drive`;
        
        await message.reply(helpText);
      }
    });
    
    commandRegistry.register({
      name: 'drive list',
      description: 'Menampilkan daftar gambar yang disimpan di Google Drive',
      execute: async (message, args) => {
        await driveHandler.listImagesFromDrive(message);
      }
    });
    
    commandRegistry.register({
      name: 'drive save',
      description: 'Menyimpan gambar yang dikirim ke Google Drive',
      execute: async (message, args) => {
        if (message.hasMedia) {
          const media = await message.downloadMedia();
          await driveHandler.saveImageToDrive(message, media);
        } else {
          await message.reply('❌ Silakan kirim gambar yang ingin disimpan ke Google Drive.');
        }
      }
    });
    
    commandRegistry.register({
      name: 'drive status',
      description: 'Memeriksa status koneksi Google Drive',
      execute: async (message, args) => {
        try {
          if (!config.features.enableDrive) {
            await message.reply('❌ Fitur Google Drive tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
            return;
          }
          
          const initialized = driveHandler.initGoogleDrive();
          
          if (initialized) {
            await message.reply('✅ Koneksi Google Drive berfungsi dengan baik.');
          } else {
            await message.reply('❌ Koneksi Google Drive tidak berfungsi. Periksa konfigurasi API.');
          }
        } catch (error) {
          console.error('Error saat memeriksa status Google Drive:', error);
          await message.reply('❌ Terjadi kesalahan saat memeriksa status Google Drive.');
        }
      }
    });
  }
  
  // Google Docs Commands
  if (config.features.enableDocs) {
    commandRegistry.register({
      name: 'docs',
      description: 'Menampilkan bantuan untuk perintah Google Docs',
      execute: async (message, args) => {
        const helpText = `📄 *Perintah Google Docs*\n\n` +
                       `!docs create [judul] - Membuat dokumen baru\n` +
                       `!docs get [id] - Mendapatkan konten dokumen\n` +
                       `!docs append [id] [teks] - Menambahkan teks ke dokumen\n` +
                       `!docs search [kata kunci] - Mencari dokumen berdasarkan kata kunci`;
        
        await message.reply(helpText);
      }
    });
    
    commandRegistry.register({
      name: 'docs create',
      description: 'Membuat dokumen baru di Google Docs',
      execute: async (message, args) => {
        if (args.length < 1) {
          await message.reply('❌ Format: !docs create [judul]');
          return;
        }
        
        const title = args.join(' ');
        await docsHandler.createDocument(message, title);
      }
    });
    
    commandRegistry.register({
      name: 'docs get',
      description: 'Mendapatkan konten dokumen dari Google Docs',
      execute: async (message, args) => {
        if (args.length < 1) {
          await message.reply('❌ Format: !docs get [id]');
          return;
        }
        
        const documentId = args[0];
        await docsHandler.getDocumentContent(message, documentId);
      }
    });
    
    commandRegistry.register({
      name: 'docs append',
      description: 'Menambahkan teks ke dokumen Google Docs',
      execute: async (message, args) => {
        if (args.length < 2) {
          await message.reply('❌ Format: !docs append [id] [teks]');
          return;
        }
        
        const documentId = args[0];
        const text = args.slice(1).join(' ');
        await docsHandler.appendToDocument(message, documentId, text);
      }
    });
    
    commandRegistry.register({
      name: 'docs search',
      description: 'Mencari dokumen berdasarkan kata kunci',
      execute: async (message, args) => {
        if (args.length < 1) {
          await message.reply('❌ Format: !docs search [kata kunci]');
          return;
        }
        
        const query = args.join(' ');
        await docsHandler.searchDocuments(message, query);
      }
    });
  }
  
  // Google Calendar Commands
  if (config.features.enableCalendar) {
    commandRegistry.register({
      name: 'calendar',
      description: 'Menampilkan bantuan untuk perintah Google Calendar',
      execute: async (message, args) => {
        const helpText = `📅 *Perintah Google Calendar*\n\n` +
                       `!calendar list - Menampilkan daftar kalender\n` +
                       `!calendar events - Menampilkan daftar acara mendatang\n` +
                       `!calendar create - Membuat acara baru (gunakan format yang benar)`;
        
        await message.reply(helpText);
      }
    });
    
    commandRegistry.register({
      name: 'calendar list',
      description: 'Menampilkan daftar kalender',
      execute: async (message, args) => {
        await calendarHandler.listCalendars(message);
      }
    });
    
    commandRegistry.register({
      name: 'calendar events',
      description: 'Menampilkan daftar acara mendatang',
      execute: async (message, args) => {
        let calendarId = 'primary';
        let days = 7;
        
        if (args.length >= 1) {
          // Jika argumen pertama adalah angka, gunakan sebagai jumlah hari
          if (!isNaN(args[0])) {
            days = parseInt(args[0]);
          } else {
            // Jika bukan angka, gunakan sebagai ID kalender
            calendarId = args[0];
            
            // Jika ada argumen kedua dan itu angka, gunakan sebagai jumlah hari
            if (args.length >= 2 && !isNaN(args[1])) {
              days = parseInt(args[1]);
            }
          }
        }
        
        const timeMin = new Date();
        const timeMax = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        
        await calendarHandler.listEvents(message, calendarId, timeMin, timeMax);
      }
    });
    
    commandRegistry.register({
      name: 'calendar create',
      description: 'Membuat acara baru di Google Calendar',
      execute: async (message, args) => {
        // Format: !calendar create [judul]|[deskripsi]|[lokasi]|[tanggal mulai]|[waktu mulai]|[tanggal selesai]|[waktu selesai]
        // Contoh: !calendar create Rapat Tim|Membahas proyek baru|Kantor|2023-07-01|14:00|2023-07-01|16:00
        
        if (args.length < 1) {
          await message.reply(
            '❌ Format: !calendar create [judul]|[deskripsi]|[lokasi]|[tanggal mulai]|[waktu mulai]|[tanggal selesai]|[waktu selesai]\n\n' +
            'Contoh: !calendar create Rapat Tim|Membahas proyek baru|Kantor|2023-07-01|14:00|2023-07-01|16:00'
          );
          return;
        }
        
        const eventData = args.join(' ').split('|');
        
        if (eventData.length < 7) {
          await message.reply(
            '❌ Format tidak lengkap. Gunakan format:\n' +
            '!calendar create [judul]|[deskripsi]|[lokasi]|[tanggal mulai]|[waktu mulai]|[tanggal selesai]|[waktu selesai]'
          );
          return;
        }
        
        const [summary, description, location, startDate, startTime, endDate, endTime] = eventData;
        
        // Parsing tanggal dan waktu
        try {
          const startDateTime = new Date(`${startDate}T${startTime}:00`);
          const endDateTime = new Date(`${endDate}T${endTime}:00`);
          
          if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            throw new Error('Format tanggal atau waktu tidak valid');
          }
          
          await calendarHandler.createEvent(
            message, 'primary', summary, description, location, startDateTime, endDateTime
          );
        } catch (error) {
          console.error('Error saat parsing tanggal acara:', error);
          await message.reply(
            '❌ Format tanggal atau waktu tidak valid. Gunakan format YYYY-MM-DD untuk tanggal dan HH:MM untuk waktu.\n' +
            'Contoh: 2023-07-01 untuk tanggal dan 14:00 untuk waktu.'
          );
        }
      }
    });
  }
  
  // Google Tasks Commands
  if (config.features.enableTasks) {
    commandRegistry.register({
      name: 'tasks',
      description: 'Menampilkan bantuan untuk perintah Google Tasks',
      execute: async (message, args) => {
        const helpText = `📋 *Perintah Google Tasks*\n\n` +
                       `!tasks lists - Menampilkan daftar task list\n` +
                       `!tasks create-list [judul] - Membuat task list baru\n` +
                       `!tasks list [id] - Menampilkan daftar tugas dalam task list\n` +
                       `!tasks add [id] [judul] - Menambahkan tugas baru ke task list\n` +
                       `!tasks complete [task-list-id] [task-id] - Menandai tugas sebagai selesai`;
        
        await message.reply(helpText);
      }
    });
    
    commandRegistry.register({
      name: 'tasks lists',
      description: 'Menampilkan daftar task list',
      execute: async (message, args) => {
        await tasksHandler.listTaskLists(message);
      }
    });
    
    commandRegistry.register({
      name: 'tasks create-list',
      description: 'Membuat task list baru',
      execute: async (message, args) => {
        if (args.length < 1) {
          await message.reply('❌ Format: !tasks create-list [judul]');
          return;
        }
        
        const title = args.join(' ');
        await tasksHandler.createTaskList(message, title);
      }
    });
    
    commandRegistry.register({
      name: 'tasks list',
      description: 'Menampilkan daftar tugas dalam task list',
      execute: async (message, args) => {
        if (args.length < 1) {
          await message.reply('❌ Format: !tasks list [id]');
          return;
        }
        
        const taskListId = args[0];
        const showCompleted = args.length > 1 && args[1].toLowerCase() === 'all';
        await tasksHandler.listTasks(message, taskListId, showCompleted);
      }
    });
    
    commandRegistry.register({
      name: 'tasks add',
      description: 'Menambahkan tugas baru ke task list',
      execute: async (message, args) => {
        if (args.length < 2) {
          await message.reply('❌ Format: !tasks add [id] [judul] | [catatan] | [tenggat waktu]');
          return;
        }
        
        const taskListId = args[0];
        const taskData = args.slice(1).join(' ').split('|');
        
        const title = taskData[0].trim();
        const notes = taskData.length > 1 ? taskData[1].trim() : '';
        let dueDate = null;
        
        if (taskData.length > 2 && taskData[2].trim()) {
          try {
            dueDate = new Date(taskData[2].trim());
            if (isNaN(dueDate.getTime())) {
              throw new Error('Format tanggal tidak valid');
            }
          } catch (error) {
            await message.reply('❌ Format tanggal tidak valid. Gunakan format YYYY-MM-DD.');
            return;
          }
        }
        
        await tasksHandler.createTask(message, taskListId, title, notes, dueDate);
      }
    });
    
    commandRegistry.register({
      name: 'tasks complete',
      description: 'Menandai tugas sebagai selesai',
      execute: async (message, args) => {
        if (args.length < 2) {
          await message.reply('❌ Format: !tasks complete [task-list-id] [task-id]');
          return;
        }
        
        const taskListId = args[0];
        const taskId = args[1];
        await tasksHandler.completeTask(message, taskListId, taskId);
      }
    });
  }
}

module.exports = registerGoogleApiCommands;