const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const schedule = require('node-schedule');
const path = require('path');

// Load environment variables
require('./dotenv').config();
const config = require('./config');

// Initialize databases
const db = require('./database');
const groupDb = require('./groupDatabase');

// Import handlers
const taskHandler = require('./handlers/taskHandler');
const fileHandler = require('./handlers/fileHandler');
const adminHandler = require('./handlers/adminHandler');
const mediaHandler = require('./handlers/mediaHandler');
const generalHandler = require('./handlers/generalHandler');
const translationHandler = require('./handlers/translationHandler');
const weatherHandler = require('./handlers/weatherHandler');
const aiHandler = require('./handlers/aiHandler');
const driveHandler = require('./handlers/driveHandler');
const keepHandler = require('./handlers/keepHandler');
const groqHandler = require('./handlers/groqHandler');
const chatMemoryHandler = require('./handlers/chatMemoryHandler');
const wikipediaHandler = require('./handlers/wikipediaHandler');
const gameHandler = require('./handlers/gameHandler');
const makerHandler = require('./handlers/makerHandler');

// Membuat direktori untuk menyimpan file jika belum ada
const dirs = ['./temp', './data', config.storage.uploadsDir, config.storage.stickersDir];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Inisialisasi database
db.initDatabase();

// Inisialisasi direktori database grup jika fitur diaktifkan
if (config.database.enableGroupDatabases) {
  groupDb.initGroupDatabaseDir();
  console.log(`✅ Database per grup diaktifkan di: ${config.database.groupDbDir}`);
}

// Inisialisasi client WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'whatsapp-bot',
    dataPath: path.join(__dirname, '.wwebjs_auth')
  }),
  restartOnAuthFail: true,
  qrTimeoutMs: 60000,
  authTimeoutMs: 60000,
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-web-security',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--unhandled-rejections=strict'
    ],
    ignoreHTTPSErrors: true,
    defaultViewport: null
  }
});

// Menampilkan QR Code untuk login
client.on('qr', (qr) => {
  console.log('\n' + '='.repeat(50));
  console.log('📲 QR CODE DITERIMA! SILAKAN SCAN DENGAN WHATSAPP ANDA!');
  console.log('📲 BUKA WHATSAPP > MENU > PERANGKAT TERTAUT > TAUTKAN PERANGKAT');
  console.log('⚠️ PASTIKAN WHATSAPP ANDA VERSI TERBARU!');
  console.log('⚠️ PASTIKAN KONEKSI INTERNET STABIL!');
  console.log('⚠️ JIKA GAGAL SCAN, RESTART APLIKASI DAN COBA LAGI!');
  console.log('='.repeat(50) + '\n');
  
  // Generate QR code dengan ukuran yang lebih kecil
  qrcode.generate(qr, { small: true });
  
  console.log('\n' + '='.repeat(50));
  console.log('⏳ MENUNGGU SCAN... BOT TIDAK AKAN BERHENTI');
  console.log('🔄 QR CODE AKAN DIPERBARUI SECARA OTOMATIS JIKA KEDALUWARSA');
  console.log('='.repeat(50));
  
  // Simpan QR code ke file untuk memudahkan pemindaian jika terminal tidak jelas
  const fs = require('fs');
  const path = require('path');
  const qrcodejs = require('qrcode');
  const qrPath = path.join(__dirname, 'temp', 'last-qr.png');
  
  // Pastikan direktori temp ada
  if (!fs.existsSync(path.join(__dirname, 'temp'))) {
    fs.mkdirSync(path.join(__dirname, 'temp'), { recursive: true });
  }
  
  // Buat QR code sebagai file gambar dengan ukuran lebih kecil
  qrcodejs.toFile(qrPath, qr, {
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    width: 300,
    margin: 2
  }, (err) => {
    if (err) {
      console.error('Gagal menyimpan QR code ke file:', err);
    } else {
      console.log(`QR code disimpan ke: ${qrPath}`);
      console.log('Anda juga dapat memindai QR code dari file gambar tersebut');
    }
  });
});

// Event ketika client berhasil diautentikasi
client.on('authenticated', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🔐 AUTENTIKASI BERHASIL! Menunggu koneksi...');
  console.log('='.repeat(50) + '\n');
});

