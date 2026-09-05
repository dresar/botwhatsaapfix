const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// Path untuk menyimpan data bot
const BOT_DATA_FILE = path.join(__dirname, '../data/botData.json');

// Menyimpan status bot
let botStatus = {
  muted: false,
  mutedUntil: null,
  bannedUsers: []
};

/**
 * Memuat data bot dari file
 */
function loadBotData() {
  try {
    if (fs.existsSync(BOT_DATA_FILE)) {
      const data = fs.readFileSync(BOT_DATA_FILE, 'utf8');
      botStatus = JSON.parse(data);
      console.log('Data bot dimuat dari file');
    }
  } catch (error) {
    console.error('Error saat memuat data bot:', error);
    botStatus = {
      muted: false,
      mutedUntil: null,
      bannedUsers: []
    };
  }
}

/**
 * Menyimpan data bot ke file
 */
function saveBotData() {
  try {
    fs.writeFileSync(BOT_DATA_FILE, JSON.stringify(botStatus, null, 2));
    console.log('Data bot disimpan ke file');
  } catch (error) {
    console.error('Error saat menyimpan data bot:', error);
  }
}

/**
 * Memeriksa apakah pengguna adalah admin grup atau admin bot
 */
async function isGroupAdmin(message) {
  try {
    const chat = await message.getChat();
    if (!chat.isGroup) return false;
    
    const sender = await message.getContact();
    const senderId = sender.id._serialized;
    
    // Periksa apakah pengguna adalah admin bot (dari konfigurasi)
    const config = require('../config');
    if (config.admin && config.admin.numbers) {
      // Format nomor admin dari konfigurasi untuk perbandingan
      const formattedAdminNumbers = config.admin.numbers.map(num => {
        if (!num.includes('@')) {
          return num + '@c.us';
        }
        return num;
      });
      
      if (formattedAdminNumbers.includes(senderId)) {
        return true;
      }
    }
    
    // Periksa apakah pengguna adalah admin grup
    const participant = chat.participants.find(p => p.id._serialized === senderId);
    return participant && participant.isAdmin;
  } catch (error) {
    console.error('Error saat memeriksa admin:', error);
    return false;
  }
}

/**
 * Memeriksa apakah bot sedang dimute
 * @param {string} groupId - ID grup yang akan diperiksa (opsional, hanya untuk mode database grup)
 */
