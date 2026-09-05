const fs = require('fs-extra');
const path = require('path');
const schedule = require('node-schedule');
const moment = require('moment');
const config = require('../config');
const groupDb = require('../groupDatabase');

// Path untuk menyimpan data tugas (untuk kompatibilitas)
const TASKS_FILE = path.join(__dirname, '../data/tasks.json');

// Menyimpan daftar tugas
let tasks = [];

// Menyimpan daftar pengingat tugas yang dijadwalkan
let scheduledReminders = {};

/**
 * Memuat data tugas dari file atau database
 */
async function loadTasks() {
  try {
    if (config.database.enableGroupDatabases) {
      // Jika database per grup diaktifkan, kita akan memuat tugas saat diperlukan
      // dari database grup masing-masing
      console.log('Mode database per grup diaktifkan, tugas akan dimuat dari database grup');
      tasks = [];
    } else if (fs.existsSync(TASKS_FILE)) {
      // Mode lama: memuat dari file JSON
      const data = fs.readFileSync(TASKS_FILE, 'utf8');
      tasks = JSON.parse(data);
      console.log(`${tasks.length} tugas dimuat dari file`);
    }
    
    // Menjadwalkan ulang pengingat untuk tugas yang belum selesai
    rescheduleReminders();
  } catch (error) {
    console.error('Error saat memuat tugas:', error);
    tasks = [];
  }
}

/**
 * Menyimpan data tugas ke file atau database
 */
async function saveTasks() {
  try {
    if (!config.database.enableGroupDatabases) {
      // Mode lama: simpan ke file JSON
      fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
      console.log(`${tasks.length} tugas disimpan ke file`);
    }
    // Catatan: Dalam mode database per grup, tugas disimpan langsung ke database
    // saat ditambahkan atau diperbarui, jadi tidak perlu menyimpan di sini
  } catch (error) {
    console.error('Error saat menyimpan tugas:', error);
  }
}

/**
 * Menjadwalkan ulang pengingat untuk tugas yang belum selesai
 */
function rescheduleReminders() {
  // Batalkan semua pengingat yang ada
  Object.values(scheduledReminders).forEach(job => {
    if (job) job.cancel();
  });
  
  scheduledReminders = {};
  
  // Jadwalkan ulang pengingat untuk tugas yang memiliki waktu pengingat
  tasks.forEach(task => {
    if (task.reminderTime && !task.completed) {
      const reminderTime = new Date(task.reminderTime);
      if (reminderTime > new Date()) {
        scheduleReminder(task.id, task.groupId, reminderTime, task.name);
      }
    }
  });
}

/**
 * Menjadwalkan pengingat untuk tugas
 */
function scheduleReminder(taskId, groupId, reminderTime, taskName) {
  const job = schedule.scheduleJob(reminderTime, async function() {
    try {
      // Mendapatkan client dari modul utama
      const { Client } = require('whatsapp-web.js');
      const client = Client.instance;
      
      if (client) {
        const chat = await client.getChatById(groupId);
        await chat.sendMessage(`⏰ *PENGINGAT TUGAS* ⏰\n\nTugas: ${taskName}\nWaktu: ${moment(reminderTime).format('DD/MM/YYYY HH:mm')}`);
        
        // Hapus pengingat dari daftar setelah dijalankan
        delete scheduledReminders[taskId];
      }
    } catch (error) {
      console.error('Error saat mengirim pengingat:', error);
    }
  });
  
  scheduledReminders[taskId] = job;
}

/**
 * Menambahkan tugas baru
 */
async function addTask(message, taskName) {
  if (!taskName || taskName.trim() === '') {
    await message.reply('⚠️ Format salah! Gunakan: !tambah_tugas [nama_tugas]');
    return;
  }
  
  const chat = await message.getChat();
  const sender = await message.getContact();
  const groupId = chat.id._serialized;
  
  if (config.database.enableGroupDatabases) {
    // Simpan tugas ke database grup menggunakan fungsi yang ada
    await groupDb.saveTask(groupId, taskName.trim(), sender.id.user);
  } else {
    // Mode lama: simpan ke array dan file JSON
    const newTask = {
      id: Date.now().toString(),
      name: taskName.trim(),
      createdBy: sender.id.user,
      createdAt: new Date().toISOString(),
      groupId: groupId,
      groupName: chat.name,
      completed: false,
      reminderTime: null
    };
    
    tasks.push(newTask);
    await saveTasks();
  }
  
  await message.reply(`✅ Tugas baru ditambahkan: *${taskName}*`);
}

/**
 * Menampilkan daftar tugas
 */
