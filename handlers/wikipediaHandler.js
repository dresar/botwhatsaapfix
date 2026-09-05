/**
 * Handler untuk integrasi dengan Wikipedia API
 */

const https = require('https');
const config = require('../config');

/**
 * Mencari informasi di Wikipedia
 * @param {Object} message - Objek pesan WhatsApp
 * @param {string} query - Kata kunci pencarian
 */
async function searchWikipedia(message, query) {
  try {
    // Periksa apakah fitur Wikipedia diaktifkan
    if (!config.features.enableWikipedia) {
      await message.reply('❌ Fitur Wikipedia belum diaktifkan. Coba hubungi admin ya!');
      return;
    }
    
    // Catatan: Wikipedia tidak memerlukan API key untuk penggunaan dasar
    
    // Periksa apakah ada kata kunci pencarian
    if (!query || query.trim() === '') {
      await message.reply(`
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  ⚠️ *FORMAT SALAH*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Gunakan: !wikipedia [kata kunci]
Contoh: !wikipedia Indonesia`);
      return;
    }
    
    // Kirim pesan "sedang mencari"
    await message.reply('🔍 Bentar ya, lagi nyari di Wikipedia...');
    
    // Membuat URL untuk API Wikipedia
    const apiUrl = `https://id.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|info&exintro=true&explaintext=true&inprop=url&titles=${encodeURIComponent(query)}&redirects=1`;
    
    // Membuat permintaan HTTP menggunakan Promise
    const response = await new Promise((resolve, reject) => {
      https.get(apiUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error(`Error parsing JSON: ${error.message}`));
            }
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode}`));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
    
    // Memproses respons dari Wikipedia
    const pages = response.query.pages;
    const pageId = Object.keys(pages)[0];
    
    // Jika tidak ditemukan (pageId = -1)
    if (pageId === '-1') {
      await message.reply(`❌ Maaf, nggak ketemu info tentang "${query}" di Wikipedia. Coba kata kunci lain ya!`);
      return;
    }
    
    const page = pages[pageId];
    const title = page.title;
    const extract = page.extract;
    const url = page.fullurl;
    
    // Membatasi panjang ekstrak
    const maxLength = 1000;
    let trimmedExtract = extract;
    if (extract.length > maxLength) {
      trimmedExtract = extract.substring(0, maxLength) + '...';
    }
    
    // Menyusun respons
    const response_text = `
📚 *${title}*

${trimmedExtract}

🔗 *Baca selengkapnya:* ${url}`;
    
    // Mengirim respons
    await message.reply(response_text);
    
  } catch (error) {
    console.error('Error saat mencari di Wikipedia:', error);
    await message.reply('❌ Waduh, ada masalah saat nyari di Wikipedia. Coba lagi nanti ya!');
  }
}

module.exports = {
  searchWikipedia
};