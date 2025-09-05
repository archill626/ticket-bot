// Bot configuration
module.exports = {
    TICKET_PANEL_CHANNEL_ID: '1413151640260841583',
    TRANSCRIPT_CHANNEL_ID: '1413152706872479794', 
    OWNER_ID: '1292870719549604012',
    TICKET_CATEGORY_ID: '1413151732896235610',
    PROMOTION_CHANNEL_ID: '1413435610630324316', // Channel for promotion panel
    TICKETS_FILE: './tickets.json',
    
    // API endpoints
    GTID_API_URL: 'https://gtid.dev/api',
    
    // Bot settings
    BUTTON_COOLDOWN: 3000, // 3 seconds
    
    // Messages
    MESSAGES: {
        TICKET_PANEL: {
            TITLE: 'Ticket Mobile Proxy UA',
            DESCRIPTION: 'ID: Klik tombol di bawah untuk membuka ticket dan melakukan pembelian proxy.\n\nEN: Click button below to open ticket and make a purchase.'
        },
        WORLD: 'WORLD1',
        OWNER: 'Archill19',
        TICKET_WELCOME: {
            TITLE: '🎫 {ticketNumber}',
            DESCRIPTION: 'Welcome {user}!\n\nSilahkan tunggu hingga admin membalas pesan Anda.'
        },
        DL_COMMAND: {
            TITLE: '💎 Harga Diamond Lock (DL)',
            DESCRIPTION: '**Harga Terbaru:** {price} World Lock',
            FOOTER: 'Data dari gtid.dev | discord.gg/gtid'
        }
    },
    
    // AI Channels - Auto-generated
    AI_CHANNELS: {
        CHAT: '1413443556147859557',
        SUMMARY: '1413443562099572818',
        TRANSLATE: '1413443568093364339',
        WRITING: '1413443573365342229',
        PERSONA: '1413443578289586227',
        GAMES: '1413443582987079742',
        NOTES: '1413443588280549386',
        NEWS: '1413443593472970752',
        MEMORY: '1413443598837485569',
        VOICE: ''
    }

};