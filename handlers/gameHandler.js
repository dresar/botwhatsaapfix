// gameHandler.js - Menangani berbagai permainan interaktif
// Gunakan fetch API global
const fetch = global.fetch;
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const { MessageMedia } = require('whatsapp-web.js');

// Menyimpan permainan yang sedang aktif
// Format: { chatId_userId: { type: 'mathGame', answer: '10', timestamp: Date.now() } }
const activeGames = new Map();

// Waktu kedaluwarsa permainan dalam milidetik (60 detik)
const GAME_EXPIRY_TIME = 60000;

/**
 * Permainan Matematika - Menguji kemampuan matematika pengguna
 * @param {object} message - Objek pesan WhatsApp
 */
async function mathGame(message) {
  try {
    // Buat soal matematika acak
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    // Sesuaikan tingkat kesulitan berdasarkan operasi
    if (operation === '+') {
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 100) + 1;
      answer = num1 + num2;
    } else if (operation === '-') {
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * num1) + 1; // Pastikan hasilnya positif
      answer = num1 - num2;
    } else { // Perkalian
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
    }
    
    // Kirim soal ke pengguna
    const questionText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🧮 *GAME MATEMATIKA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Berapa hasil dari: *${num1} ${operation} ${num2}* ?

⏱️ Kamu punya 60 detik untuk menjawab!

*Petunjuk:* Ketik jawabanmu langsung sebagai balasan pesan ini.`;
    
    await message.reply(questionText);
    
    // Dapatkan chat dan pengirim untuk ID unik
    const chat = await message.getChat();
    const sender = await message.getContact();
    const gameId = `${chat.id._serialized}_${sender.id._serialized}`;
    
    // Simpan jawaban yang benar untuk diverifikasi nanti
    activeGames.set(gameId, {
      type: 'mathGame',
      answer: answer.toString(),
      timestamp: Date.now()
    });
    
    // Atur timer untuk menghapus permainan jika tidak dijawab
    setTimeout(() => {
      if (activeGames.has(gameId) && activeGames.get(gameId).type === 'mathGame') {
        activeGames.delete(gameId);
      }
    }, GAME_EXPIRY_TIME);
    
  } catch (error) {
    console.error('Error saat memulai game matematika:', error);
    await message.reply('❌ Terjadi kesalahan saat memulai game matematika.');
  }
}

/**
 * Permainan Siapakah Aku - Tebak tokoh atau objek dari petunjuk
 * @param {object} message - Objek pesan WhatsApp
 */
async function siapakahAku(message) {
  try {
    // Daftar pertanyaan dan jawaban
    const questions = [
      { clue: "Aku adalah benda langit yang menerangi bumi di malam hari. Siapakah aku?", answer: "bulan" },
      { clue: "Aku adalah hewan yang bisa terbang dan aktif di malam hari. Siapakah aku?", answer: "kelelawar" },
      { clue: "Aku adalah alat yang digunakan untuk menulis dan menggambar dengan tinta. Siapakah aku?", answer: "pena" },
      { clue: "Aku adalah buah berwarna merah yang sering dijadikan saus. Siapakah aku?", answer: "tomat" },
      { clue: "Aku adalah benda yang digunakan untuk melihat bayangan diri. Siapakah aku?", answer: "cermin" },
      { clue: "Aku adalah tokoh kartun berbentuk spons yang tinggal di dalam nanas di bawah laut. Siapakah aku?", answer: "spongebob" },
      { clue: "Aku adalah alat musik yang dimainkan dengan cara dipetik dan memiliki 6 senar. Siapakah aku?", answer: "gitar" },
      { clue: "Aku adalah benda yang digunakan untuk mengukur waktu dan berbentuk lingkaran. Siapakah aku?", answer: "jam" },
      { clue: "Aku adalah hewan yang suka makan wortel dan memiliki telinga panjang. Siapakah aku?", answer: "kelinci" },
      { clue: "Aku adalah benda yang digunakan untuk melihat benda-benda yang jauh. Siapakah aku?", answer: "teropong" }
    ];
    
    // Pilih pertanyaan secara acak
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    // Kirim pertanyaan ke pengguna
    const questionText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎭 *SIAPAKAH AKU?*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

${randomQuestion.clue}

⏱️ Kamu punya 60 detik untuk menjawab!

*Petunjuk:* Ketik jawabanmu langsung sebagai balasan pesan ini.`;
    
    await message.reply(questionText);
    
    // Dapatkan chat dan pengirim untuk ID unik
    const chat = await message.getChat();
    const sender = await message.getContact();
    const gameId = `${chat.id._serialized}_${sender.id._serialized}`;
    
    // Simpan jawaban yang benar untuk diverifikasi nanti
    activeGames.set(gameId, {
      type: 'siapakahAku',
      answer: randomQuestion.answer.toLowerCase(),
      timestamp: Date.now()
    });
    
    // Atur timer untuk menghapus permainan jika tidak dijawab
    setTimeout(() => {
      if (activeGames.has(gameId) && activeGames.get(gameId).type === 'siapakahAku') {
        activeGames.delete(gameId);
      }
    }, GAME_EXPIRY_TIME);
    
  } catch (error) {
    console.error('Error saat memulai game siapakah aku:', error);
    await message.reply('❌ Terjadi kesalahan saat memulai game siapakah aku.');
  }
}

