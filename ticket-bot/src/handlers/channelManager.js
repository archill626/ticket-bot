const { ChannelType, PermissionFlagsBits } = require('discord.js');

class ChannelManager {
    constructor(client) {
        this.client = client;
    }

    async ensureAIChannelsExist(guild) {
        try {
            console.log(`🔧 Checking AI channels for guild: ${guild.name}`);
            
            const requiredChannels = [
                { name: 'ai-chat', type: ChannelType.GuildText, topic: '🤖 Chat dengan AI - Ngobrol & tanya jawab apapun!' },
                { name: 'chat-summary', type: ChannelType.GuildText, topic: '📝 Rangkum chat panjang - Kirim chat untuk diringkas' },
                { name: 'translate', type: ChannelType.GuildText, topic: '🌐 Terjemahan otomatis - Kirim teks untuk diterjemahkan' },
                { name: 'writing', type: ChannelType.GuildText, topic: '✍️ Writing Helper - Bantuan menulis teks, caption, pengumuman' },
                { name: 'persona-mode', type: ChannelType.GuildText, topic: '🎭 Persona Mode - Ubah gaya bicara AI' },
                { name: 'ai-games', type: ChannelType.GuildText, topic: '🎮 Games & Roleplay - Kuis, RPG teks, NPC interaktif' },
                { name: 'notes', type: ChannelType.GuildText, topic: '📝 Notes & Reminder - Simpan catatan & pengingat jadwal' },
                { name: 'news-feed', type: ChannelType.GuildText, topic: '📰 Content Feed - Berita dan artikel terangkum' },
                { name: 'server-memory', type: ChannelType.GuildText, topic: '🧠 Custom Memory - AI hafal info server ini' },
                { name: 'Voice-AI', type: ChannelType.GuildVoice, topic: 'Voice AI Chat' }
            ];

            const createdChannels = {};
            let aiCategory = null;

            // Create or find AI category
            aiCategory = guild.channels.cache.find(c => c.name === 'AI Features' && c.type === ChannelType.GuildCategory);
            if (!aiCategory) {
                try {
                    aiCategory = await guild.channels.create({
                        name: 'AI Features',
                        type: ChannelType.GuildCategory,
                        reason: 'Auto-created AI category for bot features'
                    });
                    console.log(`✅ Created AI Features category`);
                } catch (error) {
                    console.error('Error creating AI category:', error);
                }
            }

            // Create channels that don't exist
            for (const channelConfig of requiredChannels) {
                try {
                    let channel = guild.channels.cache.find(c => c.name === channelConfig.name);
                    
                    if (!channel) {
                        const createOptions = {
                            name: channelConfig.name,
                            type: channelConfig.type,
                            topic: channelConfig.topic,
                            reason: `Auto-created AI channel: ${channelConfig.name}`
                        };

                        // Set parent for text channels only, and remove topic for voice channels
                        if (channelConfig.type === ChannelType.GuildText && aiCategory) {
                            createOptions.parent = aiCategory.id;
                        }
                        if (channelConfig.type === ChannelType.GuildVoice) {
                            delete createOptions.topic; // Voice channels don't support topics
                        }

                        channel = await guild.channels.create(createOptions);
                        console.log(`✅ Created channel: ${channelConfig.name}`);
                        
                        // Small delay to avoid rate limits
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        console.log(`ℹ️ Channel ${channelConfig.name} already exists`);
                    }
                    
                    createdChannels[channelConfig.name.replace('-', '_').replace(' ', '_').toLowerCase()] = channel.id;
                } catch (error) {
                    console.error(`Error creating channel ${channelConfig.name}:`, error);
                    // Continue with other channels even if one fails
                }
            }

            return createdChannels;
        } catch (error) {
            console.error('Error in ensureAIChannelsExist:', error);
            return {};
        }
    }

    async updateBotConfig(channelIds) {
        try {
            const fs = require('fs-extra');
            const path = require('path');
            
            const configPath = path.join(__dirname, '../config.js');
            let configContent = await fs.readFile(configPath, 'utf8');
            
            // Check if AI_CHANNELS already exists
            if (!configContent.includes('AI_CHANNELS')) {
                // Add AI_CHANNELS configuration
                const aiChannelsConfig = `
    
    // AI Channels - Auto-generated
    AI_CHANNELS: {
        CHAT: '${channelIds.ai_chat || ''}',
        SUMMARY: '${channelIds.chat_summary || ''}',
        TRANSLATE: '${channelIds.translate || ''}',
        WRITING: '${channelIds.writing || ''}',
        PERSONA: '${channelIds.persona_mode || ''}',
        GAMES: '${channelIds.ai_games || ''}',
        NOTES: '${channelIds.notes || ''}',
        NEWS: '${channelIds.news_feed || ''}',
        MEMORY: '${channelIds.server_memory || ''}',
        VOICE: '${channelIds.voice_ai || ''}'
    }`;

                // Insert before the closing brace
                configContent = configContent.replace(/(\s*)\}\s*;?\s*$/, `${aiChannelsConfig}\n$1};`);
                
                await fs.writeFile(configPath, configContent);
                console.log('✅ Config updated with AI channel IDs');
            } else {
                console.log('ℹ️ AI_CHANNELS already exists in config');
            }
        } catch (error) {
            console.error('Error updating config:', error);
        }
    }
}

module.exports = ChannelManager;