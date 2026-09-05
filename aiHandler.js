const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const { saveAIInteraction } = require('./database');

/**
 * Inisialisasi Google Generative AI (Gemini)
 */
const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);

/**
 * Fungsi untuk bertanya ke Gemini (text-based AI)
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} prompt - Pertanyaan untuk AI
 * @returns {Promise<string>} - Respons dari AI
 */
async function askGemini(message, prompt) {
  try {
    if (!config.features.enableAI) {
      return "Fitur AI tidak diaktifkan. Silakan aktifkan di file konfigurasi.";
    }

    if (!config.ai.geminiApiKey) {
      return "API key Gemini tidak ditemukan. Silakan tambahkan di file .env";
    }

    // Kirim pesan sedang mengetik
    const chat = await message.getChat();
    chat.sendStateTyping();

    // Dapatkan model Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Kirim prompt ke Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Simpan interaksi ke database
    const chatId = message.from;
    await saveAIInteraction(chatId, prompt, text, 'Gemini');

    return text;
  } catch (error) {
    console.error('Error saat menggunakan Gemini:', error);
    return `Terjadi kesalahan saat berkomunikasi dengan Gemini: ${error.message}`;
  }
}

/**
 * Fungsi untuk bertanya ke AI Gartisan (text-based AI)
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} prompt - Pertanyaan untuk AI
 * @returns {Promise<string>} - Respons dari AI
 */
async function askAIGartisan(message, prompt) {
  try {
    if (!config.features.enableAI) {
      return "Fitur AI tidak diaktifkan. Silakan aktifkan di file konfigurasi.";
    }

    if (!config.ai.aiGartisanApiKey) {
      return "API key AI Gartisan tidak ditemukan. Silakan tambahkan di file .env";
    }

    // Kirim pesan sedang mengetik
    const chat = await message.getChat();
    chat.sendStateTyping();

    // Kirim prompt ke AI Gartisan
    const response = await axios.post(
      'https://api.aigartisan.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Kamu adalah asisten AI yang membantu.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.ai.aiGartisanApiKey}`
        }
      }
    );

    const text = response.data.choices[0].message.content;

    // Simpan interaksi ke database
    const chatId = message.from;
    await saveAIInteraction(chatId, prompt, text, 'AI Gartisan');

    return text;
  } catch (error) {
    console.error('Error saat menggunakan AI Gartisan:', error);
    return `Terjadi kesalahan saat berkomunikasi dengan AI Gartisan: ${error.message}`;
  }
}

/**
 * Fungsi untuk menganalisis gambar dengan Gemini Vision
 * @param {object} message - Objek pesan WhatsApp
 * @param {string} imagePath - Path ke file gambar
 * @param {string} prompt - Pertanyaan tentang gambar (opsional)
 * @returns {Promise<string>} - Hasil analisis gambar
 */
async function analyzeImageWithAI(message, imagePath, prompt = "Jelaskan apa yang ada dalam gambar ini secara detail") {
  try {
    if (!config.features.enableAI) {
      return "Fitur AI tidak diaktifkan. Silakan aktifkan di file konfigurasi.";
    }

    if (!config.ai.geminiApiKey) {
      return "API key Gemini tidak ditemukan. Silakan tambahkan di file .env";
    }

    if (!fs.existsSync(imagePath)) {
      return "File gambar tidak ditemukan.";
    }

    // Kirim pesan sedang mengetik
    const chat = await message.getChat();
    chat.sendStateTyping();

    // Baca file gambar sebagai base64
    const imageData = fs.readFileSync(imagePath);
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';

    // Dapatkan model Gemini Vision
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Kirim gambar dan prompt ke Gemini Vision
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: Buffer.from(imageData).toString('base64'),
          mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Simpan interaksi ke database
    const chatId = message.from;
    await saveAIInteraction(chatId, `[Analisis Gambar] ${prompt}`, text, 'Gemini Vision');

    return text;
  } catch (error) {
    console.error('Error saat menganalisis gambar dengan AI:', error);
    return `Terjadi kesalahan saat menganalisis gambar: ${error.message}`;
  }
}

module.exports = {
  askGemini,
  askAIGartisan,
  analyzeImageWithAI
};