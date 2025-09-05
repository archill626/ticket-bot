const fs = require('fs-extra');
const path = require('path');

class Helpers {
    // Format message templates
    static formatMessage(template, replacements) {
        let formatted = template;
        for (const [key, value] of Object.entries(replacements)) {
            formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        }
        return formatted;
    }

    // Create transcript from channel messages
    static async createTranscriptContent(channel, ticketData) {
        try {
            // Fetch all messages
            let allMessages = [];
            let lastMessageId;

            while (true) {
                const options = { limit: 100 };
                if (lastMessageId) {
                    options.before = lastMessageId;
                }

                const messages = await channel.messages.fetch(options);
                if (messages.size === 0) break;

                allMessages.push(...messages.values());
                lastMessageId = messages.last().id;
            }

            // Sort messages by creation time
            allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

            // Create transcript content
            let transcript = `=== TRANSCRIPT TICKET ===\n`;
            transcript += `Ticket: ${ticketData.ticketNumber}\n`;
            transcript += `Channel: ${channel.name}\n`;
            transcript += `User: ${ticketData.userId}\n`;
            transcript += `Dibuat: ${new Date(ticketData.createdAt).toLocaleString('id-ID')}\n`;
            transcript += `Ditutup: ${new Date().toLocaleString('id-ID')}\n`;
            transcript += `Total Pesan: ${allMessages.length}\n`;
            transcript += `\n=== PESAN ===\n\n`;

            for (const message of allMessages) {
                const timestamp = new Date(message.createdTimestamp).toLocaleString('id-ID');
                const author = message.author.tag;
                const content = message.content || '[Embed/Attachment]';
                
                transcript += `[${timestamp}] ${author}: ${content}\n`;
                
                if (message.embeds.length > 0) {
                    transcript += `  └─ [Embed: ${message.embeds[0].title || 'No title'}]\n`;
                }
                
                if (message.attachments.size > 0) {
                    for (const attachment of message.attachments.values()) {
                        transcript += `  └─ [Attachment: ${attachment.name}]\n`;
                    }
                }
            }

            return { transcript, messageCount: allMessages.length };
        } catch (error) {
            console.error('Error creating transcript content:', error);
            return null;
        }
    }

    // Save transcript file
    static async saveTranscript(transcript, ticketNumber) {
        try {
            const fileName = `transcript-${ticketNumber.toLowerCase()}-${Date.now()}.txt`;
            const filePath = path.join(__dirname, '../../transcripts', fileName);
            
            // Create transcripts directory if it doesn't exist
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, transcript);

            return { fileName, filePath };
        } catch (error) {
            console.error('Error saving transcript:', error);
            return null;
        }
    }

    // Format numbers with Indonesian locale
    static formatNumber(number) {
        return number.toLocaleString('id-ID');
    }

    // Create channel name for tickets
    static createTicketChannelName(username, ticketNumber) {
        return `ticket-${username}-${ticketNumber}`;
    }
}

module.exports = Helpers;