// Event ketika client siap
client.on('ready', () => {
  console.log('\n' + '='.repeat(50));
  console.log('✅ CLIENT SIAP! Bot WhatsApp telah terhubung dan siap digunakan!');
  console.log('✅ QR CODE BERHASIL DI-SCAN! BOT AKTIF DAN BERJALAN!');
  console.log('='.repeat(50) + '\n');
  
  // Memuat data tugas dari file jika ada
  taskHandler.loadTasks();
  
  // Inisialisasi Google Drive jika fitur diaktifkan
  if (config.features.enableDrive) {
    driveHandler.initGoogleDrive();
  }
  
  // Inisialisasi Google Keep jika fitur diaktifkan
  if (config.features.enableKeep) {
    keepHandler.initGoogleKeep();
  }
  
  // Menampilkan informasi status bot
  console.log('📱 Bot WhatsApp sedang berjalan...');
  console.log(`🤖 Nama Bot: ${config.bot.name}`);
  console.log('📝 Gunakan Ctrl+C dua kali dalam 5 detik untuk keluar');
  console.log('🕒 ' + new Date().toLocaleString() + '\n');
  
  // Tampilkan status fitur
  console.log('📊 Status Fitur:');
  console.log(`- AI: ${config.features.enableAI ? '✅ Aktif' : '❌ Nonaktif'}`);
  console.log(`- Google Drive: ${config.features.enableDrive ? '✅ Aktif' : '❌ Nonaktif'}`);
  console.log(`- Google Keep: ${config.features.enableKeep ? '✅ Aktif' : '❌ Nonaktif'}`);
  console.log(`- SQLite Logging: ${config.features.enableSQLiteLogging ? '✅ Aktif' : '❌ Nonaktif'}\n`);
});

// Event ketika client terputus
client.on('disconnected', (reason) => {
  console.log('\n' + '='.repeat(50));
  console.log('❌ CLIENT TERPUTUS! Alasan:', reason);
  console.log('🔄 Mencoba menghubungkan kembali...');
  console.log('='.repeat(50) + '\n');
  client.initialize();
});

