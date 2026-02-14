import React, { useEffect, useRef } from 'react';

const TradingViewChart = () => {
  const containerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) return;

    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        setTimeout(() => {
          if (window.TradingView && containerRef.current) {
            scriptLoadedRef.current = true;
            new window.TradingView.widget({
              autosize: true,
              symbol: "BINANCE:BTCUSDT.P",
              interval: "15",
              timezone: "Etc/UTC",
              theme: "dark",
              style: "1",
              locale: "en",
              toolbar_bg: "#15181C",
              enable_publishing: false,
              backgroundColor: "#0B0E11",
              gridColor: "rgba(38, 41, 48, 0.3)",
              // Mobile optimization: Top toolbar ko mobile par hide ya simplify kar sakte hain
              hide_top_toolbar: window.innerWidth < 768, 
              hide_side_toolbar: window.innerWidth < 1024,
              save_image: false,
              container_id: "tradingview_chart"
            });
          }
        }, 100);
      };
      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  return (

    <div className="w-full h-[350px] md:h-full md:flex-1 bg-[#0B0E11] border-b border-[#262930] overflow-hidden">
      <div className="tradingview-widget-container h-full w-full">
        <div 
          id="tradingview_chart" 
          ref={containerRef} 
          style={{ height: '100%', width: '100%' }}
        ></div>
      </div>
    </div>
  );
};

export default TradingViewChart;