// Tidak perlu mengimpor Client karena kita akan menggunakan metode yang tersedia di message dan chat

/**
 * Menampilkan menu perintah yang tersedia dengan tampilan modern
 */
async function showMenu(message) {
  try {
    const menuText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🤖 *WHATSAPP BOT MENU* 🤖  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

` +

    `╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  📝 *PENGINGAT TUGAS*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !tambah_tugas ➤ Tambah tugas baru
` +
    `│ • !list_tugas ➤ Lihat semua tugas
` +
    `│ • !ingatkan_tugas ➤ Atur pengingat
` +
    
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  🤖 *KECERDASAN BUATAN*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !gemini ➤ Tanya Gemini AI (tidak tersedia dalam versi sederhana)
` +
    `│ • !groq ➤ Tanya Llama AI via Groq
` +
    `│ • !gartisan ➤ Tanya AI Gartisan (tidak tersedia dalam versi sederhana)
` +
    `│ • !analisis_gambar ➤ Analisis gambar dengan AI (tidak tersedia dalam versi sederhana)
` +
    
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  ☁️ *GOOGLE SERVICES*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !simpan_gambar [folder] [subfolder] ➤ Simpan gambar ke Drive (tidak tersedia dalam versi sederhana)
` +
    `│ • !list_gambar [limit/folder] [subfolder] ➤ Lihat gambar di Drive (tidak tersedia dalam versi sederhana)
` +
    `│ • !hapus_gambar [file_id] ➤ Hapus gambar dari Drive (tidak tersedia dalam versi sederhana)
` +
    `│ • !buat_catatan ➤ Buat catatan di Keep (tidak tersedia dalam versi sederhana)
` +
    `│ • !list_catatan ➤ Lihat catatan di Keep (tidak tersedia dalam versi sederhana)
` +
    
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  👥 *GRUP COMMANDS*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !tagall ➤ Mention semua anggota grup
` +
    `│ • !tagall [pesan] ➤ Mention dengan pesan
` +
    `│ • !hapus_memori ➤ Hapus memori chat
` +
    
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  👑 *ADMIN COMMANDS*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !kick ➤ Keluarkan anggota
` +
    `│ • !broadcast ➤ Kirim pengumuman
` +
    `│ • !stats ➤ Statistik bot
` +
    `│ • !mute ➤ Nonaktifkan bot
` +
    `│ • !unmute ➤ Aktifkan bot
` +
    `│ • !ban ➤ Blokir anggota
` +
    `│ • !unban ➤ Buka blokir anggota
` +
    
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  📄 *PENGOLAHAN FILE*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !pdf_to_word ➤ Konversi PDF ke Word
` +
    `│ • !word_to_pdf ➤ Konversi Word ke PDF
` +
    `│ • !image_to_text ➤ Ekstrak teks dari gambar
` +
    `│ • !compress_file ➤ Kompres file
` +
    `│ • !pdf_to_jpg ➤ Konversi PDF ke JPG
` +
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  🔗 *TOOLS & UTILITAS*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !singkat_url ➤ Singkatkan URL panjang
` +
    `│ • !qrcode ➤ Buat QR Code dari teks/URL
` +
    `│ • !gempa ➤ Info gempa terkini dari BMKG
` +
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  😂 *HIBURAN*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !meme ➤ Dapatkan meme acak
` +
    `│ • !joke ➤ Dapatkan lelucon acak
` +
    `│ • !dadjoke ➤ Dapatkan dad joke acak
` +
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  🎮 *GAME*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !math ➤ Permainan matematika
` +
    `│ • !siapakahaku ➤ Tebak tokoh
` +
    `│ • !susunkata ➤ Susun kata acak
` +
    `│ • !tebakkata ➤ Tebak kata dari petunjuk
` +
    `│ • !tekateki ➤ Teka-teki lucu
` +
    `│ • !asahotak ➤ Asah otak dengan tebakan
` +
    `│ • !caklontong ➤ Kuis Cak Lontong
` +
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  🌸 *WEEBS*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !randomloli ➤ Gambar anime random
` +
    `│ • !randomselfie ➤ Selfie anime random
` +
    `│ • !randomwaifu ➤ Waifu anime random
` +
    `│ • !topanime ➤ Daftar anime terpopuler
` +
    `│ • !otakudesu [judul] ➤ Cari anime
` +
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  🎨 *MAKER*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !sticker ➤ Buat stiker dari gambar
` +
    `│ • !stickermeme ➤ Buat stiker dengan teks
` +
    `│ • !iphonechat ➤ Buat fake chat iPhone
` +
    `│ • !fakengl ➤ Buat fake pesan NGL
` +
    `│ • !namaninja ➤ Buat nama ninja
` +
    `│ • !namapurba ➤ Buat nama purba
` +
    `│ • !brat ➤ Ubah teks jadi gaya BRAT
` +
    `│ • !bratgif ➤ Dapatkan GIF BRAT random
` +
    `│ • !emojimix ➤ Gabungkan dua emoji
` +
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  🎨 *MEDIA & LAINNYA*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `│ • !translate ➤ Terjemahkan teks
` +
    `│ • !weather ➤ Info cuaca
` +
    `│ • !wikipedia ➤ Cari info di Wikipedia
` +
    `│ • !help ➤ Bantuan perintah
` +
    
    `
╭━━━━━━━━━━━━━━━━━━━━━╮
` +
    `┃  ℹ️ *INFO*  ┃
` +
    `╰━━━━━━━━━━━━━━━━━━━━━╯
` +
    `Untuk detail perintah, ketik:
` +
    `!help [nama_perintah]
` +
    `Contoh: !help sticker
` +
    `
⚠️ *CATATAN:* Beberapa fitur tidak tersedia dalam versi sederhana ini karena keterbatasan dependensi.`;
    
    await message.reply(menuText);
  } catch (error) {
    console.error('Error saat menampilkan menu:', error);
    await message.reply('❌ Terjadi kesalahan saat menampilkan menu.');
  }
}

/**
 * Menampilkan bantuan tentang perintah tertentu dengan tampilan modern
 */
async function showHelp(message, command) {
  try {
    if (!command) {
      await message.reply(`
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  ⚠️ *FORMAT SALAH*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Gunakan: !help [perintah]
Contoh: !help sticker`);
      return;
    }
    
    let helpText = '';
    
    switch (command.toLowerCase()) {
      case 'tambah_tugas':
      case 'add_tugas':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  📝 *TAMBAH TUGAS*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menambahkan tugas baru ke daftar.

*Format:* !tambah_tugas [deskripsi tugas]
*Contoh:* !tambah_tugas Kerjakan PR Matematika

*Catatan:* Tugas akan disimpan untuk grup ini.`;
        break;
        
      case 'list_tugas':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  📋 *DAFTAR TUGAS*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menampilkan semua tugas yang belum selesai.

*Format:* !list_tugas

*Catatan:* Hanya menampilkan tugas untuk grup ini.`;
        break;
        
      case 'sticker':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🖼️ *BUAT STIKER*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Membuat stiker dari gambar.

*Format:* Kirim gambar dengan caption !sticker

*Catatan:* Fitur ini tidak tersedia dalam versi sederhana.`;
        break;
        
      case 'pdf_to_word':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  📄 *PDF KE WORD*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mengonversi file PDF ke format Word.

*Format:* Kirim file PDF dengan caption !pdf_to_word

*Catatan:* Konversi sederhana, hasil mungkin tidak sempurna untuk PDF kompleks.`;
        break;
        
      case 'word_to_pdf':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  📄 *WORD KE PDF*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mengonversi file Word ke format PDF.

*Format:* Kirim file Word dengan caption !word_to_pdf

*Catatan:* Konversi sederhana, hasil mungkin tidak sempurna untuk dokumen kompleks.`;
        break;
        
      case 'image_to_text':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🔍 *GAMBAR KE TEKS*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mengekstrak teks dari gambar menggunakan OCR.

*Format:* Kirim gambar dengan caption !image_to_text

*Catatan:* Akurasi tergantung pada kualitas gambar dan kejelasan teks.`;
        break;
        
      case 'compress_file':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🗜️ *KOMPRES FILE*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mengompres file untuk mengurangi ukurannya.

*Format:* Kirim file dengan caption !compress_file

*Catatan:* Saat ini hanya mendukung kompresi file PDF.`;
        break;
        
      case 'gemini':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🤖 *GEMINI AI*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Bertanya kepada Gemini AI.

*Format:* !gemini [pertanyaan]
*Contoh:* !gemini Apa itu kecerdasan buatan?

*Catatan:* Fitur ini tidak tersedia dalam versi sederhana.`;
        break;
        
      case 'groq':
      case 'llama':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🦙 *LLAMA AI via GROQ*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Bertanya kepada Llama AI melalui Groq API.

*Format:* !groq [pertanyaan]
*Contoh:* !groq Apa itu kecerdasan buatan?

*Alternatif:* Kamu juga bisa menggunakan !llama [pertanyaan]`;
        break;
        
      case 'tagall':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  👥 *MENTION SEMUA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menyebut semua anggota dalam grup.

*Format:* !tagall [pesan opsional]
*Contoh:* !tagall Harap perhatian semuanya

*Catatan:* Perintah ini hanya bisa digunakan di dalam grup.`;
        break;
        
      case 'hapus_memori':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🧹 *HAPUS MEMORI*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menghapus memori chat untuk percakapan dengan AI.

*Format:* !hapus_memori

*Catatan:* Perintah ini akan menghapus semua riwayat percakapan yang digunakan oleh AI untuk mengingat konteks percakapan sebelumnya.`;
        break;
        
      case 'wikipedia':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  📚 *WIKIPEDIA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mencari informasi di Wikipedia.

*Format:* !wikipedia [kata kunci]
*Contoh:* !wikipedia Indonesia

*Catatan:* Hasil pencarian akan menampilkan ringkasan artikel dari Wikipedia.`;
        break;
        
      case 'pdf_to_jpg':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🖼️ *PDF KE JPG*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mengonversi file PDF ke format JPG menggunakan iLoveAPI.

*Format:* Kirim file PDF dengan caption !pdf_to_jpg

*Catatan:* Hasil konversi akan dikirim dalam bentuk file ZIP yang berisi gambar JPG.`;
        break;
        
      // Kasus groq/llama sudah ditangani sebelumnya
        break;
        
      // Fitur URL Shortener dan QR Code
      case 'simpan_gambar':
      case 'save_image':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🖼️ *SIMPAN GAMBAR KE DRIVE*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menyimpan gambar ke Google Drive dengan folder tertentu.

*Format:* Kirim gambar dengan caption !simpan_gambar [folder] [subfolder]
*Contoh:* 
- !simpan_gambar (menyimpan ke root)
- !simpan_gambar Foto (menyimpan ke folder Foto)
- !simpan_gambar Foto Liburan (menyimpan ke subfolder Liburan dalam folder Foto)

*Catatan:* Folder akan dibuat otomatis jika belum ada.`;
        break;

      case 'list_gambar':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  📋 *DAFTAR GAMBAR DI DRIVE*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menampilkan daftar gambar yang tersimpan di Google Drive.

*Format:* !list_gambar [limit/folder] [subfolder]
*Contoh:* 
- !list_gambar (menampilkan 10 gambar teratas)
- !list_gambar 20 (menampilkan 20 gambar teratas)
- !list_gambar Foto (menampilkan gambar di folder Foto)
- !list_gambar Foto Liburan (menampilkan gambar di subfolder Liburan dalam folder Foto)

*Catatan:* Limit default adalah 10 gambar.`;
        break;

      case 'hapus_gambar':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🗑️ *HAPUS GAMBAR DARI DRIVE*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menghapus gambar dari Google Drive berdasarkan ID file.

*Format:* !hapus_gambar [file_id]
*Contoh:* !hapus_gambar 1a2b3c4d5e6f7g8h9i0j

*Catatan:* File ID dapat dilihat dari hasil !list_gambar.`;
        break;

      case 'singkat_url':
      case 'short_url':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🔗 *SINGKAT URL*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menyingkat URL panjang menjadi URL pendek.

*Format:* !singkat_url [url]
*Contoh:* !singkat_url https://example.com/halaman-dengan-url-yang-sangat-panjang

*Catatan:* URL harus dimulai dengan http:// atau https://`;
        break;
        
      case 'qrcode':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  📱 *QR CODE*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Membuat QR Code dari URL atau teks.

*Format:* !qrcode [url atau teks]
*Contoh:* !qrcode https://example.com atau !qrcode Halo Dunia`;
        break;
        
      // Fitur Info Gempa
      case 'gempa':
      case 'info_gempa':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌋 *INFO GEMPA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menampilkan informasi gempa terkini dari BMKG.

*Format:* !gempa

*Catatan:* Data diambil langsung dari website BMKG.`;
        break;
        
      // Fitur Meme & Lelucon
      case 'meme':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🖼️ *MEME ACAK*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menampilkan meme acak dari Reddit.

*Format:* !meme`;
        break;
        
      case 'joke':
      case 'lelucon':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  😂 *LELUCON ACAK*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menampilkan lelucon acak dalam bahasa Inggris.

*Format:* !joke atau !lelucon`;
        break;
        
      case 'dadjoke':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  👨 *DAD JOKE*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menampilkan dad joke acak dalam bahasa Inggris.

*Format:* !dadjoke`;
        break;
        
      // Game commands
      case 'math':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎮 *MATH GAME*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Permainan matematika sederhana.

*Format:* !math

*Catatan:* Jawab langsung dengan angka hasil perhitungan.`;
        break;
        
      case 'siapakahaku':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎮 *SIAPAKAH AKU*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Permainan tebak tokoh dari petunjuk.

*Format:* !siapakahaku

*Catatan:* Jawab langsung dengan nama tokoh yang dimaksud.`;
        break;
        
      case 'susunkata':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎮 *SUSUN KATA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Permainan menyusun kata dari huruf acak.

*Format:* !susunkata

*Catatan:* Jawab langsung dengan kata yang benar.`;
        break;
        
      case 'tebakkata':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎮 *TEBAK KATA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Permainan tebak kata dari petunjuk.

*Format:* !tebakkata

*Catatan:* Jawab langsung dengan kata yang dimaksud.`;
        break;
        
      case 'tekateki':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎮 *TEKA-TEKI*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Permainan teka-teki lucu.

*Format:* !tekateki

*Catatan:* Jawab langsung dengan jawaban yang benar.`;
        break;
        
      case 'asahotak':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎮 *ASAH OTAK*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Permainan asah otak dengan tebakan.

*Format:* !asahotak

*Catatan:* Jawab langsung dengan jawaban yang benar.`;
        break;
        
      case 'caklontong':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎮 *CAK LONTONG*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Kuis Cak Lontong dengan jawaban yang tidak terduga.

*Format:* !caklontong

*Catatan:* Jawab langsung dengan jawaban yang benar.`;
        break;
        
      // Weebs commands
      case 'randomloli':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌸 *RANDOM LOLI*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mendapatkan gambar anime random.

*Format:* !randomloli

*Catatan:* Gambar diambil dari waifu.pics API.`;
        break;
        
      case 'randomselfie':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌸 *RANDOM SELFIE*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mendapatkan gambar selfie anime random.

*Format:* !randomselfie

*Catatan:* Gambar diambil dari waifu.pics API.`;
        break;
        
      case 'randomwaifu':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌸 *RANDOM WAIFU*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mendapatkan gambar waifu anime random.

*Format:* !randomwaifu

*Catatan:* Gambar diambil dari waifu.pics API.`;
        break;
        
      case 'topanime':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌸 *TOP ANIME*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mendapatkan daftar anime terpopuler.

*Format:* !topanime

*Catatan:* Data diambil dari Jikan API.`;
        break;
        
      case 'otakudesu':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌸 *OTAKUDESU*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mencari anime berdasarkan judul.

*Format:* !otakudesu [judul]
*Contoh:* !otakudesu Naruto

*Catatan:* Data diambil dari Jikan API.`;
        break;
        
      // Maker commands
      case 'sticker':
      case 's':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎨 *STICKER*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Membuat stiker dari gambar.

*Format:* 
- Kirim gambar dengan caption !sticker atau !s
- Balas gambar dengan !sticker atau !s`;
        break;
        
      case 'stickermeme':
      case 'smeme':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎨 *STICKER MEME*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Membuat stiker dengan teks.

*Format:* 
- Kirim gambar dengan caption !stickermeme [teks]
- Balas gambar dengan !stickermeme [teks]

*Contoh:* !stickermeme Teks Lucu`;
        break;
        
      case 'iphonechat':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎨 *IPHONE CHAT*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Membuat fake chat iPhone.

*Format:* !iphonechat Nama|Pesan
*Contoh:* !iphonechat John|Halo, apa kabar?`;
        break;
        
      case 'fakengl':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎨 *FAKE NGL*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Membuat fake pesan NGL.

*Format:* !fakengl [pesan]
*Contoh:* !fakengl Hai, kamu cantik banget!`;
        break;
        
      case 'namaninja':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎨 *NAMA NINJA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Membuat nama ninja dari nama asli.

*Format:* !namaninja [nama]
*Contoh:* !namaninja John Doe`;
        break;
        
      case 'namapurba':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎨 *NAMA PURBA*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Membuat nama purba dari nama asli.

*Format:* !namapurba [nama]
*Contoh:* !namapurba John Doe`;
        break;
        
      case 'brat':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎨 *BRAT TEXT*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mengubah teks menjadi gaya BRAT.

*Format:* !brat [teks]
*Contoh:* !brat Hello World`;
        break;
        
      case 'bratgif':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎨 *BRAT GIF*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Mendapatkan GIF BRAT random.

*Format:* !bratgif`;
        break;
        
      case 'emojimix':
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🎨 *EMOJI MIX*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Menggabungkan dua emoji menjadi satu.

*Format:* !emojimix [emoji1][emoji2]
*Contoh:* !emojimix 😀😍`;
        break;
        
      default:
        helpText = `
╭━━━━━━━━━━━━━━━━━━━━━╮
┃  ❓ *PERINTAH TIDAK DITEMUKAN*  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

Perintah "${command}" tidak ditemukan.
Gunakan !menu untuk melihat daftar perintah yang tersedia.`;
    }
    
    await message.reply(helpText);
  } catch (error) {
    console.error('Error saat menampilkan bantuan:', error);
    await message.reply('❌ Terjadi kesalahan saat menampilkan bantuan.');
  }
}

/**
 * Menyebut semua anggota dalam grup
 */
async function tagAll(message, customMessage = '') {
  try {
    // Pastikan pesan berasal dari grup
    const chat = await message.getChat();
    if (!chat.isGroup) {
      await message.reply('❌ Perintah ini hanya bisa digunakan di dalam grup.');
      return;
    }
    
    // Dapatkan semua anggota grup
    const participants = chat.participants;
    
    // Buat pesan dengan mention semua anggota
    let mentions = [];
    let text = customMessage ? `*PENGUMUMAN:* ${customMessage}\n\n` : '*PENGUMUMAN*\n\n';
    
    // Tambahkan semua peserta ke mentions
    for (let participant of participants) {
      try {
        // Periksa apakah participant valid
        if (!participant) continue;
        
        // Dapatkan ID yang valid
        let contactId;
        if (typeof participant.id === 'string') {
          contactId = participant.id;
        } else if (participant.id && participant.id._serialized) {
          contactId = participant.id._serialized;
        } else if (participant.id && typeof participant.id === 'object') {
          // Jika id adalah objek tapi tidak memiliki _serialized
          contactId = `${participant.id.user}@${participant.id.server}`;
        } else {
          // Lewati jika tidak bisa mendapatkan ID yang valid
          console.log('Tidak dapat mendapatkan ID valid untuk participant:', participant);
          continue;
        }
        
        // Buat objek kontak sederhana untuk mention
        mentions.push({ id: contactId });
        
        // Ekstrak user tag dari ID
        let userTag;
        if (contactId.includes('@')) {
          userTag = contactId.split('@')[0];
        } else if (participant.id && participant.id.user) {
          userTag = participant.id.user;
        } else {
          userTag = 'unknown';
        }
        
        text += `@${userTag} `;
      } catch (participantError) {
        console.error('Error saat memproses participant:', participantError);
        // Lanjutkan ke participant berikutnya
        continue;
      }
    }
    
    // Kirim pesan dengan mention
    await message.reply(text, null, { mentions });
    
  } catch (error) {
    console.error('Error saat menyebut semua anggota:', error);
    await message.reply('❌ Terjadi kesalahan saat menyebut semua anggota grup.');
  }
}

/**
 * Menghapus memori chat pengguna
 * @param {Object} message - Objek pesan WhatsApp
 */
async function clearMemory(message) {
  try {
    const chatMemoryHandler = require('./chatMemoryHandler');
    const sender = message.from;
    
    // Menghapus memori chat pengguna
    chatMemoryHandler.clearUserChatMemory(sender);
    
    await message.reply('✅ Memori chat kamu sudah dihapus. Eka akan mulai percakapan baru.');
  } catch (error) {
    console.error('Error saat menghapus memori chat:', error);
    await message.reply('❌ Terjadi kesalahan saat mencoba menghapus memori chat.');
  }
}

module.exports = {
  showMenu,
  showHelp,
  tagAll,
  clearMemory
};