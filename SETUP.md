# Cara Menjalankan Floatify dengan Musixmatch API

Sekarang aplikasi Floatify menggunakan backend Python untuk mengambil lirik dari Musixmatch.

## Langkah Setup

### 1. Install Dependencies Python (Backend)
```bash
cd backend
pip install -r requirements.txt
```

### 2. Jalankan Backend Server
Buka terminal pertama dan jalankan:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

Server akan berjalan di `http://localhost:8000`. Anda bisa mengakses API docs di `http://localhost:8000/docs`.

### 3. Jalankan Frontend
Buka terminal kedua dan jalankan:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`.

## Cara Kerja

1. **Backend Python**: Menangani semua request ke Musixmatch API dengan signature yang diperlukan
2. **Frontend React**: Mengambil data dari backend lokal (`localhost:8000`)
3. **Fitur**:
   - Mendukung **richsync** (lirik tersinkronisasi per kata)
   - Fallback ke lirik biasa jika richsync tidak tersedia
   - Menggunakan ISRC dari Spotify untuk matching yang lebih akurat
   - Cache lirik di localStorage untuk performa lebih baik

## Troubleshooting

**Problem**: Frontend menampilkan "Lyrics not available. Make sure the backend is running."
- **Solusi**: Pastikan backend server Python sudah berjalan di port 8000

**Problem**: CORS error
- **Solusi**: Backend sudah dikonfigurasi dengan CORS middleware, pastikan menggunakan `http://localhost:8000`

## Catatan

- Backend **harus** berjalan agar lirik bisa muncul
- Kedua server (backend Python dan frontend Vite) harus berjalan bersamaan
- Lirik akan di-cache sehingga request berikutnya lebih cepat