// Event ketika client menerima pesan
client.on('message', async (message) => {
  try {
    // Simpan pesan ke database jika fitur logging diaktifkan
    if (config.features.enableSQLiteLogging) {
      const chat = await message.getChat();
      const sender = message.author || 'unknown';
      const messageBody = message.body;
      const groupId = chat.id._serialized;
      
      if (config.database.enableGroupDatabases && chat.isGroup) {
        // Simpan pesan ke database grup jika fitur database per grup diaktifkan
        await groupDb.saveChatMessage(groupId, sender, messageBody);
      } else {
        // Simpan ke database utama
        await db.saveChatMessage(groupId, sender, messageBody);
      }
      
      // Menyimpan pesan ke memori lokal untuk konteks chat
      chatMemoryHandler.addMessageToMemory(sender, 'user', messageBody);
    }
    
    // Hanya merespon pesan dari grup
    const chat = await message.getChat();
    if (!chat.isGroup) {
      return;
    }
    
    // Periksa apakah bot dimute di grup ini
    if (config.database.enableGroupDatabases) {
      const isMuted = await groupDb.getGroupSetting(chat.id._serialized, 'muted', 'false');
      if (isMuted === 'true') {
        return; // Bot dimute, abaikan pesan
      }
    } else {
      const isMuted = await adminHandler.isBotMuted(chat.id._serialized);
      if (isMuted) {
        return; // Bot dimute, abaikan pesan
      }
    }
    
    // Periksa apakah pengirim dibanned
    const sender = await message.getContact();
    if (config.database.enableGroupDatabases) {
      const isBanned = await groupDb.isUserBanned(chat.id._serialized, sender.id._serialized);
      if (isBanned) {
        return; // Pengirim dibanned, abaikan pesan
      }
    } else {
      const isBanned = await adminHandler.isUserBanned(sender.id._serialized, chat.id._serialized);
      if (isBanned) {
        return; // Pengirim dibanned, abaikan pesan
      }
    }

    const body = message.body.trim();
    
    // Cek apakah pesan menyebut nama bot (untuk fitur AI tanpa awalan !)
    const botName = config.bot.name.toLowerCase();
    if (!body.startsWith('!') && body.toLowerCase().includes(botName)) {
      // Jika pesan menyebut nama bot, gunakan AI untuk merespons
      const prompt = body.replace(new RegExp(botName, 'i'), '').trim();
      if (prompt) {
        await aiHandler.askGemini(message, prompt);
      }
      return;
    }
    
    // Verifikasi jawaban permainan jika ada
    const isGameAnswer = await gameHandler.verifyGameAnswer(message);
    if (isGameAnswer) {
      return; // Jika ini adalah jawaban permainan yang valid, hentikan pemrosesan lebih lanjut
    }
    
    // Jika pesan tidak dimulai dengan !, abaikan
    if (!body.startsWith('!')) {
      return;
    }

    // Memisahkan perintah dan argumen
    const [command, ...args] = body.slice(1).split(' ');

    // Menangani perintah berdasarkan kategori
    switch (command.toLowerCase()) {
      // Perintah tugas
      case 'tambah_tugas':
      case 'add_tugas':
        await taskHandler.addTask(message, args.join(' '));
        break;
      case 'list_tugas':
        await taskHandler.listTasks(message);
        break;
      case 'ingatkan_tugas':
        await taskHandler.scheduleTaskReminder(message, args);
        break;

      // Perintah pengolahan file
      case 'pdf_to_word':
        await fileHandler.pdfToWord(message);
        break;
      case 'word_to_pdf':
        await fileHandler.wordToPdf(message);
        break;
      case 'image_to_text':
        await fileHandler.imageToText(message);
        break;
      case 'compress_file':
        await fileHandler.compressFile(message);
        break;
      case 'pdf_to_jpg':
        await fileHandler.pdfToJpg(message);
        break;

      // Perintah admin
      case 'kick':
        await adminHandler.kickMember(message, args[0]);
        break;
      case 'broadcast':
        await adminHandler.broadcastMessage(message, args.join(' '));
        break;
      case 'stats':
        await adminHandler.showStats(message);
        break;
      case 'mute':
        await adminHandler.muteBot(message, args[0]);
        break;
      case 'unmute':
        await adminHandler.unmuteBot(message);
        break;
      case 'ban':
        await adminHandler.banMember(message, args[0]);
        break;
      case 'unban':
        await adminHandler.unbanMember(message, args[0]);
        break;

      // Perintah media
      case 'sticker':
        await mediaHandler.createSticker(message);
        break;

      // Perintah umum
      case 'menu':
        await generalHandler.showMenu(message);
        break;
      case 'help':
        await generalHandler.showHelp(message, args[0]);
        break;
      case 'tagall':
        await generalHandler.tagAll(message, args.join(' '));
        break;
      case 'hapus_memori':
        await generalHandler.clearMemory(message);
        break;

      // Perintah tambahan
      case 'translate':
        await translationHandler.translateText(message, args);
        break;
      case 'weather':
        await weatherHandler.getWeather(message, args.join(' '));
        break;
      case 'wikipedia':
        await wikipediaHandler.searchWikipedia(message, args.join(' '));
        break;
        
      // Perintah AI
      case 'gemini':
      case 'ai':
        await aiHandler.askGemini(message, args.join(' '));
        break;
      case 'groq':
      case 'llama':
        await groqHandler.askGroq(message, args.join(' '));
        break;
      case 'gartisan':
        await aiHandler.askAIGartisan(message, args.join(' '));
        break;
      case 'analisis_gambar':
      case 'analyze_image':
        await mediaHandler.handleImageAnalysis(message);
        break;
        
      // Perintah Google Drive
      case 'simpan_gambar':
      case 'save_image':
        // Format: !simpan_gambar [folder] [subfolder]
        await mediaHandler.handleSaveImageToDrive(message, args[0], args[1]);
        break;
      case 'list_gambar':
        // Format: !list_gambar [limit/folder] [subfolder]
        if (args.length > 0) {
          if (!isNaN(args[0])) {
            // Jika argumen pertama adalah angka, itu adalah limit
            await driveHandler.listImagesFromDrive(message, parseInt(args[0]), args[1], args[2]);
          } else {
            // Jika argumen pertama bukan angka, itu adalah nama folder
            await driveHandler.listImagesFromDrive(message, 10, args[0], args[1]);
          }
        } else {
          await driveHandler.listImagesFromDrive(message);
        }
        break;
      case 'hapus_gambar':
        // Format: !hapus_gambar [file_id]
        await driveHandler.deleteImageFromDrive(message, args[0]);
        break;
        
      // Perintah Google Keep
      case 'buat_catatan':
      case 'create_note':
        if (args.length < 2) {
          await message.reply('Format: !buat_catatan [judul] [isi catatan]');
        } else {
          const title = args[0];
          const content = args.slice(1).join(' ');
          await keepHandler.createKeepNote(message, title, content);
        }
        break;
      case 'list_catatan':
        await keepHandler.listKeepNotes(message, args[0] ? parseInt(args[0]) : 10);
        break;
      case 'cari_catatan':
      case 'search_note':
        if (args.length < 1) {
          await message.reply('Format: !cari_catatan [kata kunci]');
        } else {
          await keepHandler.searchKeepNotes(message, args.join(' '));
        }
        break;
      case 'hapus_catatan':
      case 'delete_note':
        if (args.length < 1) {
          await message.reply('Format: !hapus_catatan [id_catatan]');
        } else {
          await keepHandler.deleteKeepNote(message, args[0]);
        }
        break;
      case 'tingkatkan_catatan':
      case 'enhance_note':
        if (args.length < 1) {
          await message.reply('Format: !tingkatkan_catatan [id_catatan]');
        } else {
          await keepHandler.enhanceKeepNote(message, args[0]);
        }
        break;

      // Fitur URL Shortener dan QR Code
      case 'singkat_url':
      case 'short_url':
        const urlShortenerHandler = require('./handlers/urlShortenerHandler');
        await urlShortenerHandler.shortenUrl(message, args.join(' '));
        break;
      case 'qrcode':
        const qrHandler = require('./handlers/urlShortenerHandler');
        await qrHandler.generateQRCode(message, args.join(' '));
        break;
        
      // Fitur Info Gempa
      case 'gempa':
      case 'info_gempa':
        const earthquakeHandler = require('./handlers/earthquakeHandler');
        await earthquakeHandler.getLatestEarthquake(message);
        break;
        
      // Fitur Meme & Lelucon
      case 'meme':
        const memeHandler = require('./handlers/memeHandler');
        await memeHandler.getRandomMeme(message);
        break;
      case 'joke':
      case 'lelucon':
        const jokeHandler = require('./handlers/memeHandler');
        await jokeHandler.getRandomJoke(message);
        break;
      case 'dadjoke':
        const dadJokeHandler = require('./handlers/memeHandler');
        await dadJokeHandler.getDadJoke(message);
        break;
        
      // Fitur Game
      case 'math':
        await gameHandler.mathGame(message);
        break;
      case 'siapakahaku':
        await gameHandler.siapakahAku(message);
        break;
      case 'susunkata':
        await gameHandler.susunKata(message);
        break;
      case 'tebakkata':
        await gameHandler.tebakKata(message);
        break;
      case 'tekateki':
        await gameHandler.tekaTeki(message);
        break;
      case 'asahotak':
        await gameHandler.asahOtak(message);
        break;
      case 'caklontong':
        await gameHandler.cakLontong(message);
        break;
        
      // Fitur Weebs
      case 'randomloli':
        await gameHandler.randomLoli(message);
        break;
      case 'randomselfie':
        await gameHandler.randomSelfie(message);
        break;
      case 'randomwaifu':
        await gameHandler.randomWaifu(message);
        break;
      case 'topanime':
        await gameHandler.topAnime(message);
        break;
      case 'otakudesu':
        await gameHandler.otakudesu(message, args.join(' '));
        break;
        
      // Fitur Maker
      case 'fakengl':
        await makerHandler.fakeNGL(message, args.join(' '));
        break;
      case 'iphonechat':
        await makerHandler.fakeIPhoneChat(message, args.join(' '));
        break;
      case 'namaninja':
        await makerHandler.namaNinja(message, args.join(' '));
        break;
      case 'namapurba':
        await makerHandler.namaPurba(message, args.join(' '));
        break;
      case 'brat':
        await makerHandler.bratText(message, args.join(' '));
        break;
      case 'bratgif':
        await makerHandler.bratGif(message);
        break;
      case 'emojimix':
        await makerHandler.emojiMix(message, args.join(' '));
        break;
      case 's':
      case 'sticker':
        await makerHandler.createSticker(message);
        break;
      case 'smeme':
      case 'stickermeme':
        await makerHandler.createStickerMeme(message, args.join(' '));
        break;
        
      default:
        await message.reply('Perintah tidak dikenali. Ketik !menu untuk melihat daftar perintah.');
    }
  } catch (error) {
    console.error('Error:', error);
    await message.reply('Terjadi kesalahan saat memproses perintah.');
  }
});

