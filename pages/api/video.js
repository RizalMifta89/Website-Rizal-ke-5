import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  try {
    // 1. Validasi & Ambil ID Video
    // Menerima format: dailymotion.com/video/x8hsr3c atau dai.ly/x8hsr3c
    const videoIdMatch = url.match(/video\/([a-zA-Z0-9]+)|dai\.ly\/([a-zA-Z0-9]+)/);
    const videoId = videoIdMatch ? (videoIdMatch[1] || videoIdMatch[2]) : null;

    if (!videoId) {
      return res.status(400).json({ error: 'Link tidak valid. Pastikan link Dailymotion benar.' });
    }

    // 2. Trik Jitu: Gunakan API Publik Dailymotion (Lebih Resmi & Stabil)
    // Kita minta data metadata dasar dulu (Judul, Thumbnail)
    const metadataUrl = `https://api.dailymotion.com/video/${videoId}?fields=id,title,thumbnail_1080_url,owner.username,duration`;
    
    const { data: meta } = await axios.get(metadataUrl).catch(() => ({ data: null }));
    
    if (!meta) {
      throw new Error('Video tidak ditemukan atau bersifat Pribadi.');
    }

    // 3. Ambil Link Stream (m3u8) dari Halaman Embed
    // Halaman embed pasti punya link m3u8 untuk player
    const embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
    const { data: html } = await axios.get(embedUrl, {
      headers: {
        // Pura-pura jadi browser asli agar tidak diblokir
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.dailymotion.com/',
      }
    });

    // 4. Mencari Link "Master m3u8" dengan Regex
    // Link ini biasanya tersembunyi di dalam teks konfigurasi player
    // Formatnya: "url":"https://...manifest.m3u8..."
    const m3u8Match = html.match(/"url":"([^"]+\.m3u8[^"]*)"/);

    if (!m3u8Match) {
      // Jika gagal regex pertama, coba regex cadangan (format decoded)
      const m3u8Backup = html.match(/src":"([^"]+\.m3u8[^"]*)"/);
      if (!m3u8Backup) throw new Error('Link download terproteksi. Coba video lain.');
      
      var streamUrl = m3u8Backup[1].replace(/\\/g, ''); // Bersihkan karakter escape
    } else {
      var streamUrl = m3u8Match[1].replace(/\\/g, '');
    }

    // 5. Sukses! Kirim data ke Frontend
    res.status(200).json({
      title: meta.title,
      thumbnail: meta.thumbnail_1080_url,
      duration: meta.duration,
      author: meta['owner.username'],
      downloadUrl: streamUrl, // Link Master M3U8 (All Qualities)
      quality: 'Auto (HLS)'
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: error.message || 'Gagal mengambil data. Server Dailymotion menolak akses.' 
    });
  }
}