async function isBotMuted(groupId = null) {
  // Jika menggunakan database grup dan groupId disediakan
  if (config.database.enableGroupDatabases && groupId) {
    const groupDb = require('../groupDatabase');
    const muted = await groupDb.getGroupSetting(groupId, 'muted');
    const mutedUntil = await groupDb.getGroupSetting(groupId, 'mutedUntil');
    
    if (muted !== 'true') return false;
    
    if (mutedUntil) {
      const now = new Date();
      const mutedUntilDate = new Date(mutedUntil);
      
      if (now > mutedUntilDate) {
        // Jika waktu mute sudah berakhir, unmute bot
        await groupDb.saveGroupSetting(groupId, 'muted', 'false');
        await groupDb.saveGroupSetting(groupId, 'mutedUntil', null);
        return false;
      }
    }
    
    return true;
  } else {
    // Mode lama
    if (!botStatus.muted) return false;
    
    if (botStatus.mutedUntil) {
      const now = new Date();
      const mutedUntil = new Date(botStatus.mutedUntil);
      
      if (now > mutedUntil) {
        // Jika waktu mute sudah berakhir, unmute bot
        botStatus.muted = false;
        botStatus.mutedUntil = null;
        saveBotData();
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Memeriksa apakah pengguna dibanned
 * @param {string} userId - ID pengguna yang akan diperiksa
 * @param {string} groupId - ID grup yang akan diperiksa (opsional, hanya untuk mode database grup)
 */
async function isUserBanned(userId, groupId = null) {
  // Jika menggunakan database grup dan groupId disediakan
  if (config.database.enableGroupDatabases && groupId) {
    const groupDb = require('../groupDatabase');
    return await groupDb.isUserBanned(groupId, userId);
  } else {
    // Mode lama
    return botStatus.bannedUsers.includes(userId);
  }
}

/**
 * Mengeluarkan anggota dari grup
 */
async function kickMember(message, memberNumber) {
  try {
    // Periksa apakah pengirim adalah admin
    if (!(await isGroupAdmin(message))) {
      await message.reply('⚠️ Hanya admin grup yang dapat menggunakan perintah ini!');
      return;
    }
    
    if (!memberNumber) {
      await message.reply('⚠️ Format salah! Gunakan: !kick [nomor_anggota]\nContoh: !kick 628123456789');
      return;
    }
    
    // Format nomor anggota
    if (!memberNumber.includes('@')) {
      // Hapus awalan 0 dan tambahkan kode negara jika belum ada
      if (memberNumber.startsWith('0')) {
        memberNumber = '62' + memberNumber.substring(1);
      }
      // Tambahkan @c.us untuk format WhatsApp
      memberNumber = memberNumber + '@c.us';
    }
    
    const chat = await message.getChat();
    
    // Periksa apakah anggota ada dalam grup
    const participant = chat.participants.find(p => p.id._serialized === memberNumber);
    if (!participant) {
      await message.reply('⚠️ Anggota dengan nomor tersebut tidak ditemukan dalam grup!');
      return;
    }
    
    // Periksa apakah anggota yang akan dikick adalah admin
    if (participant.isAdmin) {
      await message.reply('⚠️ Tidak dapat mengeluarkan admin grup!');
      return;
    }
    
    // Kick anggota
    await chat.removeParticipants([memberNumber]);
    await message.reply(`✅ Anggota dengan nomor ${memberNumber.split('@')[0]} telah dikeluarkan dari grup.`);
  } catch (error) {
    console.error('Error saat mengeluarkan anggota:', error);
    await message.reply('❌ Terjadi kesalahan saat mengeluarkan anggota dari grup.');
  }
}

/**
 * Mengirim pesan broadcast ke semua anggota grup
 */
async function broadcastMessage(message, broadcastMessage) {
  try {
    // Periksa apakah pengirim adalah admin
    if (!(await isGroupAdmin(message))) {
      await message.reply('⚠️ Hanya admin grup yang dapat menggunakan perintah ini!');
      return;
    }
    
    if (!broadcastMessage || broadcastMessage.trim() === '') {
      await message.reply('⚠️ Format salah! Gunakan: !broadcast [pesan]');
      return;
    }
    
    const chat = await message.getChat();
    const sender = await message.getContact();
    
    // Format pesan broadcast
    const formattedMessage = `📢 *PENGUMUMAN GRUP*\n\n${broadcastMessage}\n\n👤 Dari: ${sender.pushname || sender.number}`;
    
    // Kirim pesan ke grup
    await chat.sendMessage(formattedMessage);
    
    await message.reply('✅ Pesan broadcast telah dikirim ke grup.');
  } catch (error) {
    console.error('Error saat mengirim broadcast:', error);
    await message.reply('❌ Terjadi kesalahan saat mengirim pesan broadcast.');
  }
}

/**
 * Menampilkan statistik bot
 */
async function showStats(message) {
  try {
    // Periksa apakah pengirim adalah admin
    if (!(await isGroupAdmin(message))) {
      await message.reply('⚠️ Hanya admin grup yang dapat menggunakan perintah ini!');
      return;
    }
    
    const chat = await message.getChat();
    const groupId = chat.id._serialized;
    
    // Mendapatkan jumlah anggota grup
    const participantCount = chat.participants.length;
    
    // Mendapatkan jumlah admin grup
    const adminCount = chat.participants.filter(p => p.isAdmin).length;
    
    let activeTasks = 0;
    let botMutedStatus = 'Tidak';
    let bannedUsersCount = 0;
    
    if (config.database.enableGroupDatabases) {
      // Menggunakan database grup
      const groupDb = require('../groupDatabase');
      const taskHandler = require('./taskHandler');
      
      // Mendapatkan tugas aktif dari database grup
      const tasks = await groupDb.getTasks(groupId);
      activeTasks = tasks.filter(task => !task.completed).length;
      
      // Mendapatkan status mute dari database grup
      const mutedSetting = await groupDb.getGroupSetting(groupId, 'muted');
      const mutedUntilSetting = await groupDb.getGroupSetting(groupId, 'mutedUntil');
      
      if (mutedSetting === 'true' && mutedUntilSetting) {
        botMutedStatus = `Ya (sampai ${new Date(mutedUntilSetting).toLocaleString()})`;
      }
      
      // Mendapatkan daftar pengguna yang dibanned dari database grup
      // Kita perlu membuat query khusus untuk menghitung jumlah pengguna yang dibanned
      const db = await groupDb.getGroupDatabase(groupId);
      const bannedUsers = await new Promise((resolve, reject) => {
        db.all('SELECT COUNT(*) as count FROM banned_members', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0].count);
        });
      });
      bannedUsersCount = bannedUsers;
    } else {
      // Menggunakan metode lama
      const taskHandler = require('./taskHandler');
      const tasks = require(path.join(__dirname, '../data/tasks.json'));
      activeTasks = tasks.filter(task => task.groupId === groupId && !task.completed).length;
      
      // Status bot
       const isMuted = await isBotMuted();
       botMutedStatus = isMuted ? 
         `Ya (sampai ${new Date(botStatus.mutedUntil).toLocaleString()})` : 'Tidak';
      
      bannedUsersCount = botStatus.bannedUsers.length;
    }
    
    // Format statistik
    const stats = `📊 *STATISTIK BOT* 📊\n\n` +
      `👥 Jumlah Anggota: ${participantCount}\n` +
      `👑 Jumlah Admin: ${adminCount}\n` +
      `📝 Tugas Aktif: ${activeTasks}\n` +
      `🔇 Bot Dimute: ${botMutedStatus}\n` +
      `⛔ Jumlah Pengguna Dibanned: ${bannedUsersCount}\n` +
      `⏱️ Waktu Server: ${new Date().toLocaleString()}`;
    
    await message.reply(stats);
  } catch (error) {
    console.error('Error saat menampilkan statistik:', error);
    await message.reply('❌ Terjadi kesalahan saat menampilkan statistik bot.');
  }
}

/**
 * Menonaktifkan bot sementara
 */
async function muteBot(message, duration) {
  try {
    // Periksa apakah pengirim adalah admin
    if (!(await isGroupAdmin(message))) {
      await message.reply('⚠️ Hanya admin grup yang dapat menggunakan perintah ini!');
      return;
    }
    
    if (!duration) {
      await message.reply('⚠️ Format salah! Gunakan: !mute [durasi_dalam_menit]\nContoh: !mute 30');
      return;
    }
    
    // Parsing durasi
    const durationMinutes = parseInt(duration);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      await message.reply('⚠️ Durasi harus berupa angka positif!');
      return;
    }
    
    // Hitung waktu berakhir mute
    const now = new Date();
    const mutedUntil = new Date(now.getTime() + durationMinutes * 60000);
    
    const chat = await message.getChat();
    const groupId = chat.id._serialized;
    
    if (config.database.enableGroupDatabases) {
      // Simpan status mute ke database grup
      const groupDb = require('../groupDatabase');
      await groupDb.saveGroupSetting(groupId, 'muted', 'true');
      await groupDb.saveGroupSetting(groupId, 'mutedUntil', mutedUntil.toISOString());
      
      // Jadwalkan unmute otomatis
      setTimeout(async () => {
        await groupDb.saveGroupSetting(groupId, 'muted', 'false');
        await groupDb.saveGroupSetting(groupId, 'mutedUntil', null);
        console.log(`Bot otomatis diaktifkan kembali untuk grup ${groupId}`);
      }, durationMinutes * 60000);
    } else {
      // Update status bot (mode lama)
      botStatus.muted = true;
      botStatus.mutedUntil = mutedUntil.toISOString();
      saveBotData();
    }
    
    await message.reply(`🔇 Bot telah dinonaktifkan selama ${durationMinutes} menit. Bot akan aktif kembali pada ${mutedUntil.toLocaleString()}.`);
  } catch (error) {
    console.error('Error saat menonaktifkan bot:', error);
    await message.reply('❌ Terjadi kesalahan saat menonaktifkan bot.');
  }
}

