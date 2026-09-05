// Gunakan fetch API global
const fetch = global.fetch;
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { MessageMedia } = require('whatsapp-web.js');

/**
 * Menyingkat URL menggunakan layanan TinyURL
 * @param {Object} message - Objek pesan WhatsApp
 * @param {String} longUrl - URL panjang yang akan disingkat
 */
async function shortenUrl(message, longUrl) {
  try {
    if (!longUrl) {
      await message.reply(`
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  ⚠️ *FORMAT SALAH*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Gunakan: !singkat_url [url]
Contoh: !singkat_url https://example.com/halaman-dengan-url-yang-sangat-panjang`);
      return;
    }

    // Validasi URL
    if (!isValidUrl(longUrl)) {
      await message.reply('❌ URL tidak valid. Pastikan URL dimulai dengan http:// atau https://');
      return;
    }

    // Menggunakan TinyURL API untuk menyingkat URL
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    const shortUrl = await response.text();

    await message.reply(`
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🔗 *URL DISINGKAT*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

*URL Asli:*
${longUrl}

*URL Singkat:*
${shortUrl}`);
  } catch (error) {
    console.error('Error saat menyingkat URL:', error);
    await message.reply('❌ Terjadi kesalahan saat menyingkat URL. Silakan coba lagi nanti.');
  }
}

/**
 * Membuat QR Code dari URL atau teks
 * @param {Object} message - Objek pesan WhatsApp
 * @param {String} content - URL atau teks yang akan dijadikan QR Code
 */
async function generateQRCode(message, content) {
  try {
    if (!content) {
      await message.reply(`
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  ⚠️ *FORMAT SALAH*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Gunakan: !qrcode [url atau teks]
Contoh: !qrcode https://example.com atau !qrcode Halo Dunia`);
      return;
    }

    // Membuat direktori temp jika belum ada
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Membuat nama file unik untuk QR Code
    const qrCodeFilePath = path.join(tempDir, `qrcode-${Date.now()}.png`);

    // Membuat QR Code
    await QRCode.toFile(qrCodeFilePath, content, {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 500,
      margin: 1
    });

    // Mengirim QR Code
    const media = MessageMedia.fromFilePath(qrCodeFilePath);
    await message.reply(media, null, { caption: `QR Code untuk: ${content}` });

    // Menghapus file QR Code setelah dikirim
    setTimeout(() => {
      try {
        fs.unlinkSync(qrCodeFilePath);
      } catch (err) {
        console.error('Error saat menghapus file QR Code:', err);
      }
    }, 5000);
  } catch (error) {
    console.error('Error saat membuat QR Code:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat QR Code. Silakan coba lagi nanti.');
  }
}

/**
 * Validasi URL
 * @param {String} url - URL yang akan divalidasi
 * @returns {Boolean} - True jika URL valid, false jika tidak
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  shortenUrl,
  generateQRCode
};