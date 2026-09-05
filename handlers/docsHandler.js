const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// Inisialisasi Google Docs API
let docs;

/**
 * Inisialisasi Google Docs API
 * @returns {boolean} Status inisialisasi
 */
function initGoogleDocs() {
  if (!config.google.clientId || !config.google.clientSecret || !config.google.refreshToken) {
    console.warn('Konfigurasi Google Docs tidak lengkap. Fitur Docs tidak akan berfungsi.');
    return false;
  }
  
  try {
    const oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
    
    oauth2Client.setCredentials({
      refresh_token: config.google.refreshToken
    });
    
    docs = google.docs({
      version: 'v1',
      auth: oauth2Client
    });
    
    return true;
  } catch (error) {
    console.error('Error saat menginisialisasi Google Docs API:', error);
    return false;
  }
}

/**
 * Membuat dokumen baru di Google Docs
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} title - Judul dokumen
 * @param {string} content - Konten awal dokumen (opsional)
 * @returns {Promise<object>} Informasi dokumen yang dibuat
 */
async function createDocument(message, title, content = '') {
  try {
    if (!config.features.enableDocs) {
      await message.reply('❌ Fitur Google Docs tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Docs jika belum
    if (!docs) {
      const initialized = initGoogleDocs();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Docs tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang membuat dokumen baru di Google Docs...');
    
    // Buat dokumen baru
    const document = await docs.documents.create({
      requestBody: {
        title: title
      }
    });
    
    const documentId = document.data.documentId;
    
    // Jika ada konten awal, tambahkan ke dokumen
    if (content) {
      await docs.documents.batchUpdate({
        documentId: documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: {
                  index: 1
                },
                text: content
              }
            }
          ]
        }
      });
    }
    
    // Buat dokumen dapat diakses publik (hanya baca)
    const drive = google.drive({
      version: 'v3',
      auth: docs.context._options.auth
    });
    
    await drive.permissions.create({
      fileId: documentId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    // Dapatkan link dokumen
    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    
    // Kirim respons ke pengguna
    await message.reply(
      `✅ Dokumen berhasil dibuat di Google Docs!\n\n` +
      `📝 *Judul:* ${title}\n` +
      `🔗 *Link:* ${docUrl}\n\n` +
      `Anda dapat mengakses dan mengedit dokumen ini melalui link di atas.`
    );
    
    return {
      success: true,
      documentId: documentId,
      title: title,
      url: docUrl
    };
  } catch (error) {
    console.error('Error saat membuat dokumen di Google Docs:', error);
    await message.reply('❌ Terjadi kesalahan saat membuat dokumen di Google Docs. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

/**
 * Mendapatkan konten dokumen dari Google Docs
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} documentId - ID dokumen Google Docs
 * @returns {Promise<object>} Konten dokumen
 */
async function getDocumentContent(message, documentId) {
  try {
    if (!config.features.enableDocs) {
      await message.reply('❌ Fitur Google Docs tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Docs jika belum
    if (!docs) {
      const initialized = initGoogleDocs();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Docs tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang mengambil konten dokumen dari Google Docs...');
    
    // Ambil dokumen
    const document = await docs.documents.get({
      documentId: documentId
    });
    
    // Ekstrak konten teks dari dokumen
    let content = '';
    const documentContent = document.data.body.content;
    
    for (const element of documentContent) {
      if (element.paragraph) {
        for (const paragraphElement of element.paragraph.elements) {
          if (paragraphElement.textRun) {
            content += paragraphElement.textRun.content;
          }
        }
      }
    }
    
    // Kirim respons ke pengguna dengan preview konten
    const previewContent = content.length > 500 ? content.substring(0, 500) + '...' : content;
    
    await message.reply(
      `📄 *Konten Dokumen*\n\n` +
      `${previewContent}\n\n` +
      `🔗 *Link Dokumen:* https://docs.google.com/document/d/${documentId}/edit`
    );
    
    return {
      success: true,
      documentId: documentId,
      title: document.data.title,
      content: content
    };
  } catch (error) {
    console.error('Error saat mengambil konten dokumen dari Google Docs:', error);
    await message.reply('❌ Terjadi kesalahan saat mengambil konten dokumen. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

/**
 * Menambahkan teks ke dokumen Google Docs yang sudah ada
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} documentId - ID dokumen Google Docs
 * @param {string} text - Teks yang akan ditambahkan
 * @returns {Promise<object>} Status operasi
 */
async function appendToDocument(message, documentId, text) {
  try {
    if (!config.features.enableDocs) {
      await message.reply('❌ Fitur Google Docs tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Docs jika belum
    if (!docs) {
      const initialized = initGoogleDocs();
      if (!initialized) {
        await message.reply('❌ Konfigurasi Google Docs tidak ditemukan. Pastikan kredensial sudah dikonfigurasi.');
        return { success: false, error: 'Konfigurasi tidak ditemukan' };
      }
    }
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang menambahkan teks ke dokumen Google Docs...');
    
    // Dapatkan dokumen untuk mengetahui posisi akhir
    const document = await docs.documents.get({
      documentId: documentId
    });
    
    // Cari indeks terakhir dokumen
    const endIndex = document.data.body.content[document.data.body.content.length - 1].endIndex - 1;
    
    // Tambahkan teks ke akhir dokumen
    await docs.documents.batchUpdate({
      documentId: documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: endIndex
              },
              text: '\n' + text
            }
          }
        ]
      }
    });
    
    // Kirim respons ke pengguna
    await message.reply(
      `✅ Teks berhasil ditambahkan ke dokumen!\n\n` +
      `🔗 *Link Dokumen:* https://docs.google.com/document/d/${documentId}/edit`
    );
    
    return {
      success: true,
      documentId: documentId
    };
  } catch (error) {
    console.error('Error saat menambahkan teks ke dokumen Google Docs:', error);
    await message.reply('❌ Terjadi kesalahan saat menambahkan teks ke dokumen. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

/**
 * Mencari dokumen berdasarkan kata kunci
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} query - Kata kunci pencarian
 * @param {number} maxResults - Jumlah maksimum hasil (default: 5)
 * @returns {Promise<object>} Hasil pencarian
 */
async function searchDocuments(message, query, maxResults = 5) {
  try {
    if (!config.features.enableDocs) {
      await message.reply('❌ Fitur Google Docs tidak diaktifkan. Hubungi admin untuk mengaktifkannya.');
      return { success: false, error: 'Fitur tidak diaktifkan' };
    }
    
    // Inisialisasi Google Drive API untuk mencari dokumen
    const oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
    
    oauth2Client.setCredentials({
      refresh_token: config.google.refreshToken
    });
    
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });
    
    // Kirim pesan sedang diproses
    await message.reply('⏳ Sedang mencari dokumen...');
    
    // Cari dokumen berdasarkan kata kunci
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.document' and name contains '${query}'`,
      fields: 'files(id, name, webViewLink, createdTime)',
      pageSize: maxResults
    });
    
    const files = response.data.files;
    
    if (!files || files.length === 0) {
      await message.reply(`❌ Tidak ditemukan dokumen dengan kata kunci "${query}"`);
      return { success: true, documents: [] };
    }
    
    // Format respons
    let responseText = `🔍 *Hasil Pencarian Dokumen: "${query}"*\n\n`;
    
    files.forEach((file, index) => {
      const createdDate = new Date(file.createdTime).toLocaleDateString('id-ID');
      responseText += `${index + 1}. *${file.name}*\n`;
      responseText += `   📅 Dibuat: ${createdDate}\n`;
      responseText += `   🔗 Link: ${file.webViewLink || `https://docs.google.com/document/d/${file.id}/edit`}\n`;
      responseText += `   🆔 ID: ${file.id}\n\n`;
    });
    
    await message.reply(responseText);
    
    return {
      success: true,
      documents: files
    };
  } catch (error) {
    console.error('Error saat mencari dokumen:', error);
    await message.reply('❌ Terjadi kesalahan saat mencari dokumen. Silakan coba lagi nanti.');
    return { success: false, error: error.message };
  }
}

module.exports = {
  initGoogleDocs,
  createDocument,
  getDocumentContent,
  appendToDocument,
  searchDocuments
};