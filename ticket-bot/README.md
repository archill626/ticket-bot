# Discord Ticket Bot - Sistem Beli Barang

Bot Discord untuk mengelola sistem tiket pembelian barang dengan fitur lengkap:

## ✨ Fitur Utama

- 🎫 **Panel Ticket**: Channel khusus dengan tombol buka ticket
- 🤖 **Ticket Otomatis**: Channel baru dibuat otomatis dengan nama `ticket-username-001`
- 🔢 **Auto Numbering**: Sistem penomoran otomatis (Ticket-001, Ticket-002, dst.)
- 💾 **Data Storage**: Menyimpan data ticket di `tickets.json`
- 📨 **Notifikasi DM**: Owner mendapat DM saat ticket dibuka, user mendapat DM saat ticket ditutup
- 📄 **Transcript Otomatis**: Semua pesan disimpan dalam file .txt saat ticket ditutup
- 🔒 **Keamanan**: Batasan 1 ticket per user, anti-spam, permission control

## 🛠️ Setup

1. **Buat Discord Bot**:
   - Buka [Discord Developer Portal](https://discord.com/developers/applications)
   - Buat aplikasi baru dan bot
   - Copy token bot

2. **Konfigurasi Environment**:
   - Tambahkan `DISCORD_TOKEN` ke environment variables
   - Isi file `config.json`:
     ```json
     {
         "TICKET_PANEL_CHANNEL_ID": "ID_CHANNEL_PANEL",
         "TRANSCRIPT_CHANNEL_ID": "ID_CHANNEL_TRANSCRIPT", 
         "OWNER_ID": "ID_DISCORD_OWNER"
     }
     ```

3. **Permissions Bot**:
   Bot memerlukan permission berikut:
   - `Send Messages`
   - `Manage Channels`
   - `Manage Messages`
   - `View Channel`
   - `Read Message History`
   - `Use Slash Commands`

## 🚀 Menjalankan Bot

```bash
npm start
```

## 📁 Struktur File

- `index.js` - File utama bot
- `config.json` - Konfigurasi bot
- `tickets.json` - Database ticket (dibuat otomatis)
- `transcripts/` - Folder transcript (dibuat otomatis)

## 🎯 Cara Menggunakan

1. **Setup Panel**: Bot akan otomatis membuat panel ticket di channel yang dikonfigurasi
2. **Buka Ticket**: User klik tombol "📩 Buka Ticket"
3. **Kelola Ticket**: Owner dan user bisa berkomunikasi di channel ticket
4. **Tutup Ticket**: Klik tombol "🔒 Tutup Ticket" untuk menutup dan membuat transcript

## 🔧 Fitur Keamanan

- **1 Ticket per User**: User hanya bisa memiliki 1 ticket aktif
- **Anti-Spam**: Cooldown 3 detik untuk tombol
- **Permission Control**: Hanya owner dan user ticket yang bisa akses channel
- **Auto Cleanup**: Data ticket otomatis dibersihkan saat ticket ditutup