// Fungsi untuk menghapus folder auth jika diperlukan
const clearAuthFolder = () => {
  try {
    const authPath = path.join(__dirname, '.wwebjs_auth');
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log('✅ FOLDER AUTH BERHASIL DIHAPUS');
      return true;
    }
  } catch (error) {
    console.error('❌ GAGAL MENGHAPUS FOLDER AUTH:', error);
  }
  return false;
};

// Variabel untuk menghitung kegagalan autentikasi
let authFailureCount = 0;
const MAX_AUTH_FAILURES = 3;

// Menangani error saat inisialisasi
client.on('auth_failure', (error) => {
  console.log('\n' + '='.repeat(50));
  console.error('❌ AUTENTIKASI GAGAL:', error);
  authFailureCount++;
  
  if (authFailureCount >= MAX_AUTH_FAILURES) {
    console.log('⚠️ TERLALU BANYAK KEGAGALAN AUTENTIKASI');
    console.log('🔄 MENGHAPUS DATA AUTENTIKASI DAN MEMULAI ULANG...');
    if (clearAuthFolder()) {
      authFailureCount = 0;
    }
  }
  
  console.log('🔄 MENCOBA MENGINISIALISASI ULANG DALAM 10 DETIK...');
  console.log('⚠️ JIKA TERUS GAGAL, RESTART APLIKASI SECARA MANUAL');
  console.log('='.repeat(50) + '\n');
  
  setTimeout(() => {
    client.initialize();
  }, 10000);
});

