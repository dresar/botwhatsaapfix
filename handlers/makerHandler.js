// makerHandler.js - Menangani berbagai fitur pembuat konten
// Gunakan fetch API global
const fetch = global.fetch;
const fs = require('fs-extra');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const config = require('../config');

/**
 * Membuat stiker dari gambar
 * @param {object} message - Objek pesan WhatsApp
 */
async function createSticker(message) {
  try {
    // Periksa apakah ada gambar yang dikirim
    if (!message.hasMedia) {
      const quotedMessage = await message.getQuotedMessage();
      if (!quotedMessage || !quotedMessage.hasMedia) {
        await message.reply('❌ Kirim gambar dengan caption !sticker atau balas gambar dengan !sticker');
        return;
      }
      
      // Gunakan pesan yang dibalas
      const media = await quotedMessage.downloadMedia();
      if (!media || !media.mimetype.startsWith('image/')) {
        await message.reply('❌ File yang dikirim bukan gambar. Kirim gambar untuk membuat stiker.');
        return;
      }
      
      await message.reply('⏳ Membuat stiker...');
      
      // Kirim stiker
      await message.reply(media, null, { sendMediaAsSticker: true, stickerName: 'Created by Bot', stickerAuthor: 'WhatsApp Bot' });
    } else {
      // Gunakan pesan saat ini
      const media = await message.downloadMedia();
      if (!media || !media.mimetype.startsWith('image/')) {
        await message.reply('❌ File yang dikirim bukan gambar. Kirim gambar untuk membuat stiker.');
        return;
      }
      
      await message.reply('⏳ Membuat stiker...');
      
      // Kirim stiker
      await message.reply(media, null, { sendMediaAsSticker: true, stickerName: 'Created by Bot', stickerAuthor: 'WhatsApp Bot' });
    }
  } catch (error) {
    console.error('Error saat membuat stiker:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat stiker.');
  }
}

/**
 * Membuat stiker meme dari gambar dengan teks
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} text - Teks untuk meme
 */
async function createStickerMeme(message, text) {
  try {
    if (!text) {
      await message.reply('❌ Format: !stickermeme [teks] atau balas gambar dengan !stickermeme [teks]');
      return;
    }
    
    // Periksa apakah ada gambar yang dikirim
    let targetMessage = message;
    if (!message.hasMedia) {
      const quotedMessage = await message.getQuotedMessage();
      if (!quotedMessage || !quotedMessage.hasMedia) {
        await message.reply('❌ Kirim gambar dengan caption !stickermeme [teks] atau balas gambar dengan !stickermeme [teks]');
        return;
      }
      targetMessage = quotedMessage;
    }
    
    // Download media
    const media = await targetMessage.downloadMedia();
    if (!media || !media.mimetype.startsWith('image/')) {
      await message.reply('❌ File yang dikirim bukan gambar. Kirim gambar untuk membuat stiker meme.');
      return;
    }
    
    await message.reply('⏳ Membuat stiker meme...');
    
    // Simpan gambar ke file sementara
    const tempFilePath = path.join(config.storage.tempDir, `meme_${Date.now()}.jpg`);
    await fs.writeFile(tempFilePath, Buffer.from(media.data, 'base64'));
    
    // Catatan: Implementasi pembuatan meme memerlukan library tambahan seperti jimp atau sharp
    // Untuk contoh sederhana, kita hanya mengirim stiker biasa
    
    // Kirim stiker
    await message.reply(media, null, { 
      sendMediaAsSticker: true, 
      stickerName: text, 
      stickerAuthor: 'WhatsApp Bot' 
    });
    
    // Hapus file sementara
    fs.unlink(tempFilePath).catch(err => console.error('Error saat menghapus file sementara:', err));
    
  } catch (error) {
    console.error('Error saat membuat stiker meme:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat stiker meme.');
  }
}

/**
 * Membuat fake chat iPhone
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} text - Teks untuk fake chat
 */
