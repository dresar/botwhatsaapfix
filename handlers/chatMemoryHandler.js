/**
 * Handler untuk menyimpan dan mengelola memori chat berdasarkan nomor pengguna
 */

const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// Direktori untuk menyimpan memori chat
const CHAT_MEMORY_DIR = path.join(__dirname, '..', 'data', 'chat_memory');

// Memastikan direktori ada
if (!fs.existsSync(CHAT_MEMORY_DIR)) {
  fs.mkdirSync(CHAT_MEMORY_DIR, { recursive: true });
}

// Menyimpan memori chat dalam memori untuk akses cepat
const chatMemory = {};

/**
 * Mendapatkan path file untuk memori chat pengguna
 * @param {string} userId - ID pengguna
 * @returns {string} - Path file memori chat
 */
function getChatMemoryPath(userId) {
  // Membersihkan ID pengguna dari karakter yang tidak valid untuk nama file
  const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(CHAT_MEMORY_DIR, `${cleanUserId}.json`);
}

/**
 * Memuat memori chat pengguna dari file
 * @param {string} userId - ID pengguna
 * @returns {Array} - Array pesan chat
 */
function loadChatMemory(userId) {
  try {
    const memoryPath = getChatMemoryPath(userId);
    
    if (fs.existsSync(memoryPath)) {
      const data = fs.readFileSync(memoryPath, 'utf8');
      return JSON.parse(data);
    }
    
    return [];
  } catch (error) {
    console.error(`Error saat memuat memori chat untuk ${userId}:`, error);
    return [];
  }
}

/**
 * Menyimpan memori chat pengguna ke file
 * @param {string} userId - ID pengguna
 * @param {Array} messages - Array pesan chat
 */
function saveChatMemory(userId, messages) {
  try {
    const memoryPath = getChatMemoryPath(userId);
    fs.writeFileSync(memoryPath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error(`Error saat menyimpan memori chat untuk ${userId}:`, error);
  }
}

/**
 * Menambahkan pesan ke memori chat pengguna
 * @param {string} userId - ID pengguna
 * @param {string} role - Peran pengirim (user/bot)
 * @param {string} content - Isi pesan
 * @param {number} maxMemory - Jumlah maksimum pesan yang disimpan
 */
function addMessageToMemory(userId, role, content, maxMemory = 10) {
  // Memuat memori chat dari cache atau file
  if (!chatMemory[userId]) {
    chatMemory[userId] = loadChatMemory(userId);
  }
  
  // Menambahkan pesan baru
  chatMemory[userId].push({
    role,
    content,
    timestamp: new Date().toISOString()
  });
  
  // Membatasi jumlah pesan yang disimpan
  if (chatMemory[userId].length > maxMemory) {
    chatMemory[userId] = chatMemory[userId].slice(-maxMemory);
  }
  
  // Menyimpan ke file
  saveChatMemory(userId, chatMemory[userId]);
}

/**
 * Mendapatkan memori chat pengguna
 * @param {string} userId - ID pengguna
 * @returns {Array} - Array pesan chat
 */
function getUserChatMemory(userId) {
  // Memuat memori chat dari cache atau file
  if (!chatMemory[userId]) {
    chatMemory[userId] = loadChatMemory(userId);
  }
  
  return chatMemory[userId];
}

/**
 * Menghapus memori chat pengguna
 * @param {string} userId - ID pengguna
 */
function clearUserChatMemory(userId) {
  chatMemory[userId] = [];
  saveChatMemory(userId, []);
}

/**
 * Mendapatkan konteks chat untuk AI berdasarkan memori chat pengguna
 * @param {string} userId - ID pengguna
 * @returns {string} - Konteks chat untuk AI
 */
function getChatContextForAI(userId) {
  const memory = getUserChatMemory(userId);
  
  if (memory.length === 0) {
    return '';
  }
  
  // Format memori chat untuk konteks AI
  let context = 'Berikut adalah percakapan sebelumnya:\n\n';
  
  memory.forEach(msg => {
    const role = msg.role === 'user' ? 'Pengguna' : 'Bot';
    context += `${role}: ${msg.content}\n`;
  });
  
  return context;
}

module.exports = {
  addMessageToMemory,
  getUserChatMemory,
  clearUserChatMemory,
  getChatContextForAI
};