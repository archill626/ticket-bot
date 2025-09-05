const { Client, GatewayIntentBits } = require('discord.js');
const CONFIG = require('./src/config');
const TicketHandler = require('./src/handlers/ticketHandler');
const CommandHandler = require('./src/handlers/commandHandler');
const StatusHandler = require('./src/handlers/statusHandler');
const ModerationHandler = require('./src/handlers/moderationHandler');

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Initialize handlers
let ticketHandler;
let commandHandler;
let statusHandler;
let moderationHandler;

// Bot ready event
client.once('ready', async () => {
    console.log(`Bot siap! Logged in sebagai ${client.user.tag}`);
    
    // Initialize handlers
    ticketHandler = new TicketHandler(client);
    commandHandler = new CommandHandler(client);
    statusHandler = new StatusHandler(client);
    moderationHandler = new ModerationHandler(client);
    
    // Register slash commands
    await commandHandler.registerSlashCommands();
    
    // Setup ticket panel
    if (CONFIG.TICKET_PANEL_CHANNEL_ID) {
        await ticketHandler.setupTicketPanel();
    } else {
        console.log('⚠️  Mohon atur TICKET_PANEL_CHANNEL_ID di konfigurasi');
    }
    
    // Start status updates
    statusHandler.startStatusUpdate();
    
    console.log('✅ Auto moderation system activated!');
    
});

// Handle message events for auto moderation
client.on('messageCreate', async (message) => {
    try {
        await moderationHandler.moderateMessage(message);
    } catch (error) {
        console.error('Error in message moderation:', error);
    }
});

// Handle interactions (buttons and slash commands)
client.on('interactionCreate', async (interaction) => {
    try {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            await commandHandler.handleSlashCommand(interaction);
            return;
        }

        // Handle button interactions
        if (interaction.isButton()) {
            // Handle regular ticket buttons
            await ticketHandler.handleButtonInteraction(interaction);
            return;
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Bot shutting down...');
    process.exit(0);
});

// Login with token
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN tidak ditemukan di environment variables!');
    console.log('Silakan tambahkan token Discord bot Anda ke environment variables.');
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Gagal login:', error);
    process.exit(1);
});