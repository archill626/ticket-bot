const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

class AIHandler {
    constructor(client) {
        this.client = client;
        this.memories = new Map(); // Guild memory storage
        this.notes = new Map(); // Notes storage per guild
        this.personas = {
            'professional': 'Saya akan merespons dengan gaya profesional dan formal.',
            'friendly': 'Saya akan merespons dengan gaya ramah dan hangat!',
            'casual': 'Yo! Saya akan ngobrol santai aja nih.',
            'expert': 'Saya akan memberikan jawaban yang detail dan teknis.'
        };
        this.currentPersonas = new Map(); // Per guild persona
        
        // Channel configurations
        this.channelConfigs = {
            'ai-chat': { 
                name: 'ai-chat', 
                topic: '🤖 Chat dengan AI - Ngobrol & tanya jawab apapun!',
                type: ChannelType.GuildText
            },
            'chat-summary': { 
                name: 'chat-summary', 
                topic: '📝 Rangkum chat panjang - Kirim chat untuk diringkas',
                type: ChannelType.GuildText
            },
            'translate': { 
                name: 'translate', 
                topic: '🌐 Terjemahan otomatis - Kirim teks untuk diterjemahkan',
                type: ChannelType.GuildText
            },
            'writing': { 
                name: 'writing', 
                topic: '✍️ Writing Helper - Bantuan menulis teks, caption, pengumuman',
                type: ChannelType.GuildText
            },
            'persona-mode': { 
                name: 'persona-mode', 
                topic: '🎭 Persona Mode - Ubah gaya bicara AI (professional/friendly/casual/expert)',
                type: ChannelType.GuildText
            },
            'ai-games': { 
                name: 'ai-games', 
                topic: '🎮 Games & Roleplay - Kuis, RPG teks, NPC interaktif',
                type: ChannelType.GuildText
            },
            'notes': { 
                name: 'notes', 
                topic: '📝 Notes & Reminder - Simpan catatan & pengingat jadwal',
                type: ChannelType.GuildText
            },
            'news-feed': { 
                name: 'news-feed', 
                topic: '📰 Content Feed - Berita dan artikel terangkum',
                type: ChannelType.GuildText
            },
            'server-memory': { 
                name: 'server-memory', 
                topic: '🧠 Custom Memory - AI hafal info server ini',
                type: ChannelType.GuildText
            },
            'Voice AI': { 
                name: 'Voice AI', 
                topic: '🎤 Voice AI Chat',
                type: ChannelType.GuildVoice
            }
        };
    }

    async setupAIChannels(guild) {
        const createdChannels = {};
        const CONFIG = require('../config');
        
        try {
            console.log(`🤖 Setting up AI channels for guild: ${guild.name}`);
            
            // Create category for AI channels
            let aiCategory = guild.channels.cache.find(c => c.name === 'AI Features' && c.type === ChannelType.GuildCategory);
            if (!aiCategory) {
                aiCategory = await guild.channels.create({
                    name: 'AI Features',
                    type: ChannelType.GuildCategory,
                    reason: 'Auto-created AI category'
                });
                console.log(`✅ Created AI category`);
            }

            // Create each AI channel
            for (const [key, config] of Object.entries(this.channelConfigs)) {
                let channel = guild.channels.cache.find(c => c.name === config.name);
                
                if (!channel) {
                    const channelOptions = {
                        name: config.name,
                        type: config.type,
                        topic: config.topic,
                        reason: 'Auto-created AI channel'
                    };
                    
                    // Set parent category for text channels
                    if (config.type === ChannelType.GuildText) {
                        channelOptions.parent = aiCategory.id;
                    }
                    
                    channel = await guild.channels.create(channelOptions);
                    console.log(`✅ Created channel: #${config.name}`);
                    
                    // Send welcome message for some channels
                    if (config.type === ChannelType.GuildText) {
                        await this.sendWelcomeMessage(channel, key);
                    }
                }
                
                createdChannels[key] = channel.id;
            }
            
            // Update config file with channel IDs
            await this.updateConfigWithChannels(createdChannels);
            
            return createdChannels;
        } catch (error) {
            console.error('Error setting up AI channels:', error);
            return {};
        }
    }

