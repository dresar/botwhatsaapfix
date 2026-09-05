/**
 * Handler untuk integrasi dengan Groq API
 */

const https = require('https');
const config = require('../config');

/**
 * Mengirim pertanyaan ke Groq API menggunakan model Llama-3
 */
async function askGroq(message, prompt) {
  try {
    // Periksa apakah fitur AI diaktifkan
    if (!config.features.enableAI) {
      await message.reply('❌ Fitur AI belum diaktifin nih. Coba hubungi admin ya!');
      return;
    }
    
    // Periksa apakah API key Groq tersedia
    if (!process.env.groqPI_KEY) {
      await message.reply('❌ API Key Groq belum diatur nih. Coba hubungi admin ya!');
      return;
    }
    
    // Kirim pesan "sedang mengetik"
    await message.reply('🤖 Bentar ya, lagi mikir...');
    
    // Endpoint untuk menggunakan model Llama-3-8b-8192
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    // Mendapatkan konteks chat dari memori lokal
    const chatMemoryHandler = require('../handlers/chatMemoryHandler');
    const chatContext = chatMemoryHandler.getChatContextForAI(message.from);
    
    // Menyiapkan pesan sistem dengan konteks chat
    const systemContent = `Kamu adalah bot Eka yang dibuat tahun 2024. Kamu menggunakan bahasa non-formal dan bisa menjawab pertanyaan kuliah serta membantu mencatat dan integrasi dengan Google Keep.${chatContext ? '\n\nBerikut adalah percakapan sebelumnya:\n' + chatContext : ''}`;
    
    // Data permintaan untuk model Llama-3-8b-8192
    const data = {
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: systemContent
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    
    // Membuat permintaan HTTP menggunakan Promise
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const parsedUrl = new URL(apiUrl);
      
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.groqPI_KEY}`,
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
            try {
              const jsonResponse = JSON.parse(responseData);
              const aiResponse = jsonResponse.choices[0].message.content;
              
              // Kirim respons AI ke pengguna
              message.reply(aiResponse);
              
              // Menyimpan respons AI ke memori chat
              require('../handlers/chatMemoryHandler').addMessageToMemory(message.from, 'bot', aiResponse);
              
              resolve(aiResponse);
            } catch (error) {
              console.error('❌ Error saat memproses respons JSON:', error);
              message.reply('❌ Aduh, ada masalah nih pas mikir. Coba tanya lagi nanti ya!');
              reject(error);
            }
          } else {
            console.error(`❌ Error dari Groq API. Status: ${res.statusCode}`);
            console.error('Respons error:', responseData);
            message.reply('❌ Waduh, otak Eka lagi error nih. Coba lagi nanti ya!');
            reject(new Error(`API Error: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Error saat menghubungi Groq API:', error);
        message.reply('❌ Gagal terhubung ke Groq API. Coba lagi nanti ya!');
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
    
  } catch (error) {
    console.error('❌ Error saat menggunakan Groq API:', error);
    await message.reply('❌ Waduh, ada error nih. Coba lagi nanti ya!');
    return null;
  }
}

module.exports = {
  askGroq
};