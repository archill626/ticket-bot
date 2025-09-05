const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

class RenameCommand {
    static data = new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Mengganti nama ticket channel ini')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Nama baru untuk tiket ini')
                .setRequired(true)
        );

    static async execute(interaction) {
        const channel = interaction.channel;

        // cek apakah channel ini ticket
        if (!channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: '❌ Command ini hanya bisa digunakan di channel ticket!',
                ephemeral: true
            });
        }

        // cek permission bot
        if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: '❌ Bot tidak punya izin **Manage Channels** untuk rename.',
                ephemeral: true
            });
        }

        const newName = interaction.options.getString('name');

        try {
            await channel.setName(`ticket-${newName}`);
            await interaction.reply({
                content: `✅ Channel berhasil di-rename menjadi **ticket-${newName}**`
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Gagal mengganti nama channel.',
                ephemeral: true
            });
        }
    }
}

module.exports = RenameCommand;
