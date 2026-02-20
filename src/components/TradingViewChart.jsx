import React, { useEffect, useRef } from "react";

const TradingViewChart = ({ selectedCoin }) => {
  const containerRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const allowTradingViewInDev = import.meta.env.VITE_ENABLE_TV_DEV === "true";
  const shouldLoadWidget = import.meta.env.PROD || allowTradingViewInDev;

  // Map supported meme coins to their correct TradingView symbols
  const symbolMap = {
    BTC: "BINANCE:BTCUSDT.P",
    ETH: "BINANCE:ETHUSDT.P",
    DOGE: "BINANCE:DOGEUSDT.P",
    SHIB: "BINANCE:SHIBUSDT.P",
    PEPE: "BINANCE:PEPEUSDT.P",
    WIF: "BINANCE:WIFUSDT.P",
    FLOKI: "BINANCE:FLOKIUSDT.P",
    BONK: "BINANCE:BONKUSDT.P",
    BRETT: "BINANCE:BRETTUSDT.P",
    POPCAT: "BINANCE:POPCATUSDT.P",
    MOG: "BINANCE:MOGUSDT.P",
    BOME: "BINANCE:BOMEUSDT.P",
  };

  useEffect(() => {
    if (!shouldLoadWidget) return;
    if (scriptLoadedRef.current) return;

    const loadScript = () => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        setTimeout(() => {
          if (window.TradingView && containerRef.current) {
            scriptLoadedRef.current = true;
            const tvSymbol =
              symbolMap[selectedCoin?.symbol] || symbolMap["BTC"];
            new window.TradingView.widget({
              autosize: true,
              symbol: tvSymbol,
              interval: "15",
              timezone: "Etc/UTC",
              theme: "dark",
              style: "1",
              locale: "en",
              toolbar_bg: "#15181C",
              enable_publishing: false,
              backgroundColor: "#0B0E11",
              gridColor: "rgba(38, 41, 48, 0.3)",
              hide_top_toolbar: window.innerWidth < 768,
              hide_side_toolbar: window.innerWidth < 1024,
              save_image: false,
              container_id: "tradingview_chart",
            });
          }
        }, 100);
      };
      script.onerror = () => {
        console.error("TradingView script failed to load.");
      };
      document.head.appendChild(script);
    };

    loadScript();
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [shouldLoadWidget, selectedCoin]);

  return (
    <div className="w-full h-[350px] md:h-full md:flex-1 bg-[#0B0E11] border-b border-[#262930] overflow-hidden">
      <div className="tradingview-widget-container h-full w-full">
        <div
          id="tradingview_chart"
          ref={containerRef}
          style={{ height: "100%", width: "100%" }}
        ></div>
      </div>
    </div>
  );
};

export default TradingViewChart;
