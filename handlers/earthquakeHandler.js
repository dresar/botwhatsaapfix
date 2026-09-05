// Gunakan fetch API global
const fetch = global.fetch;
const cheerio = require('cheerio');

/**
 * Mendapatkan informasi gempa terkini dari BMKG
 * @param {Object} message - Objek pesan WhatsApp
 */
async function getLatestEarthquake(message) {
  try {
    // URL BMKG untuk data gempa terkini
    const url = 'https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg';
    
    // Mengambil data dari website BMKG
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Mengambil data gempa dari tabel
    const earthquakeData = [];
    $('table.table-hover tbody tr').slice(0, 5).each((i, element) => {
      const tds = $(element).find('td');
      const earthquake = {
        time: $(tds[1]).text().trim(),
        latitude: $(tds[2]).text().trim(),
        longitude: $(tds[3]).text().trim(),
        magnitude: $(tds[4]).text().trim(),
        depth: $(tds[5]).text().trim(),
        region: $(tds[6]).text().trim(),
        potentialTsunami: $(tds[6]).text().toLowerCase().includes('tsunami') ? 'Ya' : 'Tidak'
      };
      earthquakeData.push(earthquake);
    });
    
    if (earthquakeData.length === 0) {
      await message.reply('❌ Tidak dapat mengambil data gempa terkini. Silakan coba lagi nanti.');
      return;
    }
    
    // Membuat pesan dengan data gempa terkini
    let replyMessage = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌋 *INFO GEMPA TERKINI*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
    
    earthquakeData.forEach((quake, index) => {
      replyMessage += `*Gempa #${index + 1}*\n`;
      replyMessage += `⏰ Waktu: ${quake.time}\n`;
      replyMessage += `📍 Lokasi: ${quake.latitude}, ${quake.longitude}\n`;
      replyMessage += `📏 Magnitudo: ${quake.magnitude}\n`;
      replyMessage += `🔍 Kedalaman: ${quake.depth}\n`;
      replyMessage += `🗺️ Wilayah: ${quake.region}\n`;
      replyMessage += `🌊 Potensi Tsunami: ${quake.potentialTsunami}\n`;
      
      if (index < earthquakeData.length - 1) {
        replyMessage += `\n----------------------------\n\n`;
      }
    });
    
    replyMessage += `\n\nSumber: BMKG (https://www.bmkg.go.id)`;
    
    await message.reply(replyMessage);
  } catch (error) {
    console.error('Error saat mengambil data gempa:', error);
    await message.reply('❌ Terjadi kesalahan saat mengambil data gempa. Silakan coba lagi nanti.');
  }
}

module.exports = {
  getLatestEarthquake
};