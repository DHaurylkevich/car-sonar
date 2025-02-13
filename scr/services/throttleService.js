class AdaptiveThrottle {
    constructor() {
        this.delay = 1500;
    }

    async wait() {
        return new Promise(resolve => setTimeout(resolve, this.delay));
    }

    increaseDelay() {
        this.delay = Math.min(this.delay * 1.5, 10000);
    }

    resetDelay() {
        this.delay = 1500;
    }
}

module.exports = new AdaptiveThrottle();