    async sendWelcomeMessage(channel, channelType) {
        const welcomeMessages = {
            'ai-chat': {
                title: '🤖 Welcome to AI Chat!',
                description: 'Selamat datang di AI Chat! Anda bisa:\n• Bertanya apapun\n• Ngobrol santai\n• Minta bantuan\n• Diskusi topik menarik\n\nLangsung ketik pesan Anda!'
            },
            'chat-summary': {
                title: '📝 Chat Summary Helper',
                description: 'Kirim chat atau teks panjang untuk dirangkum!\n\nFormat: Paste teks yang ingin dirangkum'
            },
            'translate': {
                title: '🌐 Translator',
                description: 'Terjemahkan teks ke berbagai bahasa!\n\nFormat: `[bahasa target] teks yang ingin diterjemahkan`\nContoh: `english Halo, apa kabar?`\nAtau langsung kirim teks (otomatis ke bahasa Inggris)'
            },
            'writing': {
                title: '✍️ Writing Helper',
                description: 'Bantuan menulis untuk berbagai kebutuhan!\n\n**Yang bisa saya bantu:**\n• Caption media sosial\n• Pengumuman\n• Email formal\n• Artikel/blog\n• Creative writing\n\nFormat: `[jenis tulisan] topik/request Anda`'
            },
            'persona-mode': {
                title: '🎭 Persona Mode',
                description: 'Ubah gaya bicara AI sesuai kebutuhan!\n\n**Available Personas:**\n• `professional` - Formal dan profesional\n• `friendly` - Ramah dan hangat\n• `casual` - Santai dan gaul\n• `expert` - Detail dan teknis\n\nFormat: `!persona [mode]` atau chat langsung'
            },
            'ai-games': {
                title: '🎮 AI Games & Roleplay',
                description: 'Bermain games dan roleplay interaktif!\n\n**Available Games:**\n• `!quiz [topik]` - Kuis interaktif\n• `!rpg` - RPG text adventure\n• `!story` - Collaborative storytelling\n• `!riddle` - Teka-teki\n\nLangsung ketik command atau chat untuk bermain!'
            },
            'notes': {
                title: '📝 Notes & Reminder',
                description: 'Simpan catatan dan atur pengingat!\n\n**Commands:**\n• `!note add [judul] [isi]` - Tambah catatan\n• `!note list` - Lihat semua catatan\n• `!remind [waktu] [pesan]` - Set reminder\n• `!notes search [kata kunci]` - Cari catatan'
            },
            'news-feed': {
                title: '📰 Content Feed',
                description: 'Dapatkan berita dan konten terangkum!\n\n**Commands:**\n• `!news [topik]` - Cari berita\n• `!summarize [URL]` - Ringkas artikel\n• `!trending` - Topik trending\n\nAtau kirim URL artikel untuk diringkas otomatis!'
            },
            'server-memory': {
                title: '🧠 Server Memory',
                description: 'AI yang mengingat informasi server!\n\n**Commands:**\n• `!remember [info]` - Simpan info server\n• `!recall [kata kunci]` - Ingat info\n• `!forget [kata kunci]` - Hapus info\n• `!memory list` - Lihat semua memory'
            }
        };

        const message = welcomeMessages[channelType];
        if (message) {
            const embed = new EmbedBuilder()
                .setTitle(message.title)
                .setDescription(message.description)
                .setColor('#00ff88')
                .setFooter({ text: 'Mobile Proxy UA - AI Features' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }
    }

    async updateConfigWithChannels(channels) {
        try {
            const configPath = path.join(__dirname, '../config.js');
            let configContent = await fs.readFile(configPath, 'utf8');
            
            // Add AI channels section
            const aiChannelsConfig = `
    
    // AI Channels
    AI_CHANNELS: {
        CHAT: '${channels['ai-chat'] || ''}',
        SUMMARY: '${channels['chat-summary'] || ''}',
        TRANSLATE: '${channels['translate'] || ''}',
        WRITING: '${channels['writing'] || ''}',
        PERSONA: '${channels['persona-mode'] || ''}',
        GAMES: '${channels['ai-games'] || ''}',
        NOTES: '${channels['notes'] || ''}',
        NEWS: '${channels['news-feed'] || ''}',
        MEMORY: '${channels['server-memory'] || ''}',
        VOICE: '${channels['Voice AI'] || ''}'
    }`;

            // Insert before the closing brace
            configContent = configContent.replace(/}\s*;?\s*$/, `${aiChannelsConfig}\n};`);
            
            await fs.writeFile(configPath, configContent);
            console.log('✅ Config updated with AI channel IDs');
        } catch (error) {
            console.error('Error updating config:', error);
        }
    }

    async handleAIMessage(message) {
        if (message.author.bot) return;
        
        const channelName = message.channel.name;
        const content = message.content;
        const guildId = message.guild.id;

        try {
            switch (channelName) {
                case 'ai-chat':
                    await this.handleGeneralChat(message);
                    break;
                case 'chat-summary':
                    await this.handleSummary(message);
                    break;
                case 'translate':
                    await this.handleTranslate(message);
                    break;
                case 'writing':
                    await this.handleWriting(message);
                    break;
                case 'persona-mode':
                    await this.handlePersona(message);
                    break;
                case 'ai-games':
                    await this.handleGames(message);
                    break;
                case 'notes':
                    await this.handleNotes(message);
                    break;
                case 'news-feed':
                    await this.handleNewsFeed(message);
                    break;
                case 'server-memory':
                    await this.handleMemory(message);
                    break;
            }
        } catch (error) {
            console.error(`Error handling AI message in ${channelName}:`, error);
            await message.reply('❌ Maaf, terjadi kesalahan saat memproses pesan Anda.');
        }
    }

    async handleGeneralChat(message) {
        const persona = this.currentPersonas.get(message.guild.id) || 'friendly';
        const response = await this.generateAIResponse(message.content, persona);
        await message.reply(response);
    }

    async handleSummary(message) {
        if (message.content.length < 100) {
            return message.reply('📝 Kirim teks yang lebih panjang untuk dirangkum (minimal 100 karakter)');
        }
        
        const summary = await this.generateSummary(message.content);
        
        const embed = new EmbedBuilder()
            .setTitle('📝 Ringkasan Chat')
            .setDescription(summary)
            .setColor('#4169E1')
            .setFooter({ text: `Diringkas untuk ${message.author.username}` })
            .setTimestamp();
            
        await message.reply({ embeds: [embed] });
    }

    async handleTranslate(message) {
        const content = message.content;
        let targetLang = 'english';
        let textToTranslate = content;
        
        // Check if user specified target language
        const langMatch = content.match(/^(\w+)\s+(.+)/);
        if (langMatch) {
            targetLang = langMatch[1];
            textToTranslate = langMatch[2];
        }
        
        const translation = await this.translateText(textToTranslate, targetLang);
        
        const embed = new EmbedBuilder()
            .setTitle('🌐 Terjemahan')
            .addFields(
                { name: 'Teks Asli', value: textToTranslate, inline: false },
                { name: `Terjemahan (${targetLang})`, value: translation, inline: false }
            )
            .setColor('#FF6B6B')
            .setFooter({ text: `Diterjemahkan untuk ${message.author.username}` });
            
        await message.reply({ embeds: [embed] });
    }

    async handleWriting(message) {
        const response = await this.generateWritingHelp(message.content);
        
        const embed = new EmbedBuilder()
            .setTitle('✍️ Writing Assistant')
            .setDescription(response)
            .setColor('#FFD93D')
            .setFooter({ text: `Dibuat untuk ${message.author.username}` });
            
        await message.reply({ embeds: [embed] });
    }

    async handlePersona(message) {
        const content = message.content.toLowerCase();
        
        if (content.startsWith('!persona ')) {
            const persona = content.replace('!persona ', '').trim();
            if (this.personas[persona]) {
                this.currentPersonas.set(message.guild.id, persona);
                await message.reply(`🎭 Persona diubah ke: **${persona}**\n${this.personas[persona]}`);
                return;
            } else {
                await message.reply('❌ Persona tidak tersedia. Pilihan: professional, friendly, casual, expert');
                return;
            }
        }
        
        const persona = this.currentPersonas.get(message.guild.id) || 'friendly';
        const response = await this.generateAIResponse(message.content, persona);
        await message.reply(`[${persona.toUpperCase()}] ${response}`);
    }

    async handleGames(message) {
        const content = message.content.toLowerCase();
        
        if (content.startsWith('!quiz ')) {
            const topic = content.replace('!quiz ', '');
            await this.startQuiz(message, topic);
        } else if (content.startsWith('!rpg')) {
            await this.startRPG(message);
        } else if (content.startsWith('!story')) {
            await this.startStory(message);
        } else if (content.startsWith('!riddle')) {
            await this.sendRiddle(message);
        } else {
            await this.handleGameChat(message);
        }
    }

    async handleNotes(message) {
        const content = message.content;
        const guildId = message.guild.id;
        
        if (!this.notes.has(guildId)) {
            this.notes.set(guildId, []);
        }
        
        if (content.startsWith('!note add ')) {
            const noteText = content.replace('!note add ', '');
            const [title, ...bodyParts] = noteText.split(' ');
            const body = bodyParts.join(' ');
            
            this.notes.get(guildId).push({
                id: Date.now(),
                title,
                body,
                author: message.author.username,
                created: new Date()
            });
            
            await message.reply(`📝 Catatan "${title}" berhasil disimpan!`);
        } else if (content === '!note list') {
            await this.listNotes(message);
        } else if (content.startsWith('!remind ')) {
            await this.setReminder(message);
        } else if (content.startsWith('!notes search ')) {
            const query = content.replace('!notes search ', '');
            await this.searchNotes(message, query);
        }
    }

    async handleNewsFeed(message) {
        const content = message.content;
        
        if (content.startsWith('!news ')) {
            const topic = content.replace('!news ', '');
            await this.getNews(message, topic);
        } else if (content.startsWith('!summarize ')) {
            const url = content.replace('!summarize ', '');
            await this.summarizeURL(message, url);
        } else if (content === '!trending') {
            await this.getTrending(message);
        } else if (content.includes('http')) {
            // Auto-summarize URLs
            const urls = content.match(/https?:\/\/[^\s]+/g);
            if (urls) {
                await this.summarizeURL(message, urls[0]);
            }
        }
    }

    async handleMemory(message) {
        const content = message.content;
        const guildId = message.guild.id;
        
        if (!this.memories.has(guildId)) {
            this.memories.set(guildId, new Map());
        }
        
        const guildMemory = this.memories.get(guildId);
        
        if (content.startsWith('!remember ')) {
            const info = content.replace('!remember ', '');
            const key = `memory_${Date.now()}`;
            guildMemory.set(key, {
                info,
                author: message.author.username,
                created: new Date()
            });
            await message.reply('🧠 Informasi berhasil disimpan dalam memory server!');
        } else if (content.startsWith('!recall ')) {
            const query = content.replace('!recall ', '').toLowerCase();
            await this.recallMemory(message, query);
        } else if (content.startsWith('!forget ')) {
            const query = content.replace('!forget ', '').toLowerCase();
            await this.forgetMemory(message, query);
        } else if (content === '!memory list') {
            await this.listMemories(message);
        }
    }

    // Enhanced AI Response generation with better context understanding
    async generateAIResponse(prompt, persona = 'friendly') {
        const lowerPrompt = prompt.toLowerCase();
        
        // Greeting responses
        if (lowerPrompt.includes('hai') || lowerPrompt.includes('hello') || lowerPrompt.includes('halo') || lowerPrompt.includes('hi')) {
            const greetings = {
                friendly: ['Hai! 😊 Senang bisa ngobrol dengan Anda! Ada yang bisa saya bantu?', 'Hello! Gimana kabarnya hari ini?', 'Halo! Apa yang ingin kita bahas?'],
                professional: ['Selamat datang! Bagaimana saya dapat membantu Anda hari ini?', 'Terima kasih telah menghubungi kami. Ada yang bisa saya bantu?'],
                casual: ['Yo! Gimana nih? Ada yang mau ditanyain?', 'Hei bro! Ada apa?', 'Sup! 🤙 Mau ngobrol apa nih?'],
                expert: ['Salam! Saya siap memberikan analisis dan informasi yang Anda butuhkan.']
            };
            const responses = greetings[persona] || greetings.friendly;
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // Specific topic responses
        if (lowerPrompt.includes('proxy') || lowerPrompt.includes('mobile proxy')) {
            return 'Mobile Proxy UA menyediakan layanan proxy berkualitas tinggi! Untuk informasi lengkap dan pemesanan, silakan buka ticket di channel yang tersedia. Kami siap membantu 24/7! 📱✨';
        }
        
        if (lowerPrompt.includes('harga') || lowerPrompt.includes('price') || lowerPrompt.includes('berapa')) {
            return 'Untuk informasi harga terbaru, Anda bisa:\n• Gunakan command `/dl` untuk cek harga Diamond Lock\n• Buka ticket untuk konsultasi harga proxy\n• Tim kami akan memberikan penawaran terbaik! 💰';
        }
        
        if (lowerPrompt.includes('help') || lowerPrompt.includes('bantuan') || lowerPrompt.includes('gimana')) {
            return 'Saya siap membantu! 🤖\n\n**Yang bisa saya lakukan:**\n• Chat dan menjawab pertanyaan\n• Bantu dengan informasi proxy\n• Arahkan ke layanan yang tepat\n\nAda yang spesifik ingin ditanyakan?';
        }
        
        if (lowerPrompt.includes('terima kasih') || lowerPrompt.includes('thanks') || lowerPrompt.includes('makasih')) {
            return 'Sama-sama! 😊 Senang bisa membantu. Jangan ragu untuk bertanya lagi kapan saja ya!';
        }
        
        // Question responses
        if (lowerPrompt.includes('apa') || lowerPrompt.includes('bagaimana') || lowerPrompt.includes('kenapa') || lowerPrompt.includes('mengapa') || prompt.includes('?')) {
            const questionStarters = {
                friendly: ['Wah, pertanyaan bagus nih! 🤔', 'Hmm, menarik! Soal itu ya...', 'Oke, let me explain!'],
                professional: ['Pertanyaan yang sangat baik. Berdasarkan informasi yang tersedia,', 'Mengenai hal tersebut, saya dapat menjelaskan bahwa'],
                casual: ['Nah itu dia! Gini lho bro...', 'Wah, pertanyaan keren tuh!', 'Oke bro, gini nih...'],
                expert: ['Berdasarkan analisis teknis,', 'Secara komprehensif, hal ini dapat dijelaskan sebagai']
            };
            const starters = questionStarters[persona] || questionStarters.friendly;
            const starter = starters[Math.floor(Math.random() * starters.length)];
            
            // Try to answer based on keywords
            if (lowerPrompt.includes('apa itu') || lowerPrompt.includes('what is')) {
                return starter + ' Untuk penjelasan detail tentang topik tersebut, saya sarankan untuk bertanya lebih spesifik atau membuka ticket untuk konsultasi langsung dengan tim ahli kami!';
            }
            
            return starter + ' Bisa tolong diperjelas pertanyaannya? Saya akan berusaha memberikan jawaban yang sesuai! 😊';
        }
        
        // General conversation responses
        const generalResponses = {
            friendly: [
                'Iya betul! Ada yang lain ingin dibahas? 😊',
                'Oh gitu ya! Menarik banget nih! 🤩', 
                'Sip sip! Gimana kalau kita bahas topik lain?',
                'Setuju! Ada pengalaman menarik yang ingin dibagi?'
            ],
            professional: [
                'Terima kasih atas informasinya. Ada hal lain yang bisa saya bantu?',
                'Saya memahami. Apakah ada pertanyaan lebih lanjut?',
                'Baik, noted. Silakan sampaikan jika ada yang perlu didiskusikan.'
            ],
            casual: [
                'Mantap bro! 🔥',
                'Sip lah! Ada cerita lain?',
                'Oke deh! Gimana lagi nih?',
                'Cool! 😎 Mau bahas apa lagi?'
            ],
            expert: [
                'Data yang menarik. Perlu analisis lebih mendalam?',
                'Informasi yang valuable. Ada aspek lain yang ingin dieksplorasi?',
                'Berdasarkan input tersebut, ada rekomendasi khusus yang dibutuhkan?'
            ]
        };
        
        const responses = generalResponses[persona] || generalResponses.friendly;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async generateSummary(text) {
        // Simple summarization logic
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const wordCount = text.split(' ').length;
        
        // Take key sentences (first, middle, last)
        let keyPoints = [];
        if (sentences.length >= 3) {
            keyPoints = [
                sentences[0].trim(),
                sentences[Math.floor(sentences.length / 2)].trim(),
                sentences[sentences.length - 1].trim()
            ];
        } else {
            keyPoints = sentences.map(s => s.trim());
        }
        
        return `**Ringkasan Teks (${wordCount} kata):**\n${text.substring(0, 300)}${text.length > 300 ? '...' : ''}\n\n**Poin Utama:**\n${keyPoints.map((point, i) => `• ${point}`).join('\n')}\n\n*Ringkasan dibuat otomatis oleh AI*`;
    }

    async translateText(text, targetLang) {
        // Simple translation responses (placeholder for actual translation)
        const translations = {
            'english': {
                'halo': 'hello',
                'selamat pagi': 'good morning',
                'selamat siang': 'good afternoon', 
                'selamat malam': 'good evening',
                'terima kasih': 'thank you',
                'sampai jumpa': 'goodbye',
                'apa kabar': 'how are you',
                'nama saya': 'my name is'
            },
            'indonesia': {
                'hello': 'halo',
                'good morning': 'selamat pagi',
                'good afternoon': 'selamat siang',
                'good evening': 'selamat malam',
                'thank you': 'terima kasih',
                'goodbye': 'sampai jumpa',
                'how are you': 'apa kabar',
                'my name is': 'nama saya'
            }
        };
        
        const lowerText = text.toLowerCase();
        const langDict = translations[targetLang.toLowerCase()];
        
        if (langDict) {
            for (const [key, value] of Object.entries(langDict)) {
                if (lowerText.includes(key)) {
                    return text.replace(new RegExp(key, 'gi'), value);
                }
            }
        }
        
        return `Terjemahan ke ${targetLang}: "${text}"\n\n*Catatan: Untuk terjemahan yang lebih akurat, fitur ini memerlukan integrasi dengan API terjemahan.*`;
    }

    async generateWritingHelp(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        let content = '';
        
        if (lowerPrompt.includes('caption') || lowerPrompt.includes('sosial media')) {
            content = `**Caption Media Sosial:**\n\n✨ "Moment terbaik dimulai dari keputusan berani!"\n\n🔥 Kualitas terbaik, harga terjangkau\n💯 Kepuasan pelanggan prioritas utama\n🚀 Siap membantu impian Anda terwujud!\n\n#QualityFirst #TrustedService #CustomerFirst`;
        } else if (lowerPrompt.includes('pengumuman') || lowerPrompt.includes('announcement')) {
            content = `**Pengumuman Resmi:**\n\n📢 PENGUMUMAN PENTING\n\nKepada seluruh member yang terhormat,\n\nDengan ini kami informasikan bahwa [isi pengumuman]. Hal ini bertujuan untuk meningkatkan kualitas layanan kami.\n\nTerima kasih atas perhatian dan kerjasamanya.\n\nSalam,\nManagement Team`;
        } else if (lowerPrompt.includes('email') || lowerPrompt.includes('formal')) {
            content = `**Email Formal:**\n\nSubjek: [Topik yang Relevan]\n\nYth. Bapak/Ibu,\n\nMelalui email ini, saya ingin menyampaikan [tujuan email]. Berdasarkan [konteks], kami berharap dapat [tujuan yang ingin dicapai].\n\nApabila ada hal yang perlu didiskusikan lebih lanjut, silakan hubungi kami.\n\nTerima kasih atas perhatiannya.\n\nHormat saya,\n[Nama Anda]`;
        } else {
            content = `**Konten yang Disesuaikan:**\n\nBerdasarkan request Anda: "${prompt}"\n\nSaya sarankan untuk memulai dengan outline yang jelas, menggunakan bahasa yang sesuai target audience, dan menambahkan call-to-action yang menarik.\n\nApakah Anda ingin saya bantu dengan aspek tertentu dari penulisan ini?`;
        }
        
        return content + `\n\n**Tips Penulisan:**\n• Gunakan bahasa yang mudah dipahami\n• Tambahkan emosi dan personal touch\n• Sertakan call-to-action yang jelas\n• Periksa tata bahasa dan ejaan`;
    }

    // Game methods
    async startQuiz(message, topic) {
        const embed = new EmbedBuilder()
            .setTitle(`🧠 Kuis: ${topic}`)
            .setDescription(`**Pertanyaan 1:**\n[AI-generated question about ${topic}]\n\nA) Option A\nB) Option B\nC) Option C\nD) Option D`)
            .setColor('#FF6B6B');
        await message.reply({ embeds: [embed] });
    }

    async startRPG(message) {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ RPG Adventure')
            .setDescription('Anda berada di hutan yang gelap. Di depan ada dua jalan:\n\n🔹 Jalan kiri menuju gua misterius\n🔹 Jalan kanan menuju sungai\n\nPilih jalan Anda!')
            .setColor('#8B5CF6');
        await message.reply({ embeds: [embed] });
    }

    async startStory(message) {
        const embed = new EmbedBuilder()
            .setTitle('📚 Collaborative Story')
            .setDescription('**Cerita dimulai:**\n\nPada suatu malam yang gelap, seorang petualang menemukan sebuah pintu aneh di tengah hutan...\n\n*Lanjutkan cerita!*')
            .setColor('#10B981');
        await message.reply({ embeds: [embed] });
    }

    async sendRiddle(message) {
        const riddles = [
            'Aku punya mata tapi tidak bisa melihat. Apa aku?',
            'Semakin banyak kamu mengambilku, semakin besar aku. Apa aku?',
            'Aku selalu basah saat bekerja. Apa aku?'
        ];
        const riddle = riddles[Math.floor(Math.random() * riddles.length)];
        
        const embed = new EmbedBuilder()
            .setTitle('🤔 Teka-teki')
            .setDescription(riddle)
            .setColor('#F59E0B');
        await message.reply({ embeds: [embed] });
    }

    async handleGameChat(message) {
        const gameResponse = await this.generateAIResponse(`Gaming context: ${message.content}`, 'friendly');
        await message.reply(`🎮 ${gameResponse}`);
    }

    // Notes methods
    async listNotes(message) {
        const guildNotes = this.notes.get(message.guild.id) || [];
        if (guildNotes.length === 0) {
            return message.reply('📝 Belum ada catatan yang tersimpan.');
        }

        const embed = new EmbedBuilder()
            .setTitle('📝 Daftar Catatan')
            .setDescription(guildNotes.map(note => `**${note.title}** - ${note.body.substring(0, 50)}...`).join('\n'))
            .setColor('#6366F1');
        await message.reply({ embeds: [embed] });
    }

    async setReminder(message) {
        const content = message.content.replace('!remind ', '');
        await message.reply(`⏰ Reminder diset: ${content} (Fitur ini memerlukan implementasi cron job)`);
    }

    async searchNotes(message, query) {
        const guildNotes = this.notes.get(message.guild.id) || [];
        const results = guildNotes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.body.toLowerCase().includes(query.toLowerCase())
        );

        if (results.length === 0) {
            return message.reply(`🔍 Tidak ditemukan catatan dengan kata kunci: "${query}"`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`🔍 Hasil Pencarian: "${query}"`)
            .setDescription(results.map(note => `**${note.title}** - ${note.body}`).join('\n\n'))
            .setColor('#06B6D4');
        await message.reply({ embeds: [embed] });
    }

    // News methods
    async getNews(message, topic) {
        const embed = new EmbedBuilder()
            .setTitle(`📰 Berita: ${topic}`)
            .setDescription(`[Berita terbaru tentang ${topic} akan dimuat disini dengan news API]`)
            .setColor('#EF4444');
        await message.reply({ embeds: [embed] });
    }

    async summarizeURL(message, url) {
        const embed = new EmbedBuilder()
            .setTitle('📄 Ringkasan Artikel')
            .setDescription(`**URL:** ${url}\n\n**Ringkasan:**\n[Artikel akan diringkas disini menggunakan web scraping + AI]`)
            .setColor('#8B5CF6');
        await message.reply({ embeds: [embed] });
    }

    async getTrending(message) {
        const embed = new EmbedBuilder()
            .setTitle('📈 Trending Topics')
            .setDescription('**Topik Trending Hari Ini:**\n• [Trending topic 1]\n• [Trending topic 2]\n• [Trending topic 3]')
            .setColor('#F97316');
        await message.reply({ embeds: [embed] });
    }

    // Memory methods
    async recallMemory(message, query) {
        const guildMemory = this.memories.get(message.guild.id);
        if (!guildMemory) {
            return message.reply('🧠 Belum ada memory yang tersimpan untuk server ini.');
        }

        const results = [];
        for (const [key, data] of guildMemory.entries()) {
            if (data.info.toLowerCase().includes(query)) {
                results.push(data);
            }
        }

        if (results.length === 0) {
            return message.reply(`🔍 Tidak ditemukan memory dengan kata kunci: "${query}"`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`🧠 Memory Recall: "${query}"`)
            .setDescription(results.map(mem => `**Info:** ${mem.info}\n**Disimpan oleh:** ${mem.author}`).join('\n\n'))
            .setColor('#A855F7');
        await message.reply({ embeds: [embed] });
    }

    async forgetMemory(message, query) {
        const guildMemory = this.memories.get(message.guild.id);
        if (!guildMemory) {
            return message.reply('🧠 Belum ada memory yang tersimpan.');
        }

        let deleted = 0;
        for (const [key, data] of guildMemory.entries()) {
            if (data.info.toLowerCase().includes(query)) {
                guildMemory.delete(key);
                deleted++;
            }
        }

        if (deleted === 0) {
            return message.reply(`❌ Tidak ditemukan memory dengan kata kunci: "${query}"`);
        }

        await message.reply(`🗑️ Berhasil menghapus ${deleted} memory dengan kata kunci: "${query}"`);
    }

    async listMemories(message) {
        const guildMemory = this.memories.get(message.guild.id);
        if (!guildMemory || guildMemory.size === 0) {
            return message.reply('🧠 Belum ada memory yang tersimpan untuk server ini.');
        }

        const memories = Array.from(guildMemory.values());
        const embed = new EmbedBuilder()
            .setTitle('🧠 Server Memory Bank')
            .setDescription(memories.map(mem => `• ${mem.info.substring(0, 100)}...`).join('\n'))
            .setColor('#7C3AED')
            .setFooter({ text: `Total: ${memories.length} memories` });
        await message.reply({ embeds: [embed] });
    }
}

module.exports = AIHandler;