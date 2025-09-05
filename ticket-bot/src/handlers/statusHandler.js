const { ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const CONFIG = require('../config');

class StatusHandler {
    constructor(client) {
        this.client = client;
        this.setupBotStatus();
    }

    setupBotStatus() {
        // Set bot activity status
        this.client.user.setActivity('📱 Mobile Proxy Quality', { 
            type: ActivityType.Watching 
        });

        console.log('✅ Bot status berhasil diatur!');
    }



    // Update bot status periodically
    startStatusUpdate() {
        setInterval(() => {
            const statuses = [
                '📱 Best For Botting',
                '🎫 Open Ticket For Order',
                '📱 Mobile Proxy Quality',
                '⭐ Trusted Server'
            ];
            
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            this.client.user.setActivity(randomStatus, { type: ActivityType.Watching });
        }, 30000); // Change every 30 seconds
    }
}

module.exports = StatusHandler;