/**
 * Permainan Susun Kata - Menyusun huruf acak menjadi kata yang benar
 * @param {object} message - Objek pesan WhatsApp
 */
async function susunKata(message) {
  try {
    // Daftar kata-kata untuk permainan
    const words = [
      "indonesia", "komputer", "handphone", "kucing", "anjing",
      "sekolah", "universitas", "perpustakaan", "restoran", "kendaraan",
      "pesawat", "kereta", "sepeda", "televisi", "internet",
      "keyboard", "monitor", "kamera", "buku", "pensil"
    ];
    
    // Pilih kata secara acak
    const originalWord = words[Math.floor(Math.random() * words.length)];
    
    // Acak huruf-huruf dalam kata
    const shuffledWord = originalWord.split('').sort(() => Math.random() - 0.5).join('');
    
    // Kirim kata teracak ke pengguna
    const questionText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🔤 *SUSUN KATA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Susun huruf-huruf berikut menjadi sebuah kata:

*${shuffledWord}*

⏱️ Kamu punya 60 detik untuk menjawab!

*Petunjuk:* Ketik jawabanmu langsung sebagai balasan pesan ini.`;
    
    await message.reply(questionText);
    
    // Dapatkan chat dan pengirim untuk ID unik
    const chat = await message.getChat();
    const sender = await message.getContact();
    const gameId = `${chat.id._serialized}_${sender.id._serialized}`;
    
    // Simpan jawaban yang benar untuk diverifikasi nanti
    activeGames.set(gameId, {
      type: 'susunKata',
      answer: originalWord.toLowerCase(),
      timestamp: Date.now()
    });
    
    // Atur timer untuk menghapus permainan jika tidak dijawab
    setTimeout(() => {
      if (activeGames.has(gameId) && activeGames.get(gameId).type === 'susunKata') {
        activeGames.delete(gameId);
      }
    }, GAME_EXPIRY_TIME);
    
  } catch (error) {
    console.error('Error saat memulai game susun kata:', error);
    await message.reply('❌ Terjadi kesalahan saat memulai game susun kata.');
  }
}

/**
 * Permainan Tebak Kata - Menebak kata dari petunjuk
 * @param {object} message - Objek pesan WhatsApp
 */
async function tebakKata(message) {
  try {
    // Daftar kata dan petunjuknya
    const wordHints = [
      { word: "komputer", hint: "Alat elektronik yang digunakan untuk mengolah data" },
      { word: "handphone", hint: "Alat komunikasi yang bisa dibawa kemana-mana" },
      { word: "internet", hint: "Jaringan komputer global yang menghubungkan seluruh dunia" },
      { word: "buku", hint: "Kumpulan kertas berisi tulisan atau gambar yang dijilid" },
      { word: "kamera", hint: "Alat untuk mengambil gambar atau foto" },
      { word: "sepeda", hint: "Kendaraan beroda dua yang dikayuh dengan kaki" },
      { word: "televisi", hint: "Alat elektronik untuk menampilkan gambar dan suara dari jarak jauh" },
      { word: "jendela", hint: "Bagian rumah yang bisa dibuka untuk masuknya udara dan cahaya" },
      { word: "payung", hint: "Alat pelindung dari hujan atau panas matahari" },
      { word: "sendok", hint: "Alat makan untuk mengambil makanan cair atau semi cair" }
    ];
    
    // Pilih kata secara acak
    const randomWordHint = wordHints[Math.floor(Math.random() * wordHints.length)];
    
    // Buat petunjuk dengan beberapa huruf tersembunyi
    let hiddenWord = '';
    for (let i = 0; i < randomWordHint.word.length; i++) {
      // Tampilkan sekitar 30% huruf, sisanya ganti dengan tanda _
      if (Math.random() < 0.3) {
        hiddenWord += randomWordHint.word[i];
      } else {
        hiddenWord += '_';
      }
    }
    
    // Kirim petunjuk ke pengguna
    const questionText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🔍 *TEBAK KATA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Tebak kata dari petunjuk berikut:

*Petunjuk:* ${randomWordHint.hint}
*Kata:* ${hiddenWord}

⏱️ Kamu punya 60 detik untuk menjawab!

*Petunjuk:* Ketik jawabanmu langsung sebagai balasan pesan ini.`;
    
    await message.reply(questionText);
    
    // Dapatkan chat dan pengirim untuk ID unik
    const chat = await message.getChat();
    const sender = await message.getContact();
    const gameId = `${chat.id._serialized}_${sender.id._serialized}`;
    
    // Simpan jawaban yang benar untuk diverifikasi nanti
    activeGames.set(gameId, {
      type: 'tebakKata',
      answer: randomWordHint.word.toLowerCase(),
      timestamp: Date.now()
    });
    
    // Atur timer untuk menghapus permainan jika tidak dijawab
    setTimeout(() => {
      if (activeGames.has(gameId) && activeGames.get(gameId).type === 'tebakKata') {
        activeGames.delete(gameId);
      }
    }, GAME_EXPIRY_TIME);
    
  } catch (error) {
    console.error('Error saat memulai game tebak kata:', error);
    await message.reply('❌ Terjadi kesalahan saat memulai game tebak kata.');
  }
}

