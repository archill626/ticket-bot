const fs = require('fs-extra');
const CONFIG = require('../config');

class DataManager {
    constructor() {
        this.ticketsData = this.loadTicketsData();
    }

    loadTicketsData() {
        if (fs.existsSync(CONFIG.TICKETS_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG.TICKETS_FILE, 'utf8'));
        } else {
            const defaultData = {
                nextTicketNumber: 1,
                activeTickets: {},
                userTickets: {}
            };
            this.saveTicketsData(defaultData);
            return defaultData;
        }
    }

    saveTicketsData(data = this.ticketsData) {
        fs.writeFileSync(CONFIG.TICKETS_FILE, JSON.stringify(data, null, 2));
    }

    getNextTicketNumber() {
        const number = this.ticketsData.nextTicketNumber;
        this.ticketsData.nextTicketNumber++;
        this.saveTicketsData();
        return String(number).padStart(3, '0');
    }

    addActiveTicket(channelId, ticketInfo) {
        this.ticketsData.activeTickets[channelId] = ticketInfo;
        this.ticketsData.userTickets[ticketInfo.userId] = channelId;
        this.saveTicketsData();
    }

    removeTicket(channelId) {
        const ticketInfo = this.ticketsData.activeTickets[channelId];
        if (ticketInfo) {
            delete this.ticketsData.userTickets[ticketInfo.userId];
            delete this.ticketsData.activeTickets[channelId];
            this.saveTicketsData();
        }
    }

    getUserActiveTicket(userId) {
        return this.ticketsData.userTickets[userId];
    }

    getTicketInfo(channelId) {
        return this.ticketsData.activeTickets[channelId];
    }

    cleanupOrphanedTicket(userId) {
        const channelId = this.ticketsData.userTickets[userId];
        if (channelId) {
            delete this.ticketsData.userTickets[userId];
            delete this.ticketsData.activeTickets[channelId];
            this.saveTicketsData();
        }
    }
}

module.exports = new DataManager();