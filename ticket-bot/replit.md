# Discord Ticket Bot

## Overview

This is a Discord bot designed for managing ticket-based purchasing systems. The bot automatically creates private ticket channels when users click a button, manages ticket numbering, stores conversation transcripts, and provides notification systems for both owners and users. It's built with Discord.js v14 and uses a simple JSON file-based storage system for ticket data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Bot Framework
- **Discord.js v14**: Core Discord API wrapper for handling bot interactions, slash commands, and Discord events
- **Node.js**: Runtime environment for the JavaScript bot application
- **Event-driven Architecture**: Bot responds to Discord events like button clicks, message creation, and user interactions

### Data Management
- **JSON File Storage**: Simple file-based storage using `tickets.json` for persisting ticket data
- **fs-extra**: Enhanced file system operations for reading/writing ticket data and transcript files
- **Data Structure**: Organized ticket data with sequential numbering, active ticket tracking, and user-ticket mapping

### Channel Management System
- **Dynamic Channel Creation**: Automatically creates private ticket channels with specific naming conventions (`ticket-username-001`)
- **Permission System**: Sets channel permissions to restrict access to ticket creator and bot administrators
- **Auto Numbering**: Sequential ticket numbering system to ensure unique ticket identifiers

### User Interface Components
- **Button-based Interface**: Interactive buttons for opening/closing tickets using Discord's ActionRow and ButtonBuilder
- **Embed Messages**: Rich embed formatting for ticket panels and status messages
- **Anti-spam Protection**: Cooldown system to prevent button spam and multiple ticket creation per user

### Notification System
- **Direct Message Notifications**: Automated DM system for notifying owners when tickets are opened and users when tickets are closed
- **Transcript Generation**: Automatic conversation logging and file generation when tickets are closed
- **Channel-based Logging**: Dedicated transcript channel for storing ticket conversation history

### Configuration Management
- **Environment Variables**: Discord bot token stored securely in environment variables
- **JSON Configuration**: Channel IDs, owner information, and bot settings stored in `config.json`
- **Runtime Configuration**: Settings loaded at startup with fallback handling for missing configurations

## External Dependencies

### Discord Platform
- **Discord API**: Core platform integration through Discord.js library
- **Bot Permissions**: Requires specific Discord permissions including channel management, message handling, and member access
- **Guild Integration**: Operates within Discord servers with role-based access control

### Node.js Ecosystem
- **discord.js v14.22.1**: Primary Discord API wrapper library
- **fs-extra v11.3.1**: Enhanced file system operations for data persistence and transcript generation

### File System Dependencies
- **Local Storage**: Relies on server file system for storing `tickets.json` data and transcript files
- **Text File Generation**: Creates `.txt` transcript files containing full conversation history

### Server Requirements
- **Node.js Runtime**: Requires Node.js environment for bot execution
- **Persistent Storage**: Needs writable file system access for data persistence
- **Network Access**: Requires internet connectivity for Discord API communication