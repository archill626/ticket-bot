const fs = require('fs-extra');
const path = require('path');

class CommandStateManager {
    constructor() {
        this.stateFile = './command_states.json';
        this.commandStates = this.loadStates();
    }

    loadStates() {
        if (fs.existsSync(this.stateFile)) {
            return JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
        } else {
            // Default: all commands enabled
            const defaultStates = {
                dl: true,
                payment: true
            };
            this.saveStates(defaultStates);
            return defaultStates;
        }
    }

    saveStates(states = this.commandStates) {
        fs.writeFileSync(this.stateFile, JSON.stringify(states, null, 2));
    }

    isCommandEnabled(commandName) {
        return this.commandStates[commandName] !== false;
    }

    enableCommand(commandName) {
        this.commandStates[commandName] = true;
        this.saveStates();
    }

    disableCommand(commandName) {
        this.commandStates[commandName] = false;
        this.saveStates();
    }

    getCommandStatus() {
        return { ...this.commandStates };
    }
}

module.exports = new CommandStateManager();