// Variabel untuk menghitung kegagalan koneksi
let disconnectCount = 0;
const MAX_DISCONNECTS = 3;
let lastDisconnectTime = 0;

// Menangani error koneksi
client.on('disconnected', (reason) => {
  console.log('\n' + '='.repeat(50));
  console.log('❌ CLIENT TERPUTUS! Alasan:', reason);
  
  const now = Date.now();
  // Reset counter jika disconnected setelah lebih dari 5 menit
  if (now - lastDisconnectTime > 5 * 60 * 1000) {
    disconnectCount = 0;
  }
  
  disconnectCount++;
  lastDisconnectTime = now;
  
  if (disconnectCount >= MAX_DISCONNECTS) {
    console.log('⚠️ TERLALU BANYAK PEMUTUSAN KONEKSI');
    console.log('🔄 MENGHAPUS DATA AUTENTIKASI DAN MEMULAI ULANG...');
    if (clearAuthFolder()) {
      disconnectCount = 0;
    }
  }
  
  console.log('🔄 MENCOBA MENGHUBUNGKAN KEMBALI...');
  console.log('⚠️ JIKA TERUS GAGAL, KETIK "RESET" DI TERMINAL UNTUK MENGHAPUS DATA AUTENTIKASI');
  console.log('='.repeat(50) + '\n');
  
  // Tunggu sebentar sebelum mencoba menginisialisasi ulang
  setTimeout(() => {
    client.initialize();
  }, 5000);
});

// Menangani error umum
client.on('error', (error) => {
  console.log('\n' + '='.repeat(50));
  console.error('❌ ERROR TERDETEKSI:', error);
  console.log('⚠️ PERIKSA KONEKSI INTERNET ANDA');
  console.log('⚠️ PASTIKAN WHATSAPP DI PONSEL ANDA TERBUKA');
  console.log('='.repeat(50) + '\n');
});

