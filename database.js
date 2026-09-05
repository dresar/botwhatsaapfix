// Simplified database.js without sqlite3 dependency
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');

// Pastikan direktori database ada
const dbDir = path.dirname(config.database.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Simplified database functions that don't rely on sqlite3
async function initDatabase() {
  console.log('Database initialization skipped (simplified version)');
  return {
    run: async () => ({ lastID: 0 }),
    get: async () => null,
    all: async () => [],
    exec: async () => {}
  };
}

async function saveChatMessage(chatId, sender, message, mediaType = null, mediaUrl = null) {
  console.log(`[LOG] Chat saved: ${chatId} - ${sender}: ${message}`);
  return 0;
}

async function saveChat(chatId, sender, message, mediaType = null, mediaUrl = null) {
  return saveChatMessage(chatId, sender, message, mediaType, mediaUrl);
}

async function getChats(limit = 50) {
  return [];
}

async function saveTask(groupId, taskName, dueDate = null, createdBy) {
  console.log(`[LOG] Task saved: ${groupId} - ${taskName}`);
  return 0;
}

async function getTasks(groupId, includeCompleted = false) {
  return [];
}

async function completeTask(taskId) {
  console.log(`[LOG] Task completed: ${taskId}`);
  return true;
}

async function saveKeepNote(title, content, createdBy, keepId = null, keepUrl = null) {
  console.log(`[LOG] Keep note saved: ${title}`);
  return 0;
}

async function updateKeepNoteInfo(noteId, keepId, keepUrl) {
  console.log(`[LOG] Keep note updated: ${noteId}`);
  return true;
}

async function getKeepNotes(limit = 50) {
  return [];
}

async function saveSticker(fileHash, fileUrl, createdBy) {
  console.log(`[LOG] Sticker saved: ${fileHash}`);
  return 0;
}

async function getStickers(limit = 50) {
  return [];
}

module.exports = {
  initDatabase,
  saveChatMessage,
  saveChat,
  getChats,
  saveTask,
  getTasks,
  completeTask,
  saveKeepNote,
  updateKeepNoteInfo,
  getKeepNotes,
  saveSticker,
  getStickers
};