/**
 * Mengaktifkan kembali bot
 */
async function unmuteBot(message) {
  try {
    // Periksa apakah pengirim adalah admin
    if (!(await isGroupAdmin(message))) {
      await message.reply('⚠️ Hanya admin grup yang dapat menggunakan perintah ini!');
      return;
    }
    
    const chat = await message.getChat();
    const groupId = chat.id._serialized;
    
    if (config.database.enableGroupDatabases) {
      // Update status mute di database grup
      const groupDb = require('../groupDatabase');
      await groupDb.saveGroupSetting(groupId, 'muted', 'false');
      await groupDb.saveGroupSetting(groupId, 'mutedUntil', null);
    } else {
      // Update status bot (mode lama)
      botStatus.muted = false;
      botStatus.mutedUntil = null;
      saveBotData();
    }
    
    await message.reply('🔊 Bot telah diaktifkan kembali.');
  } catch (error) {
    console.error('Error saat mengaktifkan bot:', error);
    await message.reply('❌ Terjadi kesalahan saat mengaktifkan bot.');
  }
}

/**
 * Membanned anggota dari grup
 */
async function banMember(message, memberNumber) {
  try {
    // Periksa apakah pengirim adalah admin
    if (!(await isGroupAdmin(message))) {
      await message.reply('⚠️ Hanya admin grup yang dapat menggunakan perintah ini!');
      return;
    }
    
    if (!memberNumber) {
      await message.reply('⚠️ Format salah! Gunakan: !ban [nomor_anggota]\nContoh: !ban 628123456789');
      return;
    }
    
    // Format nomor anggota
    if (!memberNumber.includes('@')) {
      // Hapus awalan 0 dan tambahkan kode negara jika belum ada
      if (memberNumber.startsWith('0')) {
        memberNumber = '62' + memberNumber.substring(1);
      }
      // Tambahkan @c.us untuk format WhatsApp
      memberNumber = memberNumber + '@c.us';
    }
    
    const chat = await message.getChat();
    const groupId = chat.id._serialized;
    
    // Periksa apakah anggota ada dalam grup
    const participant = chat.participants.find(p => p.id._serialized === memberNumber);
    if (!participant) {
      await message.reply('⚠️ Anggota dengan nomor tersebut tidak ditemukan dalam grup!');
      return;
    }
    
    // Periksa apakah anggota yang akan dibanned adalah admin
    if (participant.isAdmin) {
      await message.reply('⚠️ Tidak dapat membanned admin grup!');
      return;
    }
    
    const sender = await message.getContact();
    
    if (config.database.enableGroupDatabases) {
      // Periksa apakah anggota sudah dibanned di database grup
      const groupDb = require('../groupDatabase');
      const isBanned = await groupDb.isUserBanned(groupId, memberNumber);
      
      if (isBanned) {
        await message.reply('⚠️ Anggota tersebut sudah dibanned!');
        return;
      }
      
      // Ban anggota di database grup
      await groupDb.banMember(groupId, memberNumber, sender.id._serialized, 'Banned by admin');
    } else {
      // Periksa apakah anggota sudah dibanned (mode lama)
      if (botStatus.bannedUsers.includes(memberNumber)) {
        await message.reply('⚠️ Anggota tersebut sudah dibanned!');
        return;
      }
      
      // Banned anggota (mode lama)
      botStatus.bannedUsers.push(memberNumber);
      saveBotData();
    }
    
    await message.reply(`⛔ Anggota dengan nomor ${memberNumber.split('@')[0]} telah dibanned dari bot.`);
  } catch (error) {
    console.error('Error saat membanned anggota:', error);
    await message.reply('❌ Terjadi kesalahan saat membanned anggota.');
  }
}

