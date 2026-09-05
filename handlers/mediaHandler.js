const fs = require('fs-extra');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const config = require('../config');
const { analyzeImage } = require('./aiHandler');

// Direktori untuk menyimpan file
const TEMP_DIR = path.join(__dirname, '../temp');
const STICKERS_DIR = config.storage.stickersDir;

/**
 * Membuat stiker dari gambar
 */
async function createSticker(message) {
  try {
    // Periksa apakah pesan memiliki media
    if (!message.hasMedia) {
      await message.reply('⚠️ Silakan lampirkan gambar yang ingin dijadikan stiker!');
      return;
    }

    // Mengirim pesan sedang memproses
    await message.reply('⏳ Sedang membuat stiker...');

    // Download media
    const media = await message.downloadMedia();
    if (!media || !media.mimetype.startsWith('image/')) {
      await message.reply('❌ File yang dikirim bukan gambar. Silakan kirim gambar.');
      return;
    }

    // Buat stiker
    const sticker = new MessageMedia(media.mimetype, media.data, 'sticker.webp');
    await message.reply(sticker, message.from, { sendMediaAsSticker: true });
    console.log('[LOG] Sticker created successfully');
    
  } catch (error) {
    console.error('Error saat membuat stiker:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat stiker. Silakan coba lagi nanti.');
  }
}

/**
 * Menganalisis gambar dengan AI (simplified)
 */
async function handleImageAnalysis(message, prompt) {
  try {
    if (!message.hasMedia) {
      await message.reply('⚠️ Silakan lampirkan gambar yang ingin dianalisis!');
      return;
    }

    // Panggil fungsi analyzeImage dari aiHandler
    await analyzeImage(message, prompt);
    
  } catch (error) {
    console.error('Error saat menganalisis gambar:', error);
    await message.reply('❌ Terjadi kesalahan saat menganalisis gambar. Silakan coba lagi nanti.');
  }
}

/**
 * Menyimpan gambar ke Google Drive
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} folderName - Nama folder utama di Drive
 * @param {string} subFolderName - Nama subfolder di dalam folder utama (opsional)
 */
async function handleSaveImageToDrive(message, folderName = 'WhatsApp Images', subFolderName = '') {
  try {
    if (!config.features.enableDrive) {
      await message.reply('❌ Fitur Google Drive tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return;
    }

    if (!message.hasMedia) {
      await message.reply('⚠️ Silakan lampirkan gambar yang ingin disimpan ke Drive!');
      return;
    }

    // Periksa apakah ada argumen untuk folder dari pesan
    const msgParts = message.body.split(' ');
    if (msgParts.length > 1) {
      // Format: !simpan_gambar [folder] [subfolder]
      folderName = msgParts[1] || folderName;
      if (msgParts.length > 2) {
        subFolderName = msgParts[2] || subFolderName;
      }
    }

    // Mengirim pesan sedang memproses
    await message.reply('⏳ Sedang menyimpan gambar ke Google Drive...');

    // Download media
    const media = await message.downloadMedia();
    if (!media || !media.mimetype.startsWith('image/')) {
      await message.reply('❌ File yang dikirim bukan gambar. Silakan kirim gambar.');
      return;
    }

    // Simpan gambar sementara ke file lokal
    const timestamp = new Date().getTime();
    const fileExt = media.mimetype.split('/')[1];
    const fileName = `image_${timestamp}.${fileExt}`;
    const filePath = path.join(TEMP_DIR, fileName);
    
    // Pastikan direktori temp ada
    await fs.ensureDir(TEMP_DIR);
    
    // Tulis file
    await fs.writeFile(filePath, Buffer.from(media.data, 'base64'));
    
    // Import driveHandler dari root folder
    const driveHandler = require('../driveHandler');
    
    // Upload ke Google Drive dengan subfolder
    const fileId = await driveHandler.uploadFile(filePath, fileName, folderName, media.mimetype, subFolderName);
    
    if (fileId) {
      const folderPath = subFolderName ? `${folderName}/${subFolderName}` : folderName;
      await message.reply(`✅ Gambar berhasil disimpan ke Google Drive!\nFolder: ${folderPath}\nNama File: ${fileName}`);
      console.log(`[LOG] Image saved to Drive: ${fileName} in folder ${folderPath}`);
    } else {
      await message.reply('❌ Gagal menyimpan gambar ke Google Drive.');
    }
    
    // Hapus file sementara
    await fs.remove(filePath);
    
  } catch (error) {
    console.error('Error saat menyimpan gambar ke Drive:', error);
    await message.reply(`❌ Terjadi kesalahan saat menyimpan gambar ke Drive: ${error.message}`);
  }
}

/**
 * Mengekstrak teks dari gambar menggunakan Gemini Vision
 */
async function extractTextFromImage(message) {
  try {
    if (!config.features.enableAI) {
      await message.reply('❌ Fitur AI tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return;
    }

    if (!config.ai.geminiApiKey) {
      await message.reply('❌ API Key Gemini tidak ditemukan. Hubungi admin untuk mengaturnya.');
      return;
    }

    if (!message.hasMedia) {
      await message.reply('⚠️ Silakan lampirkan gambar yang berisi teks!');
      return;
    }

    // Mengirim pesan sedang memproses
    await message.reply('🔍 Sedang mengekstrak teks dari gambar...');

    // Download media
    const media = await message.downloadMedia();
    if (!media || !media.mimetype.startsWith('image/')) {
      await message.reply('❌ File yang dikirim bukan gambar. Silakan kirim gambar.');
      return;
    }

    // Gunakan Gemini Vision untuk ekstraksi teks dengan prompt khusus
    const prompt = 'Ekstrak semua teks yang terlihat dalam gambar ini. Berikan hanya teks yang diekstrak tanpa penjelasan tambahan. Jika tidak ada teks yang terlihat, katakan "Tidak ada teks yang terdeteksi dalam gambar."';
    
    // Panggil fungsi analyzeImage dari aiHandler dengan prompt khusus
    await analyzeImage(message, prompt);
    console.log('[LOG] Text extraction completed');
    
  } catch (error) {
    console.error('Error saat mengekstrak teks dari gambar:', error);
    await message.reply('❌ Terjadi kesalahan saat mengekstrak teks. Silakan coba lagi nanti.');
  }
}

module.exports = {
  createSticker,
  handleImageAnalysis,
  handleSaveImageToDrive,
  extractTextFromImage
};