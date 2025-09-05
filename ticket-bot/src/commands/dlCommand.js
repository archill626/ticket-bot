const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const CONFIG = require('../config');
const Helpers = require('../utils/helpers');
const currencyConverter = require('../utils/currencyConverter');

class DLCommand {
    static data = new SlashCommandBuilder()
        .setName('dl')
        .setDescription('Menampilkan harga DL terbaru dari GTID.dev');

    static async execute(interaction) {
        try {
            await interaction.deferReply();

            // Fetch data from GTID.dev API and currency conversion
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

            // Get USD to IDR rate and calculate USD price
            const usdToIdrRate = await currencyConverter.getUSDToIDRRate();
            const priceInUSD = data.priceDL.price / usdToIdrRate;
            const priceInIDR = data.priceDL.price; // priceDL is already in IDR

            // Create simple text response: priceDL | USD
            const responseText = `Rp ${Helpers.formatNumber(data.priceDL.price)} | ${currencyConverter.formatUSD(priceInUSD)}\n**World: **${CONFIG.MESSAGES.WORLD}\n**Owner: **${CONFIG.MESSAGES.OWNER}`;

            await interaction.editReply({
                content: responseText
            });

            console.log(`✅ /dl command executed by ${interaction.user.tag}`);

        } catch (error) {
            console.error('Error handling /dl command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('Terjadi kesalahan saat mengambil data dari API!')
                .setColor('#FF0000')
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
}

module.exports = DLCommand;