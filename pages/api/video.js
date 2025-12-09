import axios from 'axios';

export default async function handler(req, res) {
  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  try {
    // 1. Ekstrak Video ID
    // Menerima berbagai format: dai.ly, dailymotion.com/video/, dll
    const videoIdMatch = url.match(/(?:video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return res.status(400).json({ error: 'Link tidak valid. Mohon periksa kembali.' });
    }

    // 2. Ambil Data Langsung dari Internal Player API
    // Ini adalah endpoint rahasia yang digunakan player Dailymotion untuk mengambil config
    const playerUrl = `https://www.dailymotion.com/player/metadata/video/${videoId}`;
    
    const { data } = await axios.get(playerUrl, {
      headers: {
        'Referer': `https://www.dailymotion.com/video/${videoId}`, // Wajib ada agar tidak ditolak
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // 3. Validasi Error dari Dailymotion
    if (data.error) {
      throw new Error(data.error.message || 'Video tidak ditemukan atau diblokir.');
    }

    // 4. Ambil Link Stream (M3U8)
    // Dailymotion menyimpan link di dalam properti "qualities" -> "auto"
    const qualities = data.qualities;
    if (!qualities || !qualities.auto || qualities.auto.length === 0) {
      throw new Error('Link download tidak tersedia (Mungkin video Geo-Block/Khusus Negara Tertentu).');
    }

    // Ambil link kualitas 'auto' (M3U8 Master Playlist)
    const m3u8Url = qualities.auto[0].url;

    // 5. Kirim Hasil
    res.status(200).json({
      title: data.title,
      thumbnail: data.posters ? data.posters[600] : null, // Ambil poster ukuran 600px
      duration: data.duration,
      author: data.owner ? data.owner.username : 'Dailymotion User',
      downloadUrl: m3u8Url,
      quality: 'Auto (HLS)'
    });

  } catch (error) {
    console.error('API Error:', error.message);
    
    // Pesan error khusus jika kena Geo-Block (Vercel server ada di US)
    if (error.response && error.response.status === 403) {
      return res.status(403).json({ error: 'Akses ditolak oleh Dailymotion (Mungkin video ini diblokir di server US).' });
    }

    res.status(500).json({ 
      error: error.message || 'Gagal mengambil data video.' 
    });
  }
}
