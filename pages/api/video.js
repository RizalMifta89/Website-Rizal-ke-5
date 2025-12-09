import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Hanya menerima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('dailymotion.com')) {
    return res.status(400).json({ error: 'Masukkan URL Dailymotion yang valid' });
  }

  try {
    // 1. SETTING PENYAMARAN (USER AGENT)
    // Kita menyamar sebagai Chrome di Windows agar tidak diblokir
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.dailymotion.com/',
    };

    // 2. Request ke Dailymotion
    const { data } = await axios.get(url, { headers });
    
    // 3. Membedah HTML dengan Cheerio
    const $ = cheerio.load(data);
    
    // Strategi: Mencari metadata Schema.org (JSON-LD) yang biasanya berisi link file
    // Dailymotion biasanya menaruh link .m3u8 (HLS) di sini
    let videoData = null;
    
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json['@type'] === 'VideoObject') {
          videoData = json;
        }
      } catch (e) {
        // ignore parsing error
      }
    });

    if (!videoData) {
      throw new Error('Video tidak ditemukan atau diproteksi');
    }

    // 4. Kirim Hasil ke Frontend
    // contentUrl biasanya berisi link stream .m3u8
    res.status(200).json({
      title: videoData.name,
      thumbnail: videoData.thumbnailUrl,
      downloadUrl: videoData.contentUrl, // Link .m3u8 (Master Playlist)
      description: videoData.description
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data. Pastikan link publik.' });
  }
}
