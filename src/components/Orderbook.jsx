import React, { useState, useEffect } from 'react';
import OrderbookRow from './OrderbookRow';

const Orderbook = ({ currentPrice }) => {
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const updateBook = () => {
      const newAsks = [];
      const newBids = [];
      let askTotal = 0;
      let bidTotal = 0;

      // Mobile par 15 ki jagah 8-10 rows kaafi hoti hain screen space bachane ke liye
      const rowCount = window.innerWidth < 768 ? 10 : 15;

      for (let i = 0; i < rowCount; i++) {
        const askSize = 0.05 + Math.random() * 1.4;
        askTotal += askSize;
        newAsks.unshift({
          price: currentPrice + (i + 1) * 0.5 + Math.random() * 0.4,
          size: askSize,
          total: askTotal
        });

        const bidSize = 0.05 + Math.random() * 1.4;
        bidTotal += bidSize;
        newBids.push({
          price: currentPrice - (i + 1) * 0.5 - Math.random() * 0.4,
          size: bidSize,
          total: bidTotal
        });
      }

      setAsks(newAsks);
      setBids(newBids);
    };

    updateBook();
    const interval = setInterval(updateBook, 800);
    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <div className="flex-1 flex flex-col min-h-0 border-b border-[#262930] bg-[#15181C]">
      {/* Table Headers */}
      <div className="px-3 py-2 flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-500 border-b border-[#262930] uppercase tracking-tighter">
        <span className="w-1/3 text-left">Price</span>
        <span className="w-1/3 text-right">Size</span>
        <span className="w-1/3 text-right">Sum</span>
      </div>

      <div className="flex-1 overflow-hidden font-mono text-[11px] relative">
        <div className="absolute inset-0 flex flex-col">
          
          {/* Asks (Sellers - Red) */}
          <div className="flex-1 flex flex-col-reverse overflow-hidden text-[#F6465D]">
            {asks.map((ask, i) => (
              <OrderbookRow 
                key={`ask-${i}`} 
                price={ask.price} 
                size={ask.size} 
                total={ask.total} 
                type="ask" 
              />
            ))}
          </div>

          {/* Current Price Highlight (Center) */}
          <div className="py-2 px-3 flex items-center justify-between border-y border-[#262930] bg-[#0B0E11]/80 backdrop-blur-sm">
            <span className="text-sm sm:text-base font-bold text-[#0ECB81]">
              {currentPrice.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500">
              Last Price
            </span>
          </div>

          {/* Bids (Buyers - Green) */}
          <div className="flex-1 overflow-hidden text-[#0ECB81]">
            {bids.map((bid, i) => (
              <OrderbookRow 
                key={`bid-${i}`} 
                price={bid.price} 
                size={bid.size} 
                total={bid.total} 
                type="bid" 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderbook;