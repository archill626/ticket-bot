# 🎫 Setup Instructions - Discord Ticket Bot

Bot Anda sudah berjalan! Sekarang perlu konfigurasi untuk mulai digunakan.

## 📋 Langkah Setup

### 1. Invite Bot ke Server Discord
Gunakan link invite ini (ganti `YOUR_BOT_CLIENT_ID` dengan Client ID bot Anda):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=268446784&scope=bot
```

**Permissions yang dibutuhkan:**
- ✅ View Channels
- ✅ Send Messages  
- ✅ Manage Messages
- ✅ Manage Channels
- ✅ Read Message History
- ✅ Use External Emojis

### 2. Buat Channel yang Diperlukan

#### Channel Panel Ticket:
- Buat channel baru (misal: `#ticket-panel`)
- Copy ID channel ini
- Klik kanan channel → Copy Channel ID

#### Channel Transcript:
- Buat channel baru (misal: `#ticket-transcripts`)
- Copy ID channel ini

### 3. Dapatkan Owner ID
- Aktifkan Developer Mode di Discord (User Settings → Advanced → Developer Mode)
- Klik kanan nama Anda → Copy User ID

### 4. Edit File Konfigurasi
Edit file `config.json` dengan informasi Anda:

```json
{
    "TICKET_PANEL_CHANNEL_ID": "123456789012345678",
    "TRANSCRIPT_CHANNEL_ID": "123456789012345679", 
    "OWNER_ID": "123456789012345680"
}
```

### 5. Update Bot Code
Setelah mengisi `config.json`, restart bot untuk menerapkan konfigurasi baru.

## 🎯 Cara Menggunakan

1. **Panel Ticket**: Bot akan otomatis membuat panel dengan tombol di channel yang dikonfigurasi
2. **Buka Ticket**: User klik "📩 Buka Ticket"
3. **Tutup Ticket**: Klik "🔒 Tutup Ticket" untuk menutup dan simpan transcript

## ✨ Fitur yang Sudah Aktif

- ✅ Auto ticket numbering (Ticket-001, 002, dst.)
- ✅ 1 ticket per user (anti spam)
- ✅ DM notification ke owner saat ticket dibuka
- ✅ DM notification ke user saat ticket ditutup
- ✅ Auto transcript dalam format .txt
- ✅ Permission control (hanya user + owner yang bisa akses)
- ✅ Anti-spam button (cooldown 3 detik)

## 🔧 Troubleshooting

**Bot tidak merespon?**
- Pastikan bot punya permission yang cukup
- Cek Developer Mode sudah aktif untuk copy ID

**Panel tidak muncul?**
- Pastikan `TICKET_PANEL_CHANNEL_ID` sudah diisi dengan benar
- Restart bot setelah mengubah config

**Transcript tidak tersimpan?**
- Pastikan `TRANSCRIPT_CHANNEL_ID` sudah diisi
- Bot butuh permission untuk upload file