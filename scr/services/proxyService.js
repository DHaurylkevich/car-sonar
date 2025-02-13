const proxies = process.env.PROXIES;

class ProxyRotation {
    constructor(proxies) {
        this.proxies = proxies;
        this.currentIndex = 0;
    };

    getNextProxy() {
        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return {
            protocol: 'http',
            host: proxy.ip,
            port: proxy.port,
            auth: `${proxy.login}:${proxy.password}`
        };
    };
};

module.exports = new ProxyRotation();