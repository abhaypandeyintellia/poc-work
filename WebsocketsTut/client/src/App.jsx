import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [prices, setPrices] = useState({});
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [availableSymbols, setAvailableSymbols] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to server');
      setConnected(true);
      ws.send(JSON.stringify({ type: 'GET_SYMBOLS' }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'PRICE_UPDATE') {
        const newPrices = {};
        message.data.forEach(update => {
          newPrices[update.symbol] = update;
        });
        setPrices(prev => ({ ...prev, ...newPrices }));
      } else if (message.type === 'SYMBOLS') {
        setAvailableSymbols(message.symbols);
      } else if (message.type === 'SUBSCRIBED' || message.type === 'UNSUBSCRIBED') {
        console.log(message.message);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('Disconnected');
    };

    wsRef.current = ws;

    return () => ws.close();
  }, []);

  const toggleSubscription = (symbol) => {
    const isSubscribed = subscriptions.has(symbol);
    
    if (isSubscribed) {
      wsRef.current.send(JSON.stringify({ type: 'UNSUBSCRIBE', symbol }));
      const newSubs = new Set(subscriptions);
      newSubs.delete(symbol);
      setSubscriptions(newSubs);
      setPrices(prev => {
        const updated = { ...prev };
        delete updated[symbol];
        return updated;
      });
    } else {
      wsRef.current.send(JSON.stringify({ type: 'SUBSCRIBE', symbol }));
      setSubscriptions(new Set(subscriptions).add(symbol));
    }
  };

  return (
    <div className="App">
      <h1>📈 Stock Ticker Simulator</h1>
      <p className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </p>

      <div className="symbols-grid">
        <h2>Available Stocks</h2>
        {availableSymbols.map(symbol => (
          <button
            key={symbol}
            onClick={() => toggleSubscription(symbol)}
            className={`symbol-btn ${subscriptions.has(symbol) ? 'active' : ''}`}
          >
            {symbol}
          </button>
        ))}
      </div>

      <div className="prices-grid">
        <h2>Live Prices</h2>
        {Object.entries(prices).map(([symbol, data]) => (
          <div key={symbol} className="price-card">
            <h3>{symbol}</h3>
            <p className="price">${data.price}</p>
            <p className="timestamp">{new Date(data.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );



}

export default App;
