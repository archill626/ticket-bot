const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const CONFIG = require('../config');

class AdminCommand {
    static data = new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin commands to manage bot features')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable a command')
                .addStringOption(option =>
                    option
                        .setName('command')
                        .setDescription('Command to enable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'dl', value: 'dl' },
                            { name: 'payment', value: 'payment' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable a command')
                .addStringOption(option =>
                    option
                        .setName('command')
                        .setDescription('Command to disable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'dl', value: 'dl' },
                            { name: 'payment', value: 'payment' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Show command status')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    static async execute(interaction) {
        try {
            // Check if user has admin permissions or is the owner
            const isOwner = interaction.user.id === CONFIG.OWNER_ID;
            const hasAdminRole = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

            if (!isOwner && !hasAdminRole) {
                return interaction.reply({
                    content: '❌ You need Administrator permissions to use this command!',
                    ephemeral: true
                });
            }

            const subcommand = interaction.options.getSubcommand();
            const commandHandler = interaction.client.commandHandler;

            if (subcommand === 'enable') {
                const commandName = interaction.options.getString('command');
                commandHandler.enableCommand(commandName);
                
                await interaction.reply({
                    content: `✅ Command \`/${commandName}\` has been **enabled**.`,
                    ephemeral: true
                });

            } else if (subcommand === 'disable') {
                const commandName = interaction.options.getString('command');
                commandHandler.disableCommand(commandName);
                
                await interaction.reply({
                    content: `❌ Command \`/${commandName}\` has been **disabled**.`,
                    ephemeral: true
                });

            } else if (subcommand === 'status') {
                const commandStatus = commandHandler.getCommandStatus();
                
                const embed = new EmbedBuilder()
                    .setTitle('🛠️ Command Status')
                    .setDescription('Current status of all bot commands:')
                    .setColor('#0099ff')
                    .setTimestamp();

                for (const [command, enabled] of Object.entries(commandStatus)) {
                    const status = enabled ? '✅ Enabled' : '❌ Disabled';
                    embed.addFields({
                        name: `/${command}`,
                        value: status,
                        inline: true
                    });
                }

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }

            console.log(`✅ /admin ${subcommand} executed by ${interaction.user.tag}`);

        } catch (error) {
            console.error('Error handling /admin command:', error);
            
            await interaction.reply({
                content: '❌ Error executing admin command!',
                ephemeral: true
            });
        }
    }
}

module.exports = AdminCommand;