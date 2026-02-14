import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import WalletPage from "./pages/WalletPage";

// Dashboard Components
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import ChartHeader from "./components/ChartHeader";
import TradingViewChart from "./components/TradingViewChart";
import PositionsTable from "./components/PositionsTable";
import Orderbook from "./components/Orderbook";
import TradePanel from "./components/TradePanel";
import TradeModal from "./components/TradeModal";
import CoinsList from "./components/CoinsList";
import config from "./config/config";

const App = () => {
  const [currentPrice, setCurrentPrice] = useState(67450);
  const [inputPrice, setInputPrice] = useState("67450.00");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderType, setOrderType] = useState("buy");

  useEffect(() => {
    let socket;
    let reconnectTimeout;
    let isUnmounted = false;

    const connect = () => {
      socket = new WebSocket(config.WS_BINANCE_URL);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const livePrice = Number.parseFloat(data.p);

          if (!Number.isNaN(livePrice)) {
            setCurrentPrice(livePrice);
            setInputPrice(
              livePrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            );
          }
        } catch (error) {
          console.error("Price socket parse error:", error);
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

  const handleOpenModal = (type) => {
    setOrderType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <AuthProvider>
        <style>{`
          body { 
            background-color: #0B0E11; 
            color: #EAECEF; 
            min-height: 100vh; 
            margin: 0; 
            font-family: 'Inter', sans-serif; 
            overflow-x: hidden; /* Prevent horizontal scroll only */
          }
        `}</style>

        {/* Global Components (Modal) */}
        <TradeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          orderType={orderType}
          inputPrice={inputPrice}
        />

        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <div className="antialiased flex flex-col h-screen">
                <Header />
                <div className="flex-1 flex overflow-hidden max-[1280px]:flex-col">
                  <LeftSidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <ChartHeader currentPrice={currentPrice} />
                    <TradingViewChart />
                    <PositionsTable />
                  </div>
                  <aside className="w-72 bg-[#15181C] border-l border-[#262930] flex flex-col shrink-0 max-[1280px]:w-full">
                    <Orderbook currentPrice={currentPrice} />
                    <TradePanel
                      onOpenModal={handleOpenModal}
                      inputPrice={inputPrice}
                      setInputPrice={setInputPrice}
                    />
                  </aside>
                </div>
              </div>
            }
          />

          {/* Wallet & Coins */}
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/coin" element={<CoinsList />} />

          {/* Redirect empty path to login */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </>
  );
};

export default App;
