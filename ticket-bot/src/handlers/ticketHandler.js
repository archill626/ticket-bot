const { ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const CONFIG = require('../config');
const dataManager = require('../utils/dataManager');
const Helpers = require('../utils/helpers');

class TicketHandler {
    constructor(client) {
        this.client = client;
        this.buttonCooldowns = new Map();
    }

    async setupTicketPanel() {
        try {
            const channel = this.client.channels.cache.get(CONFIG.TICKET_PANEL_CHANNEL_ID);
            if (!channel) {
                console.log('❌ Channel ticket panel tidak ditemukan!');
                return;
            }

            // Clear previous messages
            const messages = await channel.messages.fetch({ limit: 100 });
            await channel.bulkDelete(messages);

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(CONFIG.MESSAGES.TICKET_PANEL.TITLE)
                .setDescription(CONFIG.MESSAGES.TICKET_PANEL.DESCRIPTION)
                .setColor('#0099ff')
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('📩 Open Ticket')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            await channel.send({
                embeds: [embed],
                components: [row]
            });

            console.log('✅ Ticket panel berhasil dibuat!');
        } catch (error) {
            console.error('Error setting up ticket panel:', error);
        }
    }

    async handleButtonInteraction(interaction) {
        const userId = interaction.user.id;
        const guild = interaction.guild;

        // Anti-spam protection
        if (this.buttonCooldowns.has(userId)) {
            const cooldownEnd = this.buttonCooldowns.get(userId);
            if (Date.now() < cooldownEnd) {
                return interaction.reply({
                    content: '⏰ Harap tunggu sebelum menggunakan tombol lagi!',
                    ephemeral: true
                });
            }
        }

        if (interaction.customId === 'open_ticket') {
            this.buttonCooldowns.set(userId, Date.now() + CONFIG.BUTTON_COOLDOWN);
            
            // Check if user already has an active ticket
            const existingTicketId = dataManager.getUserActiveTicket(userId);
            if (existingTicketId) {
                const existingChannel = guild.channels.cache.get(existingTicketId);
                if (existingChannel) {
                    return interaction.reply({
                        content: `❌ Anda sudah memiliki ticket aktif di ${existingChannel}!`,
                        ephemeral: true
                    });
                } else {
                    // Clean up orphaned ticket data
                    dataManager.cleanupOrphanedTicket(userId);
                }
            }

            await this.createTicket(interaction);
        } else if (interaction.customId === 'close_ticket') {
            await this.closeTicket(interaction);
        }
    }

    async createTicket(interaction) {
        try {
            const guild = interaction.guild;
            const user = interaction.user;
            
            // Generate ticket number
            const ticketNumber = dataManager.getNextTicketNumber();
            const channelName = Helpers.createTicketChannelName(user.username, ticketNumber);

            // Create ticket channel
            const ticketChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: CONFIG.TICKET_CATEGORY_ID,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: CONFIG.OWNER_ID,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels
                        ]
                    }
                ]
            });

            // Save ticket data
            const ticketInfo = {
                userId: user.id,
                ticketNumber: `Ticket-${ticketNumber}`,
                createdAt: new Date().toISOString(),
                channelName: channelName
            };
            dataManager.addActiveTicket(ticketChannel.id, ticketInfo);

            // Create welcome embed in ticket channel
            const welcomeDescription = Helpers.formatMessage(
                CONFIG.MESSAGES.TICKET_WELCOME.DESCRIPTION,
                { user: user.toString() }
            );
            const welcomeTitle = Helpers.formatMessage(
                CONFIG.MESSAGES.TICKET_WELCOME.TITLE,
                { ticketNumber: ticketInfo.ticketNumber }
            );

            const welcomeEmbed = new EmbedBuilder()
                .setTitle(welcomeTitle)
                .setDescription(welcomeDescription)
                .setColor('#00ff00')
                
                .setTimestamp();

            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('🔒 Tutup Ticket')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(closeButton);

            await ticketChannel.send({
                embeds: [welcomeEmbed],
                components: [row]
            });

            // Send DM to owner
            await this.sendOwnerNotification(user, ticketChannel, ticketInfo);

            await interaction.reply({
                content: `✅ Ticket berhasil dibuat! Silakan cek ${ticketChannel}`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error creating ticket:', error);
            await interaction.reply({
                content: '❌ Terjadi kesalahan saat membuat ticket!',
                ephemeral: true
            });
        }
    }

    async closeTicket(interaction) {
        try {
            const channel = interaction.channel;
            const ticketData = dataManager.getTicketInfo(channel.id);

            if (!ticketData) {
                return interaction.reply({
                    content: '❌ Channel ini bukan ticket yang valid!',
                    ephemeral: true
                });
            }

            // Check permissions
            if (interaction.user.id !== ticketData.userId && interaction.user.id !== CONFIG.OWNER_ID) {
                return interaction.reply({
                    content: '❌ Anda tidak memiliki izin untuk menutup ticket ini!',
                    ephemeral: true
                });
            }

            await interaction.reply('🔄 Sedang menutup ticket dan membuat transcript...');

            // Create and save transcript
            await this.createTranscript(channel, ticketData);

            // Send DM to user
            await this.sendUserCloseNotification(ticketData);

            // Clean up data
            dataManager.removeTicket(channel.id);

            // Delete channel after 5 seconds
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error('Error deleting channel:', error);
                }
            }, 5000);

        } catch (error) {
            console.error('Error closing ticket:', error);
            await interaction.followUp('❌ Terjadi kesalahan saat menutup ticket!');
        }
    }

    async createTranscript(channel, ticketData) {
        try {
            const transcriptData = await Helpers.createTranscriptContent(channel, ticketData);
            if (!transcriptData) return;

            const { transcript, messageCount } = transcriptData;
            const fileData = await Helpers.saveTranscript(transcript, ticketData.ticketNumber);
            if (!fileData) return;

            // Send transcript to transcript channel
            if (CONFIG.TRANSCRIPT_CHANNEL_ID) {
                const transcriptChannel = this.client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL_ID);
                if (transcriptChannel) {
                    const transcriptEmbed = new EmbedBuilder()
                        .setTitle('📄 Transcript Ticket')
                        .setDescription(`**Ticket:** ${ticketData.ticketNumber}\n**User:** <@${ticketData.userId}>\n**Total Pesan:** ${messageCount}`)
                        .setColor('#9932cc')
                        .setTimestamp();

                    await transcriptChannel.send({
                        embeds: [transcriptEmbed],
                        files: [{ attachment: fileData.filePath, name: fileData.fileName }]
                    });
                }
            }

            console.log(`✅ Transcript created: ${fileData.fileName}`);
        } catch (error) {
            console.error('Error creating transcript:', error);
        }
    }

    async sendOwnerNotification(user, ticketChannel, ticketInfo) {
        if (!CONFIG.OWNER_ID) return;

        try {
            const owner = await this.client.users.fetch(CONFIG.OWNER_ID);
            const dmEmbed = new EmbedBuilder()
                .setTitle('🔔 Ticket Baru Dibuka!')
                .setDescription(`**User:** ${user.tag}\n**Channel:** ${ticketChannel}\n**Ticket:** ${ticketInfo.ticketNumber}`)
                .setColor('#ff9900')
                .setTimestamp();

            await owner.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.error('Error sending DM to owner:', error);
        }
    }

    async sendUserCloseNotification(ticketData) {
        try {
            const user = await this.client.users.fetch(ticketData.userId);
            const dmEmbed = new EmbedBuilder()
                .setTitle('🔒 Ticket Ditutup')
                .setDescription(`Ticket Anda **${ticketData.ticketNumber}** telah ditutup.\n\nTerima kasih telah menggunakan layanan kami!`)
                .setColor('#ff0000')
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.error('Error sending DM to user:', error);
        }
    }
}

module.exports = TicketHandler;