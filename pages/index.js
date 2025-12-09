import { useState } from 'react';

export default function Home() {
  // --- BAGIAN 1: LOGIKA KUNCI LAYAR ---
  const [isLocked, setIsLocked] = useState(true); 
  const [pinInput, setPinInput] = useState('');
  
  // PIN RAHASIA ANDA
  const RAHASIA = '010500'; 

  const bukaKunci = () => {
    if (pinInput === RAHASIA) {
      setIsLocked(false); 
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
      // Panggil Backend Utama (pencari metadata)
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

  // --- BAGIAN 3: TAMPILAN (UI) ---
  
  // A. TAMPILAN SAAT TERKUNCI
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
            onKeyDown={(e) => e.key === 'Enter' && bukaKunci()} 
            placeholder="PIN"
            style={{...styles.input, textAlign: 'center', letterSpacing: '5px', fontSize: '20px'}}
          />
          
          <button onClick={bukaKunci} style={styles.button}>BUKA</button>
        </div>
      </div>
    );
  }

  // B. TAMPILAN SAAT TERBUKA (DOWNLOADER)
  return (
    <div style={styles.container}>
      <h1 style={{textAlign: 'center', color: '#333'}}>Dailymotion Downloader</h1>
      <div style={{...styles.card, maxWidth: '600px'}}>
        
        {/* INPUT LINK */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexDirection: 'column' }}>
          <label style={{fontWeight: 'bold', fontSize: '14px', color: '#555'}}>Link Video:</label>
          <div style={{display: 'flex', gap: '10px'}}>
            <input
              type="text"
              placeholder="Paste link Dailymotion di sini..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{...styles.input, flex: 1, marginBottom: 0}}
            />
            <button onClick={handleDownload} disabled={loading} style={{...styles.button, width: 'auto', minWidth: '100px'}}>
              {loading ? '⏳...' : 'Cari'}