async function fakeIPhoneChat(message, text) {
  try {
    if (!text) {
      await message.reply('❌ Format: !iphonechat [teks]');
      return;
    }
    
    await message.reply('⏳ Membuat fake iPhone chat...');
    
    // Gunakan API untuk membuat fake chat iPhone
    const apiUrl = `https://api.popcat.xyz/iphonetext?text=${encodeURIComponent(text)}`;
    
    // Download gambar
    const response = await fetch(apiUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Simpan gambar ke file sementara
    const tempFilePath = path.join(config.storage.tempDir, `iphone_${Date.now()}.jpg`);
    await fs.writeFile(tempFilePath, buffer);
    
    // Kirim gambar
    const media = MessageMedia.fromFilePath(tempFilePath);
    await message.reply(media, null, { caption: '📱 Fake iPhone Chat' });
    
    // Hapus file sementara
    fs.unlink(tempFilePath).catch(err => console.error('Error saat menghapus file sementara:', err));
    
  } catch (error) {
    console.error('Error saat membuat fake iPhone chat:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat fake iPhone chat.');
  }
}

/**
 * Membuat nama ninja
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} name - Nama asli
 */
async function namaNinja(message, name) {
  try {
    if (!name) {
      await message.reply('❌ Format: !namaninja [nama]');
      return;
    }
    
    // Algoritma sederhana untuk membuat nama ninja
    const vowels = ['a', 'i', 'u', 'e', 'o'];
    const consonants = ['k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'g', 'z', 'd', 'b', 'p'];
    
    let ninjaName = '';
    const nameLower = name.toLowerCase();
    
    for (let i = 0; i < nameLower.length; i++) {
      const char = nameLower[i];
      if (vowels.includes(char)) {
        // Jika vokal, ganti dengan vokal acak lain
        const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
        ninjaName += randomVowel;
      } else if (consonants.includes(char)) {
        // Jika konsonan, ganti dengan konsonan acak lain
        const randomConsonant = consonants[Math.floor(Math.random() * consonants.length)];
        ninjaName += randomConsonant;
      } else {
        // Jika bukan vokal atau konsonan (spasi, dll), biarkan
        ninjaName += char;
      }
    }
    
    // Tambahkan akhiran ninja
    const ninjaSuffixes = ['maru', 'taro', 'kage', 'shin', 'suke', 'zaki', 'toshi', 'kazu', 'hiko', 'hito'];
    const randomSuffix = ninjaSuffixes[Math.floor(Math.random() * ninjaSuffixes.length)];
    
    ninjaName = ninjaName.charAt(0).toUpperCase() + ninjaName.slice(1) + ' ' + randomSuffix.charAt(0).toUpperCase() + randomSuffix.slice(1);
    
    await message.reply(`
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🥷 *NAMA NINJA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Nama asli: *${name}*
Nama ninja: *${ninjaName}*`);
    
  } catch (error) {
    console.error('Error saat membuat nama ninja:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat nama ninja.');
  }
}

/**
 * Membuat nama purba
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} name - Nama asli
 */
async function namaPurba(message, name) {
  try {
    if (!name) {
      await message.reply('❌ Format: !namapurba [nama]');
      return;
    }
    
    // Algoritma sederhana untuk membuat nama purba
    const purbaPrefix = ['Ug', 'Og', 'Arg', 'Grog', 'Thog', 'Mog', 'Bog', 'Zog', 'Krog', 'Drog'];
    const purbaSuffix = ['nar', 'gor', 'thor', 'mar', 'kar', 'tar', 'dar', 'gar', 'bar', 'zar'];
    
    const randomPrefix = purbaPrefix[Math.floor(Math.random() * purbaPrefix.length)];
    const randomSuffix = purbaSuffix[Math.floor(Math.random() * purbaSuffix.length)];
    
    // Ambil inisial nama asli
    const nameParts = name.split(' ');
    let initials = '';
    for (const part of nameParts) {
      if (part.length > 0) {
        initials += part[0].toUpperCase();
      }
    }
    
    // Buat nama purba
    const purbaName = randomPrefix + initials.toLowerCase() + randomSuffix;
    
    await message.reply(`
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🦖 *NAMA PURBA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Nama asli: *${name}*
Nama purba: *${purbaName}*`);
    
  } catch (error) {
    console.error('Error saat membuat nama purba:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat nama purba.');
  }
}

/**
 * Membuat teks BRAT
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} text - Teks untuk diubah
 */
async function bratText(message, text) {
  try {
    if (!text) {
      await message.reply('❌ Format: !brat [teks]');
      return;
    }
    
    // Ubah teks menjadi gaya BRAT
    const bratText = text
      .split('')
      .map((char, index) => index % 2 === 0 ? char.toUpperCase() : char.toLowerCase())
      .join('');
    
    await message.reply(`
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  💅 *BRAT TEXT*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

${bratText}`);
    
  } catch (error) {
    console.error('Error saat membuat BRAT text:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat BRAT text.');
  }
}

/**
 * Membuat GIF BRAT
 * @param {object} message - Objek pesan WhatsApp
 */
async function bratGif(message) {
  try {
    await message.reply('⏳ Mencari GIF BRAT...');
    
    // Daftar URL GIF BRAT
    const bratGifs = [
      'https://media.tenor.com/YruLnir4TWEAAAAC/brat-summer.gif',
      'https://media.tenor.com/Gu7oEVD9WN0AAAAC/brat-charli-xcx.gif',
      'https://media.tenor.com/ViHOYULKEncAAAAC/brat-charli-xcx.gif',
      'https://media.tenor.com/Gu7oEVD9WN0AAAAC/brat-charli-xcx.gif',
      'https://media.tenor.com/YruLnir4TWEAAAAC/brat-summer.gif'
    ];
    
    // Pilih GIF secara acak
    const randomGif = bratGifs[Math.floor(Math.random() * bratGifs.length)];
    
    // Download GIF
    const response = await fetch(randomGif);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Simpan GIF ke file sementara
    const tempFilePath = path.join(config.storage.tempDir, `brat_${Date.now()}.gif`);
    await fs.writeFile(tempFilePath, buffer);
    
    // Kirim GIF
    const media = MessageMedia.fromFilePath(tempFilePath);
    await message.reply(media, null, { caption: '💅 BRAT GIF' });
    
    // Hapus file sementara
    fs.unlink(tempFilePath).catch(err => console.error('Error saat menghapus file sementara:', err));
    
  } catch (error) {
    console.error('Error saat mengirim BRAT GIF:', error);
    await message.reply('❌ Terjadi kesalahan saat mengirim BRAT GIF.');
  }
}

/**
 * Membuat emoji mix
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} emojis - Dua emoji yang akan digabungkan
 */
async function emojiMix(message, emojis) {
  try {
    if (!emojis || emojis.length < 2) {
      await message.reply('❌ Format: !emojimix 😀😂 (dua emoji tanpa spasi)');
      return;
    }
    
    // Ekstrak dua emoji pertama
    const emojiRegex = /\p{Emoji}/gu;
    const emojiMatches = emojis.match(emojiRegex);
    
    if (!emojiMatches || emojiMatches.length < 2) {
      await message.reply('❌ Masukkan dua emoji yang valid! Contoh: !emojimix 😀😂');
      return;
    }
    
    const emoji1 = encodeURIComponent(emojiMatches[0]);
    const emoji2 = encodeURIComponent(emojiMatches[1]);
    
    await message.reply('⏳ Membuat emoji mix...');
    
    // Gunakan API Tenor untuk emoji mix
    const apiUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSy_SANITIZED_KEY_PROTECTED&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${emoji1}_${emoji2}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      await message.reply('❌ Kombinasi emoji ini tidak tersedia.');
      return;
    }
    
    const imageUrl = data.results[0].media_formats.png_transparent.url;
    
    // Download gambar
    const imageResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Simpan gambar ke file sementara
    const tempFilePath = path.join(config.storage.tempDir, `emojimix_${Date.now()}.png`);
    await fs.writeFile(tempFilePath, buffer);
    
    // Kirim gambar
    const media = MessageMedia.fromFilePath(tempFilePath);
    await message.reply(media, null, { caption: `🎨 Emoji Mix: ${emojiMatches[0]} + ${emojiMatches[1]}` });
    
    // Hapus file sementara
    fs.unlink(tempFilePath).catch(err => console.error('Error saat menghapus file sementara:', err));
    
  } catch (error) {
    console.error('Error saat membuat emoji mix:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat emoji mix.');
  }
}

/**
 * Membuat fake NGL (Not Gonna Lie) message
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} text - Teks untuk fake NGL
 */
async function fakeNGL(message, text) {
  try {
    if (!text) {
      await message.reply('❌ Format: !fakengl [teks]');
      return;
    }
    
    await message.reply('⏳ Membuat fake NGL message...');
    
    // Gunakan API untuk membuat fake NGL
    const apiUrl = `https://api.popcat.xyz/ngl?text=${encodeURIComponent(text)}`;
    
    // Download gambar
    const response = await fetch(apiUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Simpan gambar ke file sementara
    const tempFilePath = path.join(config.storage.tempDir, `ngl_${Date.now()}.jpg`);
    await fs.writeFile(tempFilePath, buffer);
    
    // Kirim gambar
    const media = MessageMedia.fromFilePath(tempFilePath);
    await message.reply(media, null, { caption: '📱 Fake NGL Message' });
    
    // Hapus file sementara
    fs.unlink(tempFilePath).catch(err => console.error('Error saat menghapus file sementara:', err));
    
  } catch (error) {
    console.error('Error saat membuat fake NGL message:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat fake NGL message.');
  }
}

module.exports = {
  createSticker,
  createStickerMeme,
  fakeIPhoneChat,
  namaNinja,
  namaPurba,
  bratText,
  bratGif,
  emojiMix,
  fakeNGL
};