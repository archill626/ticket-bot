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

    async sendPromotionPanel(channelId) {
        try {
            const channel = this.client.channels.cache.get(channelId);
            if (!channel) {
                console.log('❌ Channel promosi tidak ditemukan!');
                return;
            }

            // Create promotion embed
            const embed = new EmbedBuilder()
                .setTitle('🚀 Join Server Kami!')
                .setDescription('**Selamat datang di server Mobile Proxy UA!**\n\n📱 **Layanan Kami:**\n• Mobile Proxy Berkualitas Tinggi\n• Support 24/7\n• Harga Kompetitif\n• Diamond Lock Trading\n\n💎 **Fitur Bot:**\n• `/dl` - Cek harga Diamond Lock real-time\n• 🎫 Sistem ticket otomatis\n• 📄 Transcript lengkap\n\n🔥 **Mengapa memilih kami?**\n✅ Proxy stabil dan cepat\n✅ Customer service responsif\n✅ Transaksi aman dan terpercaya\n✅ Member discount')
                .setColor('#00ff88')
                .setThumbnail('https://cdn.discordapp.com/icons/1413151639082426418/a_b83c5c24b5b11b3b64c4c4d5ec7d4c4c.gif')
                .addFields(
                    { name: '📊 Server Stats', value: 'Online Members: Loading...', inline: true },
                    { name: '💰 Harga DL', value: 'Gunakan `/dl` untuk cek', inline: true },
                    { name: '🎯 Rating', value: '⭐⭐⭐⭐⭐ (5/5)', inline: true }
                )
                .setFooter({ 
                    text: 'Mobile Proxy UA • Trusted Server', 
                    iconURL: 'https://cdn.discordapp.com/icons/1413151639082426418/a_b83c5c24b5b11b3b64c4c4d5ec7d4c4c.gif'
                })
                .setTimestamp();

            // Create buttons
            const inviteButton = new ButtonBuilder()
                .setLabel('📨 Invite Friends')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/yourserver'); // Replace with actual invite link

            const ticketButton = new ButtonBuilder()
                .setCustomId('promo_ticket')
                .setLabel('🎫 Buka Ticket')
                .setStyle(ButtonStyle.Primary);

            const dlButton = new ButtonBuilder()
                .setCustomId('promo_dl')
                .setLabel('💎 Cek Harga DL')
                .setStyle(ButtonStyle.Secondary);

            const supportButton = new ButtonBuilder()
                .setLabel('🆘 Support Server')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/support'); // Replace with support server

            const row1 = new ActionRowBuilder().addComponents(inviteButton, ticketButton);
            const row2 = new ActionRowBuilder().addComponents(dlButton, supportButton);

            await channel.send({
                embeds: [embed],
                components: [row1, row2]
            });

            console.log('✅ Panel promosi berhasil dikirim!');
        } catch (error) {
            console.error('Error sending promotion panel:', error);
        }
    }

    async handlePromoButton(interaction) {
        if (interaction.customId === 'promo_ticket') {
            // Redirect to ticket creation (same as main ticket button)
            return false; // Let ticket handler handle this
        } else if (interaction.customId === 'promo_dl') {
            // Execute DL command
            await interaction.deferReply({ ephemeral: true });
            
            try {
                // Import and execute DL command
                const DLCommand = require('../commands/dlCommand');
                
                // Create a mock interaction for the DL command
                const mockInteraction = {
                    ...interaction,
                    commandName: 'dl'
                };
                
                await DLCommand.execute(mockInteraction);
                
            } catch (error) {
                console.error('Error executing DL command from promo button:', error);
                await interaction.editReply({
                    content: '❌ Terjadi kesalahan! Silakan gunakan `/dl` langsung.',
                    ephemeral: true
                });
            }
        }
        
        return true; // Handled by this handler
    }

    // Update bot status periodically
    startStatusUpdate() {
        setInterval(() => {
            const statuses = [
                '💎 /dl untuk harga DL',
                '🎫 Buka Ticket untuk order',
                '📱 Mobile Proxy Quality',
                '⭐ Trusted Server'
            ];
            
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            this.client.user.setActivity(randomStatus, { type: ActivityType.Watching });
        }, 30000); // Change every 30 seconds
    }
}

module.exports = StatusHandler;