async function listTasks(message) {
  const chat = await message.getChat();
  let groupTasks = [];
  
  if (config.database.enableGroupDatabases) {
    // Ambil tugas dari database grup
    groupTasks = await groupDb.getTasks(chat.id._serialized, false); // false = hanya tugas yang belum selesai
  } else {
    // Mode lama: filter dari array tugas
    groupTasks = tasks.filter(task => task.groupId === chat.id._serialized && !task.completed);
  }
  
  if (groupTasks.length === 0) {
    await message.reply('📝 Tidak ada tugas aktif untuk grup ini.');
    return;
  }
  
  let taskList = '📋 *DAFTAR TUGAS* 📋\n\n';
  groupTasks.forEach((task, index) => {
    const reminderInfo = task.reminderTime ? 
      `\n   🔔 Pengingat: ${moment(task.reminderTime).format('DD/MM/YYYY HH:mm')}` : '';
    
    taskList += `${index + 1}. *${task.name}*\n   👤 Dibuat oleh: ${task.createdBy}\n   📅 Tanggal: ${moment(task.createdAt).format('DD/MM/YYYY HH:mm')}${reminderInfo}\n\n`;
  });
  
  await message.reply(taskList);
}

/**
 * Menjadwalkan pengingat untuk tugas
 */
async function scheduleTaskReminder(message, args) {
  if (args.length < 2) {
    await message.reply('⚠️ Format salah! Gunakan: !ingatkan_tugas [nama_tugas] [waktu]\nContoh: !ingatkan_tugas Kerjakan PR 2023-12-31 14:30');
    return;
  }
  
  // Memisahkan nama tugas dan waktu
  const timeArg = args[args.length - 2] + ' ' + args[args.length - 1];
  const taskName = args.slice(0, args.length - 2).join(' ');
  
  if (!taskName || taskName.trim() === '') {
    await message.reply('⚠️ Nama tugas tidak boleh kosong!');
    return;
  }
  
  // Parsing waktu pengingat
  let reminderTime;
  try {
    reminderTime = moment(timeArg, 'YYYY-MM-DD HH:mm').toDate();
    
    if (isNaN(reminderTime.getTime())) {
      throw new Error('Format waktu tidak valid');
    }
    
    if (reminderTime <= new Date()) {
      await message.reply('⚠️ Waktu pengingat harus di masa depan!');
      return;
    }
  } catch (error) {
    await message.reply('⚠️ Format waktu salah! Gunakan format: YYYY-MM-DD HH:mm\nContoh: 2023-12-31 14:30');
    return;
  }
  
  const chat = await message.getChat();
  const sender = await message.getContact();
  const groupId = chat.id._serialized;
  
  if (config.database.enableGroupDatabases) {
    // Cari tugas di database grup
    const groupTasks = await groupDb.getTasks(groupId, false); // false = hanya tugas yang belum selesai
    let task = groupTasks.find(t => 
      t.name.toLowerCase() === taskName.toLowerCase() && !t.completed
    );
    
    if (!task) {
      // Jika tugas belum ada, buat tugas baru dengan pengingat
      const taskId = await groupDb.saveTask(groupId, taskName.trim(), sender.id.user, reminderTime);
      // Ambil nama tugas untuk pengingat
      const tasks = await groupDb.getTasks(groupId, false);
      task = tasks.find(t => t.id === taskId);
    } else {
      // Jika tugas sudah ada, update waktu pengingat
      await groupDb.updateTaskReminder(groupId, task.id, reminderTime);
    }
    
    // Jadwalkan pengingat
    scheduleReminder(task.id.toString(), groupId, reminderTime, task.name);
  } else {
    // Mode lama: cari di array tugas
    let task = tasks.find(t => 
      t.name.toLowerCase() === taskName.toLowerCase() && 
      t.groupId === groupId && 
      !t.completed
    );
    
    // Jika tugas belum ada, buat tugas baru
    if (!task) {
      task = {
        id: Date.now().toString(),
        name: taskName.trim(),
        createdBy: sender.id.user,
        createdAt: new Date().toISOString(),
        groupId: groupId,
        groupName: chat.name,
        completed: false,
        reminderTime: null
      };
      tasks.push(task);
    }
    
    // Update waktu pengingat
    task.reminderTime = reminderTime.toISOString();
    await saveTasks();
    
    // Jadwalkan pengingat
    scheduleReminder(task.id, task.groupId, reminderTime, task.name);
  }
  
  await message.reply(`⏰ Pengingat untuk tugas *${taskName}* telah diatur pada *${moment(reminderTime).format('DD/MM/YYYY HH:mm')}*`);
}

module.exports = {
  loadTasks,
  saveTasks,
  addTask,
  listTasks,
  scheduleTaskReminder
};