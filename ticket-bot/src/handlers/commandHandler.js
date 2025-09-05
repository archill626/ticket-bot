const { REST, Routes } = require('discord.js');
const DLCommand = require('../commands/dlCommand');
const PaymentCommand = require('../commands/paymentCommand');
const AdminCommand = require('../commands/adminCommand');
const AddCommand = require('../commands/addCommand');
const commandStateManager = require('../utils/commandStateManager');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
        this.commandStateManager = commandStateManager;
        this.setupCommands();
        // Make this accessible to admin command
        client.commandHandler = this;
    }

    setupCommands() {
        // Register all commands
        this.commands.set('dl', DLCommand);
        this.commands.set('payment', PaymentCommand);
        this.commands.set('admin', AdminCommand);
        this.commands.set('add', AddCommand);
    }

    async registerSlashCommands() {
        const commands = Array.from(this.commands.values()).map(cmd => cmd.data);
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        try {
            console.log('🔄 Mendaftarkan slash commands...');
            
            await rest.put(
                Routes.applicationCommands(this.client.user.id),
                { body: commands }
            );

            console.log('✅ Slash commands berhasil didaftarkan!');
        } catch (error) {
            console.error('❌ Error registering slash commands:', error);
        }
    }

    async handleSlashCommand(interaction) {
        const commandName = interaction.commandName;
        const command = this.commands.get(commandName);
        
        if (!command) {
            console.error(`No command matching ${commandName} was found.`);
            return;
        }

        // Check if command is enabled (admin command is always enabled)
        if (commandName !== 'admin' && !this.commandStateManager.isCommandEnabled(commandName)) {
            return interaction.reply({
                content: `❌ Command \`/${commandName}\` is currently disabled by administrators.`,
                ephemeral: true
            });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Error executing command:', error);
            
            const errorMessage = {
                content: 'Terjadi kesalahan saat menjalankan command!',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }

    // Methods for admin command
    enableCommand(commandName) {
        this.commandStateManager.enableCommand(commandName);
    }

    disableCommand(commandName) {
        this.commandStateManager.disableCommand(commandName);
    }

    getCommandStatus() {
        return this.commandStateManager.getCommandStatus();
    }
}

module.exports = CommandHandler;