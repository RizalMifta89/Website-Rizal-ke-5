import { useState } from 'react';

export default function Home() {
  // --- BAGIAN 1: LOGIKA KUNCI LAYAR ---
  const [isLocked, setIsLocked] = useState(true); // Default status: Terkunci
  const [pinInput, setPinInput] = useState('');
  
  // PIN ANDA DI SINI
  const RAHASIA = '010500'; 

  const bukaKunci = () => {
    if (pinInput === RAHASIA) {
      setIsLocked(false); // Buka kunci jika PIN benar
    } else {
      alert('PIN Salah! Akses ditolak.');
      setPinInput('');
    }
  };

  // --- BAGIAN 2: LOGIKA DOWNLOADER ---
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil data');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- BAGIAN 3: TAMPILAN (HTML/JSX) ---
  
  // A. TAMPILAN SAAT TERKUNCI (LOCK SCREEN)
  if (isLocked) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{marginTop: 0, color: '#333'}}>🔒 Restricted Access</h2>
          <p style={{color: '#666'}}>Masukkan kode akses untuk melanjutkan.</p>
          
          <input 
            type="password" 
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && bukaKunci()} // Bisa tekan Enter
            placeholder="PIN"
            style={{...styles.input, textAlign: 'center', letterSpacing: '5px', fontSize: '20px'}}
          />
          
          <button onClick={bukaKunci} style={styles.button}>BUKA</button>
        </div>
      </div>
    );
  }

  // B. TAMPILAN SAAT TERBUKA (DOWNLOADER UTAMA)
  return (
    <div style={styles.container}>
      <h1 style={{textAlign: 'center', color: '#333'}}>Dailymotion Downloader</h1>
      <div style={{...styles.card, maxWidth: '600px'}}>
        
        {/* Kolom Input Link */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexDirection: 'column' }}>
          <label style={{fontWeight: 'bold', fontSize: '14px', color: '#555'}}>Link Video:</label>
          <div style={{display: 'flex', gap: '10px'}}>
            <input
              type="text"
              placeholder="Contoh: https://www.dailymotion.com/video/x8..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{...styles.input, flex: 1, marginBottom: 0}}
            />
            <button onClick={handleDownload} disabled={loading} style={{...styles.button, width: 'auto', minWidth: '100px'}}>
              {loading ? '⏳...' : 'Cari'}
            </button>
          </div>
        </div>

        {/* Pesan Error */}
        {error && (
          <div style={{padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '5px', marginBottom: '15px'}}>
            ⚠️ {error}
          </div>
        )}

        {/* Hasil Download */}
        {result && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '18px'}}>{result.title}</h3>
            
            <div style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', marginBottom: '15px', background: '#000'}}>
              <img 
                src={result.thumbnail} 
                alt="Thumb" 
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8}} 
              />
            </div>
            
            <a href={result.downloadUrl} target="_blank" rel="noreferrer" style={styles.downloadBtn}>
              ⬇️ Buka / Download Video
            </a>
            
            <p style={{fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '10px'}}>
              *Jika video terbuka di tab baru dan tidak terdownload otomatis: Klik kanan pada video &gt; "Save Video As".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- GAYA TAMPILAN (CSS) ---
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    backgroundColor: '#f0f2f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '400px'
  },
  input: {
    width: '100%',
    padding: '14px',
    marginBottom: '15px',
    border: '2px solid #e1e4e8',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.2s'
  },
  downloadBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    padding: '14px',
    backgroundColor: '#10b981', // Warna hijau
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
  }
};