// Menangani perubahan status koneksi
client.on('change_state', (state) => {
  console.log('\n' + '='.repeat(50));
  console.log('🔄 STATUS KONEKSI BERUBAH:', state);
  console.log('='.repeat(50) + '\n');
});

// Menangani loading screen
client.on('loading_screen', (percent, message) => {
  console.log(`🔄 LOADING: ${percent}% - ${message}`);
});

// Tampilkan pesan bantuan di awal
console.log('\n' + '='.repeat(50));
console.log('🚀 MEMULAI INISIALISASI WHATSAPP BOT...');
console.log('⏳ MOHON TUNGGU HINGGA QR CODE MUNCUL');
console.log('='.repeat(50));
console.log('📋 PERINTAH TERMINAL YANG TERSEDIA:');
console.log('- RESET: Hapus data autentikasi dan mulai ulang');
console.log('- EXIT/QUIT: Keluar dari aplikasi');
console.log('- HELP: Tampilkan bantuan');
console.log('='.repeat(50) + '\n');

// Inisialisasi client
client.initialize().catch(err => {
  console.log('\n' + '='.repeat(50));
  console.error('❌ ERROR SAAT INISIALISASI:', err);
  console.log('🔄 MENCOBA MENGINISIALISASI ULANG DALAM 10 DETIK...');
  console.log('⚠️ JIKA TERUS GAGAL, KETIK "RESET" DI TERMINAL');
  console.log('='.repeat(50) + '\n');
  setTimeout(() => {
    client.initialize();
  }, 10000);
});

// Menangani input dari terminal
process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
  const input = data.toString().trim().toUpperCase();
  
  if (input === 'RESET') {
    console.log('\n' + '='.repeat(50));
    console.log('🔄 MENGHAPUS DATA AUTENTIKASI BERDASARKAN PERMINTAAN PENGGUNA...');
    if (clearAuthFolder()) {
      console.log('✅ DATA AUTENTIKASI BERHASIL DIHAPUS');
      console.log('🔄 MEMULAI ULANG CLIENT...');
      disconnectCount = 0;
      authFailureCount = 0;
      setTimeout(() => {
        client.initialize();
      }, 2000);
    } else {
      console.log('❌ GAGAL MENGHAPUS DATA AUTENTIKASI');
    }
    console.log('='.repeat(50) + '\n');
  } else if (input === 'EXIT' || input === 'QUIT') {
    console.log('\n' + '='.repeat(50));
    console.log('👋 MENUTUP APLIKASI. SAMPAI JUMPA!');
    console.log('='.repeat(50));
    process.exit(0);
  } else if (input === 'HELP') {
    console.log('\n' + '='.repeat(50));
    console.log('📋 PERINTAH YANG TERSEDIA:');
    console.log('- RESET: Hapus data autentikasi dan mulai ulang');
    console.log('- EXIT/QUIT: Keluar dari aplikasi');
    console.log('- HELP: Tampilkan bantuan ini');
    console.log('='.repeat(50) + '\n');
  }
});

// Menangani SIGINT (Ctrl+C)
let sigintCount = 0;
process.on('SIGINT', () => {
  sigintCount++;
  
  if (sigintCount === 1) {
    console.log('\n' + '='.repeat(50));
    console.log('⚠️ MENEKAN Ctrl+C SEKALI LAGI DALAM 5 DETIK UNTUK KELUAR');
    console.log('💾 MENYIMPAN DATA TUGAS...');
    console.log('='.repeat(50));
    
    // Simpan data tugas sebelum keluar
    taskHandler.saveTasks();
    
    // Reset counter setelah 5 detik
    setTimeout(() => {
      sigintCount = 0;
      console.log('\n' + '='.repeat(50));
      console.log('⏱️ WAKTU HABIS. TEKAN Ctrl+C DUA KALI DALAM 5 DETIK UNTUK KELUAR');
      console.log('='.repeat(50));
    }, 5000);
  } else if (sigintCount === 2) {
    console.log('\n' + '='.repeat(50));
    console.log('👋 MENUTUP APLIKASI. SAMPAI JUMPA!');
    console.log('='.repeat(50));
    process.exit(0);
  }
});