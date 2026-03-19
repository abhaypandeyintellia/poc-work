const stocks = {
  AAPL: 150,
  GOOGL: 140,
  MSFT: 380,
  TSLA: 250,
  AMZN: 170
};

class PriceGenerator {
  constructor() {
    this.prices = { ...stocks };
  }

  generatePrice(symbol) {
    if (!this.prices[symbol]) return null;
    
    const change = (Math.random() - 0.5) * 2;
    this.prices[symbol] = Math.max(this.prices[symbol] + change, 1);
    
    return {
      symbol,
      price: parseFloat(this.prices[symbol].toFixed(2)),
      timestamp: new Date().toISOString()
    };
  }

  getAllPrices() {
    return Object.keys(this.prices).map(symbol => this.generatePrice(symbol));
  }

  getAvailableSymbols() {
    return Object.keys(stocks);
  }
}

export default new PriceGenerator();

// client/src/App.jsx
const ws = new WebSocket('ws://localhost:8080');
