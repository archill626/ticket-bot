const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

class AddCommand {
    static data = new SlashCommandBuilder()
        .setName('add')
        .setDescription('Menambahkan user ke dalam tiket')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User yang akan ditambahkan ke tiket')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

    static async execute(interaction) {
        try {
            const userToAdd = interaction.options.getUser('user');
            const channel = interaction.channel;

            // Cek apakah command dijalankan di dalam channel tiket
            if (!channel.name.startsWith('ticket-')) {
                return interaction.reply({
                    content: '❌ Command ini hanya bisa digunakan di dalam channel tiket!',
                    ephemeral: true
                });
            }

            // Cek apakah user sudah ada di channel
            const memberPermissions = channel.permissionOverwrites.cache.get(userToAdd.id);
            if (memberPermissions && memberPermissions.allow.has('ViewChannel')) {
                return interaction.reply({
                    content: `❌ ${userToAdd.username} sudah ada di tiket ini!`,
                    ephemeral: true
                });
            }

            // Tambahkan user ke channel tiket
            await channel.permissionOverwrites.create(userToAdd, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            // Reply dengan konfirmasi
            await interaction.reply({
                content: `✅ ${userToAdd} berhasil ditambahkan ke tiket ini!`,
                ephemeral: false
            });

            // Log aktivitas
            console.log(`User ${userToAdd.username} ditambahkan ke tiket ${channel.name} oleh ${interaction.user.username}`);

        } catch (error) {
            console.error('Error executing add command:', error);
            await interaction.reply({
                content: '❌ Terjadi kesalahan saat menambahkan user ke tiket!',
                ephemeral: true
            });
        }
    }
}

module.exports = AddCommand;