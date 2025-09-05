const axios = require('axios');

class CurrencyConverter {
    constructor() {
        // Using Frankfurter API (free, no API key required)
        this.exchangeRateAPI = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=IDR';
        this.cachedRate = null;
        this.lastUpdate = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    }

    async getUSDToIDRRate() {
        try {
            // Check if we have cached data that's still fresh
            if (this.cachedRate && this.lastUpdate && 
                (Date.now() - this.lastUpdate) < this.cacheTimeout) {
                return this.cachedRate;
            }

            // Fetch fresh exchange rate
            const response = await axios.get(this.exchangeRateAPI);
            const rate = response.data.rates.IDR;

            // Cache the result
            this.cachedRate = rate;
            this.lastUpdate = Date.now();

            return rate;
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            
            // Return cached rate if available, otherwise default rate
            if (this.cachedRate) {
                return this.cachedRate;
            }
            
            // Fallback rate (approximate)
            return 16450;
        }
    }

    async convertUSDToIDR(usdAmount) {
        const rate = await this.getUSDToIDRRate();
        return Math.round(usdAmount * rate);
    }

    formatIDR(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatUSD(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    getCacheInfo() {
        if (this.lastUpdate) {
            const cacheAge = Math.round((Date.now() - this.lastUpdate) / 1000 / 60);
            return `Cache: ${cacheAge} menit yang lalu`;
        }
        return 'No cache';
    }
}

module.exports = new CurrencyConverter();