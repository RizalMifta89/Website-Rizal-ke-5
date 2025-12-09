import axios from 'axios';

export default async function handler(req, res) {
  const { url, filename } = req.query;

  if (!url) {
    return res.status(400).send('URL video tidak ditemukan');
  }

  try {
    // KITA MINTA DATA KE DAILYMOTION DENGAN MENYAMAR
    const response = await axios.get(url, {
      responseType: 'stream', // Mode aliran data (agar memori server tidak penuh)
      headers: {
        // INI KUNCINYA: Kita bilang kita datang dari Dailymotion sendiri
        'Referer': 'https://www.dailymotion.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // KIRIMKAN HASILNYA KE USER SEBAGAI FILE DOWNLOAD
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'video'}.m3u8"`);
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

    // Salurkan (Pipe) data dari Dailymotion langsung ke User
    response.data.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal mengambil file. Link mungkin kadaluarsa.');
  }
}