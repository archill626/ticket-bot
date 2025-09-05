# Discord Ticket Bot

## Overview

This is a Discord bot designed for managing ticket-based purchasing systems for mobile proxy services. The bot automatically creates private ticket channels when users click a button, manages sequential ticket numbering, stores conversation transcripts, and provides automated notifications. It includes features for price checking, payment information, admin controls, and AI-powered chat capabilities across multiple specialized channels.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Bot Framework
- **Discord.js v14**: Core Discord API wrapper handling bot interactions, slash commands, button interactions, and Discord events
- **Node.js Runtime**: JavaScript runtime environment with event-driven architecture responding to Discord events
- **Modular Handler System**: Separate handlers for tickets, commands, moderation, AI features, and channel management for clean separation of concerns

### Data Management
- **JSON File Storage**: Simple file-based persistence using `tickets.json` for ticket data and `command_states.json` for feature toggles
- **fs-extra**: Enhanced file system operations for reading/writing ticket data and generating transcript files
- **Sequential Numbering**: Auto-incrementing ticket numbering system ensuring unique identifiers (Ticket-001, Ticket-002, etc.)
- **Active Ticket Tracking**: Maps users to their active tickets preventing multiple simultaneous tickets per user

### Channel Management System
- **Dynamic Channel Creation**: Automatically creates private ticket channels with naming convention `ticket-username-###`
- **Permission-based Access Control**: Restricts ticket channel access to ticket creator, bot administrators, and designated support staff
- **Category Organization**: Uses Discord categories to organize different channel types (tickets, AI features, transcripts)
- **Auto-cleanup**: Removes channels after ticket closure with transcript generation

### User Interface Components
- **Interactive Button System**: Primary interface using Discord's ActionRow and ButtonBuilder for ticket creation
- **Rich Embed Formatting**: Professional-looking embed messages for ticket panels, status updates, and information display
- **Anti-spam Protection**: Cooldown system preventing button spam and duplicate ticket creation
- **Slash Command Integration**: Modern Discord slash commands for admin functions and utility features

### Notification & Logging System
- **Direct Message Notifications**: Automated DM system notifying owners when tickets open and users when tickets close
- **Transcript Generation**: Complete conversation logging with timestamp preservation and file export
- **Dedicated Transcript Channel**: Centralized storage for all ticket transcripts with searchable format
- **Activity Logging**: Console logging for debugging and monitoring bot operations

### External API Integration
- **GTID.dev API**: Real-time pricing data for Diamond Lock (DL) currency used in Growtopia trading
- **Currency Conversion**: Frankfurter API for USD to IDR exchange rates with caching mechanism
- **Rate Limiting**: Built-in API request management to prevent hitting rate limits

### Admin & Moderation Features
- **Command State Management**: Dynamic enabling/disabling of bot commands through admin interface
- **Permission Checks**: Role-based access control for sensitive operations
- **Phishing Detection**: URL scanning and message filtering for security protection
- **User Management**: Add/remove users from tickets with proper permission validation

### AI Features Architecture
- **Multi-channel AI System**: Specialized channels for different AI functions (chat, translation, summarization, etc.)
- **Persona System**: Configurable AI personality modes (professional, friendly, casual, expert)
- **Memory Management**: Per-guild memory storage for context preservation
- **Content Processing**: Text analysis, translation, and content generation capabilities

## External Dependencies

### Discord Platform
- **Discord API**: Complete integration through Discord.js library requiring bot permissions for channel management, message handling, and user interactions
- **Guild Integration**: Server-specific operations with role-based access control and permission management
- **OAuth2 Authentication**: Bot invitation system with specific permission requirements for proper functionality

### Third-party APIs
- **GTID.dev API**: Growtopia trading data source for real-time Diamond Lock pricing information without authentication requirements
- **Frankfurter Exchange Rate API**: Free currency conversion service for USD to IDR rates with 5-minute caching
- **Axios HTTP Client**: Promise-based HTTP client for external API communication with error handling

### Node.js Ecosystem
- **fs-extra**: Enhanced file system operations for JSON data persistence and transcript file generation
- **File System Dependencies**: Local storage for tickets.json, command_states.json, and transcript files in organized directory structure

### Environment Configuration
- **Environment Variables**: Secure storage of Discord bot token through DISCORD_TOKEN environment variable
- **JSON Configuration**: Static configuration file containing channel IDs, owner information, and bot settings loaded at runtime