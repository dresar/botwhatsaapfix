const fs = require('fs-extra');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const { PDFDocument } = require('pdf-lib');
const Tesseract = require('tesseract.js');
const { Document, Packer, Paragraph, TextRun } = require('docx');

// Direktori untuk menyimpan file sementara
const TEMP_DIR = path.join(__dirname, '../temp');

/**
 * Mengonversi file PDF ke Word
 * Catatan: Implementasi sederhana karena konversi PDF ke Word yang akurat memerlukan library khusus
 */
async function pdfToWord(message) {
  try {
    // Periksa apakah pesan memiliki media
    if (!message.hasMedia) {
      await message.reply('⚠️ Silakan lampirkan file PDF yang ingin dikonversi!');
      return;
    }

    // Mendapatkan media dari pesan
    const media = await message.downloadMedia();
    
    // Periksa apakah media adalah file PDF
    if (!media.mimetype.includes('application/pdf')) {
      await message.reply('⚠️ File yang dilampirkan bukan PDF!');
      return;
    }

    await message.reply('⏳ Sedang mengonversi PDF ke Word, mohon tunggu...');

    // Simpan file PDF ke direktori sementara
    const pdfFilename = `pdf_${Date.now()}.pdf`;
    const pdfPath = path.join(TEMP_DIR, pdfFilename);
    fs.writeFileSync(pdfPath, Buffer.from(media.data, 'base64'));

    // Nama file output Word
    const docxFilename = pdfFilename.replace('.pdf', '.docx');
    const docxPath = path.join(TEMP_DIR, docxFilename);

    // Buat dokumen Word sederhana dengan pesan placeholder
    // Catatan: Ini hanya implementasi sederhana, tidak mengekstrak konten dari PDF
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Konversi PDF ke Word",
                bold: true,
                size: 28
              })
            ],
            alignment: "CENTER"
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Catatan: Ini adalah implementasi sederhana. Untuk konversi PDF ke Word yang akurat, diperlukan library khusus.",
                size: 24
              })
            ],
            spacing: {
              before: 200,
              after: 200
            }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `File asli: ${pdfFilename}`,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Waktu konversi: ${new Date().toLocaleString()}`,
                size: 24
              })
            ]
          })
        ]
      }]
    });

    // Buat file Word
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(docxPath, buffer);

    // Baca file Word yang dihasilkan
    const docxBuffer = fs.readFileSync(docxPath);
    const docxMedia = new MessageMedia(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      docxBuffer.toString('base64'),
      docxFilename
    );

    // Kirim file Word
    await message.reply(docxMedia, undefined, {
      caption: '📄 Hasil konversi PDF ke Word (implementasi sederhana)'
    });

    // Hapus file sementara
    fs.unlinkSync(pdfPath);
    fs.unlinkSync(docxPath);
  } catch (error) {
    console.error('Error saat mengonversi PDF ke Word:', error);
    await message.reply('❌ Terjadi kesalahan saat mengonversi file. Pastikan file PDF valid.');
  }
}

/**
 * Mengonversi file Word ke PDF
 */
async function wordToPdf(message) {
  try {
    // Periksa apakah pesan memiliki media
    if (!message.hasMedia) {
      await message.reply('⚠️ Silakan lampirkan file Word yang ingin dikonversi!');
      return;
    }

    // Mendapatkan media dari pesan
    const media = await message.downloadMedia();
    
    // Periksa apakah media adalah file Word
    if (!media.mimetype.includes('word') && !media.mimetype.includes('docx')) {
      await message.reply('⚠️ File yang dilampirkan bukan Word!');
      return;
    }

    await message.reply('⏳ Sedang mengonversi Word ke PDF, mohon tunggu...');

    // Simpan file Word ke direktori sementara
    const docxFilename = `docx_${Date.now()}.docx`;
    const docxPath = path.join(TEMP_DIR, docxFilename);
    fs.writeFileSync(docxPath, Buffer.from(media.data, 'base64'));

    // Nama file output PDF
    const pdfFilename = docxFilename.replace('.docx', '.pdf');
    const pdfPath = path.join(TEMP_DIR, pdfFilename);

    // Buat dokumen PDF baru
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    
    // Tulis teks placeholder (implementasi sederhana)
    // Untuk implementasi lengkap, perlu library tambahan untuk parsing DOCX
    page.drawText('Konversi dari dokumen Word', {
      x: 50,
      y: page.getHeight() - 50,
      size: 12,
    });

    // Simpan dokumen PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(pdfPath, pdfBytes);

    // Baca file PDF yang dihasilkan
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfMedia = new MessageMedia(
      'application/pdf',
      pdfBuffer.toString('base64'),
      pdfFilename
    );

    // Kirim file PDF
    await message.reply(pdfMedia, undefined, {
      caption: '📄 Hasil konversi Word ke PDF'
    });

    // Hapus file sementara
    fs.unlinkSync(docxPath);
    fs.unlinkSync(pdfPath);
  } catch (error) {
    console.error('Error saat mengonversi Word ke PDF:', error);
    await message.reply('❌ Terjadi kesalahan saat mengonversi file. Pastikan file Word valid.');
  }
}

/**
 * Mengonversi gambar menjadi teks menggunakan OCR
 */
async function imageToText(message) {
  try {
    // Periksa apakah pesan memiliki media
    if (!message.hasMedia) {
      await message.reply('⚠️ Silakan lampirkan gambar yang ingin dikonversi ke teks!');
      return;
    }

    // Mendapatkan media dari pesan
    const media = await message.downloadMedia();
    
    // Periksa apakah media adalah gambar
    if (!media.mimetype.includes('image')) {
      await message.reply('⚠️ File yang dilampirkan bukan gambar!');
      return;
    }

    await message.reply('⏳ Sedang mengekstrak teks dari gambar, mohon tunggu...');

    // Simpan gambar ke direktori sementara
    const imageFilename = `image_${Date.now()}.png`;
    const imagePath = path.join(TEMP_DIR, imageFilename);
    fs.writeFileSync(imagePath, Buffer.from(media.data, 'base64'));

    // Gunakan Tesseract.js untuk OCR
    const result = await Tesseract.recognize(imagePath, 'eng');
    const extractedText = result.data.text;

    // Kirim teks yang diekstrak
    if (extractedText.trim()) {
      await message.reply(`📝 *Teks yang diekstrak dari gambar:*\n\n${extractedText}`);
    } else {
      await message.reply('⚠️ Tidak dapat menemukan teks dalam gambar.');
    }

    // Hapus file sementara
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error('Error saat mengonversi gambar ke teks:', error);
    await message.reply('❌ Terjadi kesalahan saat mengekstrak teks dari gambar.');
  }
}

/**
 * Mengompres file
 */
async function compressFile(message) {
  try {
    // Periksa apakah pesan memiliki media
    if (!message.hasMedia) {
      await message.reply('⚠️ Silakan lampirkan file yang ingin dikompresi!');
      return;
    }

    // Mendapatkan media dari pesan
    const media = await message.downloadMedia();
    
    await message.reply('⏳ Sedang mengompres file, mohon tunggu...');

    // Implementasi sederhana untuk kompresi file
    // Untuk implementasi lengkap, perlu library tambahan sesuai jenis file
    
    // Contoh implementasi sederhana untuk PDF
    if (media.mimetype.includes('pdf')) {
      // Simpan file PDF ke direktori sementara
      const originalFilename = `original_${Date.now()}.pdf`;
      const originalPath = path.join(TEMP_DIR, originalFilename);
      fs.writeFileSync(originalPath, Buffer.from(media.data, 'base64'));

      // Nama file output yang dikompresi
      const compressedFilename = `compressed_${Date.now()}.pdf`;
      const compressedPath = path.join(TEMP_DIR, compressedFilename);

      // Baca PDF yang ada dan buat PDF baru dengan kompresi
      const pdfBytes = fs.readFileSync(originalPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const compressedPdfBytes = await pdfDoc.save({ compress: true });
      fs.writeFileSync(compressedPath, compressedPdfBytes);

      // Baca file PDF yang dikompresi
      const compressedBuffer = fs.readFileSync(compressedPath);
      const compressedMedia = new MessageMedia(
        'application/pdf',
        compressedBuffer.toString('base64'),
        compressedFilename
      );

      // Kirim file yang dikompresi
      await message.reply(compressedMedia, undefined, {
        caption: '📄 File PDF yang telah dikompresi'
      });

      // Hapus file sementara
      fs.unlinkSync(originalPath);
      fs.unlinkSync(compressedPath);
    } else {
      // Untuk jenis file lain, kirim kembali file asli dengan pesan
      await message.reply(media, undefined, {
        caption: '⚠️ Kompresi untuk jenis file ini belum didukung.'
      });
    }
  } catch (error) {
    console.error('Error saat mengompres file:', error);
    await message.reply('❌ Terjadi kesalahan saat mengompres file.');
  }
}

/**
 * Mengonversi PDF ke JPG menggunakan iLoveAPI
 */
async function pdfToJpg(message) {
  try {
    // Periksa apakah pesan memiliki media
    if (!message.hasMedia) {
      await message.reply('⚠️ Silakan lampirkan file PDF yang ingin dikonversi ke JPG!');
      return;
    }

    // Mendapatkan media dari pesan
    const media = await message.downloadMedia();
    
    // Periksa apakah media adalah file PDF
    if (!media.mimetype.includes('application/pdf')) {
      await message.reply('⚠️ File yang dilampirkan bukan PDF!');
      return;
    }

    await message.reply('⏳ Sedang mengonversi PDF ke JPG menggunakan iLoveAPI, mohon tunggu...');

    // Simpan file PDF ke direktori sementara
    const pdfFilename = `pdf_${Date.now()}.pdf`;
    const pdfPath = path.join(TEMP_DIR, pdfFilename);
    fs.writeFileSync(pdfPath, Buffer.from(media.data, 'base64'));

    // Konfigurasi API iLoveAPI
    // Gunakan fetch API global
    const fetch = global.fetch;
    const PROJECT_PUBLIC_KEY = 'project_public_166aaa516d559111e50aec6cd4656f52_VCX64330473d4fe61de0849c67a532dc5907b';
    const PROJECT_SECRET_KEY = 'secret_key_274295accf4161a05c1e636bb3edbf04_0F02Ud0b87cdf09a66b5d5438d21cd35dd3b2';

    // Langkah 1: Mendapatkan token
    const authResponse = await fetch('https://api.ilovepdf.com/v1/auth', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PROJECT_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_key: PROJECT_PUBLIC_KEY
      })
    });

    const authData = await authResponse.json();
    const token = authData.token;

    // Langkah 2: Membuat task baru
    const taskResponse = await fetch('https://api.ilovepdf.com/v1/pdftojpg', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const taskData = await taskResponse.json();
    const taskId = taskData.task;

    // Langkah 3: Upload file
     // Karena form-data tidak tersedia, kita gunakan pendekatan alternatif
     // Menggunakan base64 encoding untuk file
     const fileContent = fs.readFileSync(pdfPath);
     const fileBase64 = fileContent.toString('base64');
     
     const uploadResponse = await fetch('https://api.ilovepdf.com/v1/upload', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         task: taskId,
         file: fileBase64,
         filename: pdfFilename
       })
     });

    const uploadData = await uploadResponse.json();
    const serverFilename = uploadData.server_filename;

    // Langkah 4: Proses konversi
    await fetch('https://api.ilovepdf.com/v1/pdftojpg/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task: taskId,
        tool: 'pdftojpg',
        files: [{
          server_filename: serverFilename,
          filename: pdfFilename
        }]
      })
    });

    // Langkah 5: Download hasil
    const downloadResponse = await fetch(`https://api.ilovepdf.com/v1/download/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Dapatkan data sebagai array buffer
    const downloadBuffer = await downloadResponse.arrayBuffer();
    
    // Simpan hasil ke direktori sementara
    const zipFilename = `result_${Date.now()}.zip`;
    const zipPath = path.join(TEMP_DIR, zipFilename);
    fs.writeFileSync(zipPath, Buffer.from(downloadBuffer));

    // Baca file ZIP yang dihasilkan
    const zipBuffer = fs.readFileSync(zipPath);
    const zipMedia = new MessageMedia(
      'application/zip',
      zipBuffer.toString('base64'),
      zipFilename
    );

    // Kirim file ZIP hasil konversi
    await message.reply(zipMedia, undefined, {
      caption: '📄 Hasil konversi PDF ke JPG (dalam format ZIP)'
    });

    // Hapus file sementara
    fs.unlinkSync(pdfPath);
    fs.unlinkSync(zipPath);
  } catch (error) {
    console.error('Error saat mengonversi PDF ke JPG:', error);
    await message.reply('❌ Terjadi kesalahan saat mengonversi file. Pastikan file PDF valid dan API key benar.');
  }
}

module.exports = {
  pdfToWord,
  wordToPdf,
  imageToText,
  compressFile,
  pdfToJpg
};