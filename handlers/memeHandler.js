// Gunakan fetch API global
const fetch = global.fetch;
const { MessageMedia } = require('whatsapp-web.js');

/**
 * Mendapatkan meme acak dari Reddit
 * @param {Object} message - Objek pesan WhatsApp
 */
async function getRandomMeme(message) {
  try {
    // Menggunakan API publik untuk mendapatkan meme
    const response = await fetch('https://meme-api.com/gimme');
    const memeData = await response.json();
    
    // Mengunduh gambar meme
    const memeImage = await fetch(memeData.url);
    const base64Image = Buffer.from(await memeImage.arrayBuffer()).toString('base64');
    
    // Membuat media dari gambar
    const media = new MessageMedia('image/jpeg', base64Image, 'meme.jpg');
    
    // Mengirim meme dengan caption
    await message.reply(media, null, {
      caption: `*${memeData.title}*\n\nSumber: r/${memeData.subreddit}`
    });
  } catch (error) {
    console.error('Error saat mengambil meme:', error);
    await message.reply('❌ Terjadi kesalahan saat mengambil meme. Silakan coba lagi nanti.');
  }
}

/**
 * Mendapatkan lelucon acak
 * @param {Object} message - Objek pesan WhatsApp
 */
async function getRandomJoke(message) {
  try {
    // Menggunakan API publik untuk mendapatkan lelucon
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const jokeData = await response.json();
    
    // Membuat pesan dengan lelucon
    const replyMessage = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  😂 *LELUCON ACAK*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

*${jokeData.setup}*

${jokeData.punchline}`;
    
    await message.reply(replyMessage);
  } catch (error) {
    console.error('Error saat mengambil lelucon:', error);
    await message.reply('❌ Terjadi kesalahan saat mengambil lelucon. Silakan coba lagi nanti.');
  }
}

/**
 * Mendapatkan lelucon dad joke acak
 * @param {Object} message - Objek pesan WhatsApp
 */
async function getDadJoke(message) {
  try {
    // Menggunakan API publik untuk mendapatkan dad joke
    const response = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        Accept: 'application/json'
      }
    });
    const jokeData = await response.json();
    
    // Membuat pesan dengan dad joke
    const replyMessage = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  👨 *DAD JOKE*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

${jokeData.joke}`;
    
    await message.reply(replyMessage);
  } catch (error) {
    console.error('Error saat mengambil dad joke:', error);
    await message.reply('❌ Terjadi kesalahan saat mengambil dad joke. Silakan coba lagi nanti.');
  }
}

module.exports = {
  getRandomMeme,
  getRandomJoke,
  getDadJoke
};