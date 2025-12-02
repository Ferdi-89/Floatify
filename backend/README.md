# Floatify Backend - Musixmatch API

Backend server untuk menyediakan lyrics dari Musixmatch API.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Jalankan server:
```bash
uvicorn main:app --reload --port 8000
```

Server akan berjalan di `http://localhost:8000`

## Endpoints

- `GET /search?q=<query>` - Cari lagu berdasarkan query
- `GET /lyrics?track_id=<id>` - Ambil lirik berdasarkan track ID
- `GET /lyrics?track_isrc=<isrc>` - Ambil lirik berdasarkan ISRC
- `GET /richsync?track_id=<id>` - Ambil lirik tersinkronisasi (richsync)
- `GET /track?track_id=<id>` - Ambil detail lagu

## Testing

Buka browser dan akses `http://localhost:8000/docs` untuk melihat API documentation interaktif.
