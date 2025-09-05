const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

class ModerationHandler {
    constructor(client) {
        this.client = client;
        
        // Daftar domain phishing yang umum diketahui
        this.phishingDomains = [
            'discord-nitro.gift',
            'discord-gifts.com',
            'discord-nitro.link',
            'discrod.gift',
            'discordnitro.gift',
            'discord-give.com',
            'free-nitro.com',
            'steam-discord.com',
            'discord-app.net',
            'discordapp.info',
            'discordgift.site',
            'discord-promo.com',
            'discordsteam.com',
            'steamcommunity.ru',
            'steamcommuntiy.com',
            'steamcommunity.link'
        ];
        
        // Pattern untuk mendeteksi Discord invite links yang mencurigakan
        this.suspiciousPatterns = [
            /discord\.gg\/[a-zA-Z0-9]+/gi,
            /discordapp\.com\/invite\/[a-zA-Z0-9]+/gi,
            /discord\.com\/invite\/[a-zA-Z0-9]+/gi
        ];
        
        // Whitelisted server invites (tambahkan server yang diizinkan)
        this.whitelistedInvites = [
            // Tambahkan invite code server yang diizinkan disini
            // Contoh: 'yourservcode', 'partnerserver'
        ];
    }

    async moderateMessage(message) {
        // Skip jika pesan dari bot
        if (message.author.bot) return;
        
        // Skip jika user adalah admin/moderator
        if (message.member && (
            message.member.permissions.has(PermissionFlagsBits.Administrator) ||
            message.member.permissions.has(PermissionFlagsBits.ManageMessages)
        )) return;

        const content = message.content.toLowerCase();
        let shouldDelete = false;
        let reason = '';

        // Cek phishing domains
        for (const domain of this.phishingDomains) {
            if (content.includes(domain.toLowerCase())) {
                shouldDelete = true;
                reason = 'Link phishing terdeteksi';
                break;
            }
        }

        // Cek Discord invite links yang mencurigakan
        if (!shouldDelete) {
            for (const pattern of this.suspiciousPatterns) {
                const matches = message.content.match(pattern);
                if (matches) {
                    // Cek apakah invite ada di whitelist
                    let isWhitelisted = false;
                    for (const match of matches) {
                        const inviteCode = match.split('/').pop();
                        if (this.whitelistedInvites.includes(inviteCode)) {
                            isWhitelisted = true;
                            break;
                        }
                    }
                    
                    if (!isWhitelisted) {
                        shouldDelete = true;
                        reason = 'Link Discord server tidak diizinkan';
                        break;
                    }
                }
            }
        }

        // Hapus pesan jika terdeteksi sebagai spam/phishing
        if (shouldDelete) {
            try {
                await message.delete();
                await this.logModeration(message, reason);
                await this.sendWarningToUser(message, reason);
                console.log(`🛡️ Auto-moderation: Pesan dari ${message.author.tag} dihapus - ${reason}`);
            } catch (error) {
                console.error('Error dalam auto moderation:', error);
            }
        }
    }

    async logModeration(message, reason) {
        try {
            // Cari channel log moderation (bisa menggunakan channel transcript atau buat channel khusus)
            const CONFIG = require('../config');
            const logChannel = message.guild.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL_ID);
            
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('🛡️ Auto Moderation - Pesan Dihapus')
                .setColor('#ff4444')
                .addFields(
                    { name: '👤 User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: '📍 Channel', value: `${message.channel}`, inline: true },
                    { name: '⚠️ Alasan', value: reason, inline: true },
                    { name: '💬 Konten Pesan', value: message.content.length > 1024 ? message.content.substring(0, 1021) + '...' : message.content }
                )
                .setTimestamp()
                .setFooter({ text: 'Auto Moderation System' });

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging moderation:', error);
        }
    }

    async sendWarningToUser(message, reason) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Peringatan Auto Moderation')
                .setDescription(`Pesan Anda telah dihapus karena: **${reason}**\n\nHarap patuhi aturan server dan jangan mengirim link yang mencurigakan atau tidak diizinkan.`)
                .setColor('#ffaa00')
                .setTimestamp()
                .setFooter({ text: 'Mobile Proxy UA - Auto Moderation' });

            await message.author.send({ embeds: [embed] }).catch(() => {
                // Jika tidak bisa DM, kirim peringatan di channel (ephemeral)
                message.channel.send({
                    content: `${message.author}, pesan Anda telah dihapus karena: **${reason}**`,
                    allowedMentions: { users: [message.author.id] }
                }).then(msg => {
                    // Hapus peringatan setelah 10 detik
                    setTimeout(() => msg.delete().catch(() => {}), 10000);
                });
            });
        } catch (error) {
            console.error('Error sending warning to user:', error);
        }
    }

    // Method untuk menambah domain phishing baru (bisa digunakan oleh admin command)
    addPhishingDomain(domain) {
        if (!this.phishingDomains.includes(domain.toLowerCase())) {
            this.phishingDomains.push(domain.toLowerCase());
            return true;
        }
        return false;
    }

    // Method untuk menambah whitelist invite
    addWhitelistedInvite(inviteCode) {
        if (!this.whitelistedInvites.includes(inviteCode)) {
            this.whitelistedInvites.push(inviteCode);
            return true;
        }
        return false;
    }

    // Method untuk mendapatkan statistik moderasi
    getPhishingDomains() {
        return this.phishingDomains;
    }

    getWhitelistedInvites() {
        return this.whitelistedInvites;
    }
}

module.exports = ModerationHandler;