/**
 * Permainan Teka-teki - Menebak jawaban dari teka-teki
 * @param {object} message - Objek pesan WhatsApp
 */
async function tekaTeki(message) {
  try {
    // Daftar teka-teki dan jawabannya
    const riddles = [
      { question: "Apa yang bisa dipegang tapi tidak bisa disentuh?", answer: "janji" },
      { question: "Apa yang bisa berlari tapi tidak punya kaki?", answer: "waktu" },
      { question: "Apa yang bisa jatuh tapi tidak pernah terluka?", answer: "hujan" },
      { question: "Apa yang punya gigi tapi tidak bisa menggigit?", answer: "sisir" },
      { question: "Apa yang bisa bicara tapi tidak punya mulut?", answer: "gema" },
      { question: "Apa yang bisa terbang tanpa sayap?", answer: "waktu" },
      { question: "Apa yang selalu datang tapi tidak pernah tiba?", answer: "besok" },
      { question: "Apa yang bisa diisi tapi tidak pernah penuh?", answer: "pengetahuan" },
      { question: "Apa yang semakin banyak kamu ambil, semakin besar ukurannya?", answer: "lubang" },
      { question: "Apa yang bisa pecah tanpa disentuh?", answer: "janji" }
    ];
    
    // Pilih teka-teki secara acak
    const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
    
    // Kirim teka-teki ke pengguna
    const questionText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🧩 *TEKA-TEKI*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

${randomRiddle.question}

⏱️ Kamu punya 60 detik untuk menjawab!

*Petunjuk:* Ketik jawabanmu langsung sebagai balasan pesan ini.`;
    
    await message.reply(questionText);
    
    // Dapatkan chat dan pengirim untuk ID unik
    const chat = await message.getChat();
    const sender = await message.getContact();
    const gameId = `${chat.id._serialized}_${sender.id._serialized}`;
    
    // Simpan jawaban yang benar untuk diverifikasi nanti
    activeGames.set(gameId, {
      type: 'tekaTeki',
      answer: randomRiddle.answer.toLowerCase(),
      timestamp: Date.now()
    });
    
    // Atur timer untuk menghapus permainan jika tidak dijawab
    setTimeout(() => {
      if (activeGames.has(gameId) && activeGames.get(gameId).type === 'tekaTeki') {
        activeGames.delete(gameId);
      }
    }, GAME_EXPIRY_TIME);
    
  } catch (error) {
    console.error('Error saat memulai game teka-teki:', error);
    await message.reply('❌ Terjadi kesalahan saat memulai game teka-teki.');
  }
}

/**
 * Permainan Asah Otak - Pertanyaan logika dan penalaran
 * @param {object} message - Objek pesan WhatsApp
 */
async function asahOtak(message) {
  try {
    // Daftar pertanyaan asah otak dan jawabannya
    const brainTeasers = [
      { question: "Jika 5 orang membutuhkan 5 menit untuk membuat 5 kue, berapa lama waktu yang dibutuhkan 100 orang untuk membuat 100 kue?", answer: "5 menit" },
      { question: "Aku punya 6 telur. Aku pecahkan 2 telur. Aku masak 2 telur. Aku makan 2 telur. Berapa telur yang tersisa?", answer: "4 telur" },
      { question: "Berapa banyak angka 9 antara angka 1 sampai 100?", answer: "20" },
      { question: "Jika kamu memiliki satu korek api dan masuk ke ruangan yang ada lampu minyak, perapian, dan lilin, mana yang pertama kali kamu nyalakan?", answer: "korek api" },
      { question: "Apa yang bisa kamu pegang di tangan kananmu tapi tidak bisa kamu pegang di tangan kirimu?", answer: "tangan kirimu" },
      { question: "Apa yang akan basah saat mengeringkan?", answer: "handuk" },
      { question: "Apa yang selalu di depan tapi tidak pernah bisa dilihat?", answer: "masa depan" },
      { question: "Apa yang bertambah jika dibagi?", answer: "lubang" },
      { question: "Apa yang bisa kamu temukan di tengah-tengah Amerika dan Inggris?", answer: "huruf r" },
      { question: "Apa yang bisa kamu pegang tanpa pernah menyentuhnya?", answer: "janji" }
    ];
    
    // Pilih pertanyaan secara acak
    const randomBrainTeaser = brainTeasers[Math.floor(Math.random() * brainTeasers.length)];
    
    // Kirim pertanyaan ke pengguna
    const questionText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🧠 *ASAH OTAK*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

${randomBrainTeaser.question}

⏱️ Kamu punya 60 detik untuk menjawab!

*Petunjuk:* Ketik jawabanmu langsung sebagai balasan pesan ini.`;
    
    await message.reply(questionText);
    
    // Dapatkan chat dan pengirim untuk ID unik
    const chat = await message.getChat();
    const sender = await message.getContact();
    const gameId = `${chat.id._serialized}_${sender.id._serialized}`;
    
    // Simpan jawaban yang benar untuk diverifikasi nanti
    activeGames.set(gameId, {
      type: 'asahOtak',
      answer: randomBrainTeaser.answer.toLowerCase(),
      timestamp: Date.now()
    });
    
    // Atur timer untuk menghapus permainan jika tidak dijawab
    setTimeout(() => {
      if (activeGames.has(gameId) && activeGames.get(gameId).type === 'asahOtak') {
        activeGames.delete(gameId);
      }
    }, GAME_EXPIRY_TIME);
    
  } catch (error) {
    console.error('Error saat memulai game asah otak:', error);
    await message.reply('❌ Terjadi kesalahan saat memulai game asah otak.');
  }
}

