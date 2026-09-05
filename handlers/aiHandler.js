// aiHandler.js with native https implementation for Gemini API
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const config = require('../config');

/**
 * Menggunakan Gemini AI untuk menjawab pertanyaan
 */
async function askGemini(message, prompt) {
  try {
    if (!config.features.enableAI) {
      await message.reply('❌ Fitur AI belum diaktifin nih. Coba hubungi admin ya!');
      return;
    }
    
    if (!config.ai.geminiApiKey) {
      await message.reply('❌ API Key Gemini nggak ketemu nih. Coba hubungi admin ya!');
      return;
    }
    
    // Mengirim pesan sedang mengetik
    await message.reply('🤖 Bentar ya, lagi mikir...');
    
    // Endpoint untuk model gemini-1.5-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.geminiApiKey}`;
    
    // Mendapatkan konteks chat dari memori lokal
    const chatContext = require('../handlers/chatMemoryHandler').getChatContextForAI(message.from);
    
    // Menambahkan instruksi persona dan konteks chat ke prompt
    const enhancedPrompt = `Kamu adalah bot Eka yang dibuat pada tahun 2024. Kamu selalu menggunakan bahasa non-formal dan santai seperti teman ngobrol. Kamu siap menerima pertanyaan tentang kuliah dan topik lainnya. Kamu juga bisa membantu membuat catatan yang lebih bagus dan menyimpannya di Google Keep atau membantu dengan tugas kuliah.

${chatContext ? chatContext + '\n\n' : ''}Berikut pertanyaan/permintaan dari pengguna: ${prompt}`;
    
    // Data permintaan
    const data = {
      contents: [
        {
          parts: [
            {
              text: enhancedPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };
    
    console.log(`[LOG] Mengirim permintaan ke Gemini: ${prompt.substring(0, 50)}...`);
    
    // Membuat promise untuk request HTTP
    const response = await new Promise((resolve, reject) => {
      // Membuat permintaan HTTP
      const postData = JSON.stringify(data);
      
      // Parsing URL dan membuat opsi permintaan
      const parsedUrl = new URL(apiUrl);
      
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(responseData);
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode} - ${responseData}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      // Mengirim data
      req.write(postData);
      req.end();
    });
    
    // Parse respons JSON
    const parsedResponse = JSON.parse(response);
    
    if (parsedResponse.candidates && parsedResponse.candidates[0] && parsedResponse.candidates[0].content) {
      const text = parsedResponse.candidates[0].content.parts[0].text;
      
      // Menyimpan respons AI ke memori chat
      require('../handlers/chatMemoryHandler').addMessageToMemory(message.from, 'bot', text);
      await message.reply(text);
      
      // Menyimpan respons AI ke memori chat
      require('../handlers/chatMemoryHandler').addMessageToMemory(message.from, 'bot', text);
    } else {
      console.error('Format respons tidak sesuai yang diharapkan:', parsedResponse);
      await message.reply('❌ Aduh, ada masalah nih pas mikir. Coba tanya lagi nanti ya!');
    }
    
  } catch (error) {
    console.error('Error saat menggunakan Gemini AI:', error);
    await message.reply('❌ Waduh, otak Eka lagi error nih. Coba lagi nanti ya!');
  }
}

/**
 * Menggunakan AI Gartisan untuk menjawab pertanyaan dengan gaya yang lebih kreatif
 */
async function askAIGartisan(message, prompt) {
  try {
    if (!config.features.enableAI) {
      await message.reply('❌ Fitur AI belum diaktifin nih. Coba hubungi admin ya!');
      return;
    }
    
    if (!config.ai.geminiApiKey) {
      await message.reply('❌ API Key Gemini nggak ketemu nih. Coba hubungi admin ya!');
      return;
    }
    
    // Mengirim pesan sedang mengetik
    await message.reply('🎨 Bentar ya, lagi bikin jawaban keren nih...');
    
    // Endpoint untuk model gemini-1.5-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.geminiApiKey}`;
    
    // Mendapatkan konteks chat dari memori lokal
    const chatContext = require('../handlers/chatMemoryHandler').getChatContextForAI(message.from);
    
    // Menambahkan instruksi gaya AI Gartisan dan konteks chat ke prompt
    const enhancedPrompt = `Kamu adalah bot Eka yang dibuat pada tahun 2024, asisten yang sangat kreatif dan artistik. Kamu selalu menggunakan bahasa non-formal dan santai seperti teman ngobrol. Kamu siap menerima pertanyaan tentang kuliah dan topik lainnya. Kamu juga bisa membantu membuat catatan yang lebih bagus dan menyimpannya di Google Keep atau membantu dengan tugas kuliah. Kamu selalu menjawab dengan gaya yang menarik, menggunakan metafora, analogi, dan bahasa yang indah. Kamu juga suka menambahkan sentuhan humor dan kebijaksanaan dalam jawabanmu.

${chatContext ? chatContext + '\n\n' : ''}Berikut pertanyaan/permintaan dari pengguna: ${prompt}`;
    
    // Data permintaan
    const data = {
      contents: [
        {
          parts: [
            {
              text: enhancedPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9, // Lebih tinggi untuk kreativitas
        maxOutputTokens: 1000
      }
    };
    
    console.log(`[LOG] Mengirim permintaan ke AI Gartisan: ${prompt.substring(0, 50)}...`);
    
    // Membuat promise untuk request HTTP
    const response = await new Promise((resolve, reject) => {
      // Membuat permintaan HTTP
      const postData = JSON.stringify(data);
      
      // Parsing URL dan membuat opsi permintaan
      const parsedUrl = new URL(apiUrl);
      
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(responseData);
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode} - ${responseData}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      // Mengirim data
      req.write(postData);
      req.end();
    });
    
    // Parse respons JSON
    const parsedResponse = JSON.parse(response);
    
    if (parsedResponse.candidates && parsedResponse.candidates[0] && parsedResponse.candidates[0].content) {
      const text = parsedResponse.candidates[0].content.parts[0].text;
      await message.reply(`*AI Gartisan:*\n\n${text}`);
    } else {
      console.error('Format respons tidak sesuai yang diharapkan:', parsedResponse);
      await message.reply('❌ Aduh, ada masalah nih pas bikin jawaban keren. Coba lagi nanti ya!');
    }
    
  } catch (error) {
    console.error('Error saat menggunakan AI Gartisan:', error);
    await message.reply('❌ Waduh, sisi kreatif Eka lagi error nih. Coba lagi nanti ya!');
  }
}

/**
 * Menganalisis gambar menggunakan Gemini Vision
 */
async function analyzeImage(message, prompt) {
  try {
    if (!config.features.enableAI) {
      await message.reply('❌ Fitur AI belum diaktifin nih. Coba hubungi admin ya!');
      return;
    }
    
    if (!config.ai.geminiApiKey) {
      await message.reply('❌ API Key Gemini nggak ketemu nih. Coba hubungi admin ya!');
      return;
    }
    
    // Memeriksa apakah ada gambar yang dikirim
    const quotedMessage = await message.getQuotedMessage();
    if (!quotedMessage) {
      await message.reply('❌ Eh, balas dulu dong gambarnya yang mau dianalisis!');
      return;
    }
    
    // Memeriksa apakah pesan yang dibalas mengandung gambar
    const media = await quotedMessage.downloadMedia();
    if (!media || !media.mimetype.startsWith('image/')) {
      await message.reply('❌ Itu bukan gambar kak. Tolong balas pesan yang ada gambarnya ya!');
      return;
    }
    
    // Mengirim pesan sedang mengetik
    await message.reply('🔍 Bentar ya, lagi liatin gambarnya...');
    
    // Mengonversi base64 ke buffer
    const imageBuffer = Buffer.from(media.data, 'base64');
    
    // Endpoint untuk model gemini-1.5-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.geminiApiKey}`;
    
    // Menambahkan instruksi persona ke prompt
    const enhancedPrompt = `Kamu adalah bot Eka yang dibuat pada tahun 2024. Kamu selalu menggunakan bahasa non-formal dan santai seperti teman ngobrol. Kamu siap menerima pertanyaan tentang kuliah dan topik lainnya. Kamu juga bisa membantu membuat catatan yang lebih bagus dan menyimpannya di Google Keep atau membantu dengan tugas kuliah. ${prompt || 'Coba lihat gambar ini dan ceritain apa yang kamu lihat ya.'}`;
    
    // Data permintaan dengan gambar
    const data = {
      contents: [
        {
          parts: [
            {
              text: enhancedPrompt
            },
            {
              inline_data: {
                mime_type: media.mimetype,
                data: media.data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024
      }
    };
    
    console.log(`[LOG] Mengirim permintaan analisis gambar ke Gemini`);
    
    // Membuat promise untuk request HTTP
    const response = await new Promise((resolve, reject) => {
      // Membuat permintaan HTTP
      const postData = JSON.stringify(data);
      
      // Parsing URL dan membuat opsi permintaan
      const parsedUrl = new URL(apiUrl);
      
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(responseData);
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode} - ${responseData}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      // Mengirim data
      req.write(postData);
      req.end();
    });
    
    // Parse respons JSON
    const parsedResponse = JSON.parse(response);
    
    if (parsedResponse.candidates && parsedResponse.candidates[0] && parsedResponse.candidates[0].content) {
      const text = parsedResponse.candidates[0].content.parts[0].text;
      await message.reply(`*Hasil Liatin Gambar:*\n\n${text}`);
    } else {
      console.error('Format respons tidak sesuai yang diharapkan:', parsedResponse);
      await message.reply('❌ Aduh, ada masalah nih pas liatin gambarnya. Coba lagi nanti ya!');
    }
    
  } catch (error) {
    console.error('Error saat menganalisis gambar:', error);
    await message.reply('❌ Waduh, ada error nih pas liatin gambarnya. Coba lagi nanti ya!');
  }
}

module.exports = {
  askGemini,
  askAIGartisan,
  analyzeImage
};