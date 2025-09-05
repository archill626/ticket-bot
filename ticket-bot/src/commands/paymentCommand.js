const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const CONFIG = require('../config');

class PaymentCommand {
    static data = new SlashCommandBuilder()
        .setName('payment')
        .setDescription('Show payment methods and information');

    static async execute(interaction) {
        try {
            await interaction.deferReply();

            const embed = new EmbedBuilder()
                .setTitle('💳 Payment Methods')
                .setDescription('**Available payment options for our services:**')
                .addFields(
                    {
                        name: '🏦 Bank Transfer',
                        value: '• BCA: 1234567890\n• Mandiri: 0987654321\n• BRI: 5555666677',
                        inline: false
                    },
                    {
                        name: '💰 E-Wallet',
                        value: '• DANA: 081234567890\n• OVO: 081234567890\n• GoPay: 081234567890',
                        inline: false
                    },
                    {
                        name: '🎮 Game Currency',
                        value: '• Diamond Lock (DL)\n• World Lock (WL)\n• Growtopia Items',
                        inline: false
                    },
                    {
                        name: '📱 Instructions',
                        value: '1. Choose your payment method\n2. Send proof of payment\n3. Wait for confirmation\n4. Service will be activated',
                        inline: false
                    }
                )
                .setColor('#00ff88')
                .setFooter({ text: 'All payments are secure and verified' })
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed]
            });

            console.log(`✅ /payment command executed by ${interaction.user.tag}`);

        } catch (error) {
            console.error('Error handling /payment command:', error);
            
            await interaction.editReply({
                content: '❌ Error showing payment information!'
            });
        }
    }
}

module.exports = PaymentCommand;