const { SlashCommandBuilder } = require('discord.js');

class AddCommand {
    static data = new SlashCommandBuilder()
        .setName('adduser')
        .setDescription('Menambahkan user ke dalam ticket saat ini')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User yang ingin ditambahkan')
                .setRequired(true))
     static async execute(interaction) {
        const channel = interaction.channel;
        if (!channel.name.startsWith('ticket-')) {
            return interaction.reply({ content: 'Command ini hanya bisa digunakan di channel tiket!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        try {
            await channel.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
            await interaction.reply({ content: `${user.tag} telah ditambahkan ke tiket ini!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat menambahkan user.', ephemeral: true });
        }
    }
}
module.exports = AddCommand