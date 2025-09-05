const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const Helpers = require('../utils/helpers');
const CONFIG = require('../config');


            


class PaymentCommand {
    static data = new SlashCommandBuilder()
        .setName('payment')
        .setDescription('Show payment methods and information');

    static async execute(interaction) {
        try {
            await interaction.deferReply();
            const [gtidResponse] = await Promise.all([
                axios.get(CONFIG.GTID_API_URL)
            ]);
            const data = gtidResponse.data;

            if (!data.priceDL) {
                return interaction.editReply({
                    content: '❌ Data priceDL tidak ditemukan!',
                    ephemeral: true
                });
            }
            const IDRtoDL = '100000';
            const priceInDL = IDRtoDL / data.priceDL.price ;
            const priceInIDR = data.priceDL.price; 

            const embed = new EmbedBuilder()
                .setTitle('💳 Payment Methods')
                .setDescription('**Available payment options for our services:**')
                .addFields(
                    {
                        name: '🏦 Bank Transfer',
                        value: '• BCA: 1234567890\n• Seabank: 27827\n• A/N Raka Putra Ramadhan',
                        inline: false
                    },
                    {
                        name: '💰 E-Wallet',
                        value: '• DANA: 082231202449\n• GoPay: 082231202449\nShoope Pay: 082231202449\n• A/N Raka Putra Ramadhan',
                        inline: false
                    },
                    {
                        name: '🎮 Diamond Locks',
                        value: `• Rate DL : ${Helpers.formatNumber(data.priceDL.price)} | ${priceInDL.toFixed(2) } <:emoji_2:1413212190265184357>\n• World : ${CONFIG.MESSAGES.WORLD}\n• Owner : ${CONFIG.MESSAGES.OWNER}`,
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
                .setImage('https://cdn.discordapp.com/attachments/1413199049296973884/1413216787088277615/MOBILE_PROXY_20250904_225214_0000.png?ex=68bb2032&is=68b9ceb2&hm=281c6b2cdc69689e48995279102a0ffa8addacf983c6cf56320763ad0360d2cd&')
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