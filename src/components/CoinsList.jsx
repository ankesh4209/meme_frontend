import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "./Header";
import LeftSidebar from "./LeftSidebar";

const symbols = [
  "DOGE",
  "SHIB",
  "PEPE",
  "WIF",
  "FLOKI",
  "BONK",
  "BRETT",
  "POPCAT",
  "MOG",
  "BOME",
];

const streams = symbols
  .map((symbol) => `${symbol.toLowerCase()}usdt@ticker`)
  .join("/");

const MemeCoinsList = () => {
  const navigate = useNavigate();

  const getLocalIcon = (symbol) => {
    try {
      return new URL(
        `../assets/coins/${symbol.toLowerCase()}.png`,
        import.meta.url,
      ).href;
    } catch {
      return "https://via.placeholder.com/32";
    }
  };

  const [memeCoins, setMemeCoins] = useState(() =>
    symbols.map((symbol) => ({
      symbol,
      name: symbol,
      price: "0.000000",
      change: "0.00%",
      up: false,
      localIcon: getLocalIcon(symbol),
    })),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socket;
    let reconnectTimeout;
    let isUnmounted = false;

    const connect = () => {
      socket = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${streams}`,
      );

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const ticker = payload?.data;
          if (!ticker?.s || !ticker?.c || typeof ticker.P === "undefined") {
            return;
          }

          const symbol = ticker.s.replace("USDT", "");
          const priceValue = Number.parseFloat(ticker.c);
          const changePercent = Number.parseFloat(ticker.P);

          setMemeCoins((prevCoins) =>
            prevCoins.map((coin) => {
              if (coin.symbol !== symbol) return coin;
              return {
                ...coin,
                price: Number.isNaN(priceValue)
                  ? coin.price
                  : priceValue.toLocaleString(undefined, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    }),
                change: Number.isNaN(changePercent)
                  ? coin.change
                  : `${changePercent.toFixed(2)}%`,
                up: !Number.isNaN(changePercent) && changePercent >= 0,
              };
            }),
          );

          setLoading(false);
        } catch (error) {
          console.error("Ticker parse error:", error);
        }
      };

      socket.onclose = () => {
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connect, 2000);
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimeout);
      if (socket && socket.readyState <= 1) {
        socket.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#121418] text-[#eaeaeb] font-sans flex flex-col">
      <Header />

      <div className="flex flex-1 mb-6">
        <LeftSidebar />

        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-12 px-4 py-3 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase border-b border-[#23262b] bg-[#121418] flex-shrink-0 z-10">
            <div className="col-span-6 sm:col-span-5">Coin Name</div>
            <div className="col-span-3 text-right">Price</div>
            <div className="col-span-3 sm:col-span-2 text-right">24h %</div>
            <div className="hidden sm:block sm:col-span-2 text-right">
              Action
            </div>
          </div>

          <main className="flex-1">
            {loading && memeCoins.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                Loading Market Data...
              </div>
            ) : (
              <div className="divide-y divide-[#23262b]">
                {memeCoins.map((coin) => (
                  <div
                    key={coin.symbol}
                    onClick={() => navigate("/dashboard")}
                    className="grid grid-cols-12 px-4 py-5 items-center hover:bg-[#1e2329] transition-all active:bg-[#1e2329] active:scale-[0.99] cursor-pointer"
                  >
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                      <img
                        src={coin.localIcon}
                        alt={coin.symbol}
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 rounded-full bg-[#2a2e33] p-1 shadow-md object-contain"
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/32")
                        }
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate">
                          {coin.symbol}
                        </span>
                        <span className="text-[11px] text-gray-500 truncate">
                          {coin.name}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-3 text-right">
                      <div className="text-sm font-semibold tracking-tight">
                        {coin.price}
                      </div>
                      <div className="text-[10px] text-gray-500 hidden sm:block">
                        ${coin.price}
                      </div>
                    </div>

                    <div
                      className={`col-span-3 sm:col-span-2 text-right text-xs font-bold ${
                        coin.up ? "text-[#02c076]" : "text-[#f6465d]"
                      }`}
                    >
                      {coin.change}
                      <div className="sm:hidden text-[9px] text-yellow-500 mt-1 font-medium">
                        Trade →
                      </div>
                    </div>

                    <div className="hidden sm:block sm:col-span-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/dashboard");
                        }}
                        className="text-[#f0b90b] border border-[#f0b90b]/20 px-4 py-2 sm:px-3 sm:py-1 rounded text-sm sm:text-[12px] font-bold cursor-pointer hover:bg-[#f0b90b] hover:text-black transition-all"
                      >
                        Trade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <footer className="sm:hidden h-14 bg-[#1e2329] border-t border-gray-800 flex items-center justify-around flex-shrink-0">
        <div className="text-yellow-500 text-[10px] flex flex-col items-center">
          <span>🏠</span>
          Home
        </div>
        <div className="text-gray-500 text-[10px] flex flex-col items-center">
          <span>📈</span>
          Markets
        </div>
        <div className="text-gray-500 text-[10px] flex flex-col items-center">
          <span>💰</span>
          Wallet
        </div>
      </footer>
    </div>
  );
};

export default MemeCoinsList;