/**
 * Permainan Cak Lontong - Tebak jawaban dari pertanyaan dengan jawaban yang tidak terduga
 * @param {object} message - Objek pesan WhatsApp
 */
async function cakLontong(message) {
  try {
    // Daftar pertanyaan cak lontong dan jawabannya
    const cakLontongQuestions = [
      { question: "Hewan apa yang tidak bisa bergerak?", answer: "hewan mati", explanation: "Ya iyalah, hewan mati tidak bisa bergerak" },
      { question: "Kenapa mobil bisa berjalan?" , answer: "karena rodanya bundar", explanation: "Kalau rodanya kotak, mobilnya loncat-loncat" },
      { question: "Apa bahasa Inggrisnya 'jatuh cinta'?", answer: "fall in love", explanation: "Fall = jatuh, in love = cinta" },
      { question: "Apa yang kalau dipotong malah tambah tinggi?", answer: "celana panjang", explanation: "Kalau celana panjang dipotong jadi pendek, pemakainya kelihatan lebih tinggi" },
      { question: "Apa bedanya sepatu dengan jengkol?", answer: "kalau sepatu disemir, kalau jengkol disemur", explanation: "Sepatu disemir biar mengkilap, jengkol disemur biar enak dimakan" },
      { question: "Apa yang bisa dihitung tapi tidak bisa dijumlahkan?", answer: "umur", explanation: "Umur bisa dihitung tapi tidak bisa dijumlahkan dengan umur orang lain" },
      { question: "Apa yang bisa berdiri tapi tidak bisa berjalan?", answer: "bangunan", explanation: "Bangunan berdiri tegak tapi tidak bisa berjalan" },
      { question: "Apa yang bisa terbang tapi bukan burung?", answer: "pesawat", explanation: "Pesawat bisa terbang tapi bukan burung" },
      { question: "Apa yang bisa masuk ke dalam air tapi tidak basah?", answer: "bayangan", explanation: "Bayangan bisa masuk ke air tapi tidak akan basah" },
      { question: "Apa yang bisa dipegang tapi tidak bisa dilihat?", answer: "napas", explanation: "Napas bisa dipegang (ditahan) tapi tidak bisa dilihat" }
    ];
    
    // Pilih pertanyaan secara acak
    const randomCakLontong = cakLontongQuestions[Math.floor(Math.random() * cakLontongQuestions.length)];
    
    // Kirim pertanyaan ke pengguna
    const questionText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  😄 *CAK LONTONG*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

${randomCakLontong.question}

⏱️ Kamu punya 60 detik untuk menjawab!

*Petunjuk:* Ketik jawabanmu langsung sebagai balasan pesan ini.`;
    
    await message.reply(questionText);
    
    // Dapatkan chat dan pengirim untuk ID unik
    const chat = await message.getChat();
    const sender = await message.getContact();
    const gameId = `${chat.id._serialized}_${sender.id._serialized}`;
    
    // Simpan jawaban yang benar untuk diverifikasi nanti
    activeGames.set(gameId, {
      type: 'cakLontong',
      answer: randomQuestion.answer.toLowerCase(),
      explanation: randomQuestion.explanation,
      timestamp: Date.now()
    });
    
    // Atur timer untuk menghapus permainan jika tidak dijawab
    setTimeout(() => {
      if (activeGames.has(gameId) && activeGames.get(gameId).type === 'cakLontong') {
        activeGames.delete(gameId);
      }
    }, GAME_EXPIRY_TIME);
    
  } catch (error) {
    console.error('Error saat memulai game cak lontong:', error);
    await message.reply('❌ Terjadi kesalahan saat memulai game cak lontong.');
  }
}

// Fungsi untuk fitur Weebs

/**
 * Menampilkan gambar loli acak (SFW)
 * @param {object} message - Objek pesan WhatsApp
 */
async function randomLoli(message) {
  try {
    await message.reply('🔍 Mencari gambar loli yang lucu...');
    
    // Gunakan API publik untuk mendapatkan gambar loli SFW
    const response = await fetch('https://api.waifu.pics/sfw/shinobu');
    const data = await response.json();
    const imageUrl = data.url;
    
    // Download gambar
    const imageResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Simpan gambar ke file sementara
    const tempFilePath = path.join(config.storage.tempDir, `loli_${Date.now()}.jpg`);
    await fs.writeFile(tempFilePath, buffer);
    
    // Kirim gambar sebagai media
    const media = MessageMedia.fromFilePath(tempFilePath);
    await message.reply(media, null, { caption: '✨ Random Loli (SFW)' });
    
    // Hapus file sementara
    fs.unlink(tempFilePath).catch(err => console.error('Error saat menghapus file sementara:', err));
    
  } catch (error) {
    console.error('Error saat mendapatkan gambar loli:', error);
    await message.reply('❌ Terjadi kesalahan saat mencari gambar loli.');
  }
}

/**
 * Menampilkan gambar selfie anime acak
 * @param {object} message - Objek pesan WhatsApp
 */
async function randomSelfie(message) {
  try {
    await message.reply('🔍 Mencari gambar selfie anime...');
    
    // Gunakan API publik untuk mendapatkan gambar selfie anime
    const response = await fetch('https://api.waifu.pics/sfw/selfies');
    const data = await response.json();
    const imageUrl = data.url;
    
    // Download gambar
    const imageResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Simpan gambar ke file sementara
    const tempFilePath = path.join(config.storage.tempDir, `selfie_${Date.now()}.jpg`);
    await fs.writeFile(tempFilePath, buffer);
    
    // Kirim gambar sebagai media
    const media = MessageMedia.fromFilePath(tempFilePath);
    await message.reply(media, null, { caption: '📸 Random Anime Selfie' });
    
    // Hapus file sementara
    fs.unlink(tempFilePath).catch(err => console.error('Error saat menghapus file sementara:', err));
    
  } catch (error) {
    console.error('Error saat mendapatkan gambar selfie anime:', error);
    await message.reply('❌ Terjadi kesalahan saat mencari gambar selfie anime.');
  }
}

/**
 * Menampilkan gambar waifu acak
 * @param {object} message - Objek pesan WhatsApp
 */
async function randomWaifu(message) {
  try {
    await message.reply('🔍 Mencari gambar waifu...');
    
    // Gunakan API publik untuk mendapatkan gambar waifu
    const response = await fetch('https://api.waifu.pics/sfw/waifu');
    const data = await response.json();
    const imageUrl = data.url;
    
    // Download gambar
    const imageResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Simpan gambar ke file sementara
    const tempFilePath = path.join(config.storage.tempDir, `waifu_${Date.now()}.jpg`);
    await fs.writeFile(tempFilePath, buffer);
    
    // Kirim gambar sebagai media
    const media = MessageMedia.fromFilePath(tempFilePath);
    await message.reply(media, null, { caption: '💖 Random Waifu' });
    
    // Hapus file sementara
    fs.unlink(tempFilePath).catch(err => console.error('Error saat menghapus file sementara:', err));
    
  } catch (error) {
    console.error('Error saat mendapatkan gambar waifu:', error);
    await message.reply('❌ Terjadi kesalahan saat mencari gambar waifu.');
  }
}

/**
 * Menampilkan daftar anime top dari MyAnimeList
 * @param {object} message - Objek pesan WhatsApp
 */
async function topAnime(message) {
  try {
    await message.reply('🔍 Mencari daftar anime top...');
    
    // Gunakan API Jikan untuk mendapatkan daftar anime top
    const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
    const data = await response.json();
    const animeList = data.data;
    
    // Format daftar anime
    let animeText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🏆 *TOP 10 ANIME*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
    
    animeList.forEach((anime, index) => {
      animeText += `*${index + 1}.* ${anime.title}\n`;
      animeText += `   Rating: ⭐ ${anime.score} (${anime.scored_by.toLocaleString()} votes)\n`;
      animeText += `   Episodes: ${anime.episodes || 'N/A'}\n`;
      animeText += `   Status: ${anime.status}\n\n`;
    });
    
    await message.reply(animeText);
    
  } catch (error) {
    console.error('Error saat mendapatkan daftar anime top:', error);
    await message.reply('❌ Terjadi kesalahan saat mencari daftar anime top.');
  }
}

/**
 * Mencari anime di OtakuDesu
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} query - Kata kunci pencarian
 */
async function otakudesu(message, query) {
  try {
    if (!query) {
      await message.reply('❌ Format: !otakudesu [judul anime]');
      return;
    }
    
    await message.reply(`🔍 Mencari "${query}" di OtakuDesu...`);
    
    // Catatan: Ini adalah contoh implementasi, API OtakuDesu mungkin tidak tersedia atau berubah
    // Gunakan API alternatif jika diperlukan
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
    const data = await response.json();
    const animeList = data.data;
    
    if (animeList.length === 0) {
      await message.reply(`❌ Tidak ditemukan hasil untuk "${query}"`);
      return;
    }
    
    // Format hasil pencarian
    let resultText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🔍 *HASIL PENCARIAN*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
    
    animeList.forEach((anime, index) => {
      resultText += `*${index + 1}.* ${anime.title}\n`;
      resultText += `   Jepang: ${anime.title_japanese}\n`;
      resultText += `   Rating: ⭐ ${anime.score || 'N/A'}\n`;
      resultText += `   Episodes: ${anime.episodes || 'N/A'}\n`;
      resultText += `   Status: ${anime.status}\n\n`;
    });
    
    await message.reply(resultText);
    
  } catch (error) {
    console.error('Error saat mencari anime di OtakuDesu:', error);
    await message.reply('❌ Terjadi kesalahan saat mencari anime.');
  }
}

// Fungsi untuk fitur Maker

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

/**
 * Verifikasi jawaban permainan
 * @param {object} message - Objek pesan WhatsApp
 * @returns {Promise<boolean>} - True jika jawaban benar, false jika salah atau tidak ada permainan aktif
 */
async function verifyGameAnswer(message) {
  try {
    // Dapatkan chat dan pengirim untuk ID unik
    const chat = await message.getChat();
    const sender = await message.getContact();
    const gameId = `${chat.id._serialized}_${sender.id._serialized}`;
    
    // Periksa apakah ada permainan aktif untuk pengguna ini
    if (!activeGames.has(gameId)) {
      return false; // Tidak ada permainan aktif
    }
    
    // Dapatkan data permainan
    const gameData = activeGames.get(gameId);
    const userAnswer = message.body.toLowerCase().trim();
    const correctAnswer = gameData.answer.toLowerCase();
    
    // Periksa apakah jawaban benar
    if (userAnswer === correctAnswer) {
      // Jawaban benar
      let responseText = `🎉 *Selamat!* Jawaban kamu benar: *${correctAnswer}*`;
      
      // Tambahkan penjelasan jika ada (untuk permainan Cak Lontong)
      if (gameData.type === 'cakLontong' && gameData.explanation) {
        responseText += `\n\n*Penjelasan:* ${gameData.explanation}`;
      }
      
      await message.reply(responseText);
      
      // Hapus permainan dari daftar aktif
      activeGames.delete(gameId);
      return true;
    } else {
      // Jawaban salah
      await message.reply('❌ Jawaban salah, coba lagi!');
      return false;
    }
  } catch (error) {
    console.error('Error saat memverifikasi jawaban:', error);
    return false;
  }
}

module.exports = {
  // Game
  mathGame,
  siapakahAku,
  susunKata,
  tebakKata,
  tekaTeki,
  asahOtak,
  cakLontong,
  verifyGameAnswer,
  
  // Weebs
  randomLoli,
  randomSelfie,
  randomWaifu,
  topAnime,
  otakudesu,
  
  // Maker
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