/**
 * Membuka banned anggota dari grup
 */
async function unbanMember(message, memberNumber) {
  try {
    // Periksa apakah pengirim adalah admin
    if (!(await isGroupAdmin(message))) {
      await message.reply('⚠️ Hanya admin grup yang dapat menggunakan perintah ini!');
      return;
    }
    
    if (!memberNumber) {
      await message.reply('⚠️ Format salah! Gunakan: !unban [nomor_anggota]\nContoh: !unban 628123456789');
      return;
    }
    
    // Format nomor anggota
    if (!memberNumber.includes('@')) {
      // Hapus awalan 0 dan tambahkan kode negara jika belum ada
      if (memberNumber.startsWith('0')) {
        memberNumber = '62' + memberNumber.substring(1);
      }
      // Tambahkan @c.us untuk format WhatsApp
      memberNumber = memberNumber + '@c.us';
    }
    
    const chat = await message.getChat();
    const groupId = chat.id._serialized;
    
    if (config.database.enableGroupDatabases) {
      // Periksa apakah anggota dibanned di database grup
      const groupDb = require('../groupDatabase');
      const isBanned = await groupDb.isUserBanned(groupId, memberNumber);
      
      if (!isBanned) {
        await message.reply('⚠️ Anggota tersebut tidak dibanned!');
        return;
      }
      
      // Unban anggota di database grup
      await groupDb.unbanMember(groupId, memberNumber);
    } else {
      // Periksa apakah anggota dibanned (mode lama)
      const bannedIndex = botStatus.bannedUsers.indexOf(memberNumber);
      if (bannedIndex === -1) {
        await message.reply('⚠️ Anggota tersebut tidak dibanned!');
        return;
      }
      
      // Unban anggota (mode lama)
      botStatus.bannedUsers.splice(bannedIndex, 1);
      saveBotData();
    }
    
    await message.reply(`✅ Anggota dengan nomor ${memberNumber.split('@')[0]} telah dibuka dari banned.`);
  } catch (error) {
    console.error('Error saat membuka banned anggota:', error);
    await message.reply('❌ Terjadi kesalahan saat membuka banned anggota.');
  }
}

// Inisialisasi data bot saat modul dimuat
loadBotData();

module.exports = {
  isGroupAdmin,
  isBotMuted,
  isUserBanned,
  kickMember,
  broadcastMessage,
  showStats,
  muteBot,
  unmuteBot,
  banMember,
  unbanMember
};