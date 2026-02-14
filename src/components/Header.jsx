import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Header = () => {
  const { user, logout } = useAuth(); // Use Context
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // Wallet state could be moved to context too, but kept local for now or derived from user
  const [wallet, setWallet] = useState({ usdBalance: user?.balance || 0 });

  // Sync wallet with user context if it updates
  useEffect(() => {
    if (user) {
      setWallet({ usdBalance: user.balance || 0 });
    }
  }, [user]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);


  const WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@trade";
  const [btcPrice, setBtcPrice] = useState("0.00");

  useEffect(() => {
    const btcWs = new WebSocket(WS_URL);
    btcWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBtcPrice(
        parseFloat(data.p).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    };
    return () => btcWs.close();
  }, []);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const handleQuickTrade = (side) => {
    const currentPrice = parseFloat(btcPrice.replace(/,/g, ""));
    const cost = (currentPrice * 0.01) / 20;

    if (wallet.usdBalance < cost) {
      alert("Insufficient Balance!");
      return;
    }

    // NOTE: This logic should ideally be an API call, not just frontend state
    // For now keeping it compatible with existing flow but it won't persist to DB without API
    const newBalance = (wallet.usdBalance - cost).toFixed(2);
    setWallet(prev => ({ ...prev, usdBalance: parseFloat(newBalance) }));

    setModalData({ side, price: btcPrice, margin: cost.toFixed(2) });
    setShowModal(true);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setIsProfileOpen(false);
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      )
        setIsNotificationOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (userData) => {
    if (userData?.username) return userData.username.charAt(0).toUpperCase(); // Backend uses username
    if (userData?.name) return userData.name.charAt(0).toUpperCase();
    if (userData?.email) return userData.email.charAt(0).toUpperCase();
    return "?";
  };

  return (
    <header className="h-14 bg-[#15181C] border-b border-[#262930] flex items-center justify-between px-2 sm:px-4 shrink-0 sticky top-0 z-[100]">
      {/* TRADE SUCCESS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E2329] w-full max-w-[280px] border border-[#2B3139] rounded-xl p-5 shadow-2xl">
            <div
              className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-3 ${modalData.side === "buy"
                ? "bg-[#0ECB81]/20 text-[#0ECB81]"
                : "bg-[#F6465D]/20 text-[#F6465D]"
                }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-center font-bold text-white text-sm uppercase">
              Quick {modalData.side} Placed
            </h3>
            <div className="mt-4 space-y-2 bg-[#15181C] p-3 rounded-lg border border-white/5 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Price</span>
                <span className="text-white">${modalData.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Margin</span>
                <span className="text-[#FCD535]">${modalData.margin}</span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 py-2 bg-[#2B3139] hover:bg-[#363C45] rounded-lg text-xs font-bold text-white transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Left Section */}
      <div className="flex items-center gap-3 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-1 group">
          <span className="font-black text-[#FCD535] tracking-tighter text-lg uppercase italic">
            PASA<span className="text-white">MEME</span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1E2228] rounded border border-white/5 font-mono text-[10px] sm:text-xs">
          <span className="text-[#0ECB81] font-bold">${btcPrice}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-3">
        <button
          onClick={() => navigate("/wallet")}
          className="p-2 text-slate-400 hover:text-[#FCD535] relative group"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20 7V5C20 3.89543 19.1046 3 18 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17H22V7H20ZM18 19H6V5H18V7H11C9.89543 7 9 7.89543 9 9V15C9 16.1046 9.89543 17 11 17H18V19ZM11 9H19V15H11V9ZM13 11V13H17V11H13Z" />
          </svg>
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 text-slate-400 hover:text-white relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31M5 19.5A2.5 2.5 0 017.5 22h9a2.5 2.5 0 010-5"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border border-[#15181C]"></span>
            )}
          </button>
        </div>

        {/* PROFILE SECTION */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center"
          >
            <div className="w-8 h-8 rounded-full bg-[#FCD535] text-black flex items-center justify-center font-bold text-sm ring-2 ring-black">
              {getInitials(user)}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-[#1E2228] border border-[#262930] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 bg-[#15181C] border-b border-[#262930]">
                {/* Agar name nahi hai toh User dikhayega, Loading nahi */}
                <p className="text-[13px] font-bold text-white truncate">
                  {user?.username || user?.name || "User"}
                </p>
                <p className="text-[10px] text-slate-400 truncate opacity-80">
                  {user?.email}
                </p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Spot Balance
                  </span>
                  <p className="text-[12px] text-[#0ECB81] font-mono font-bold">
                    $
                    {wallet?.usdBalance?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="p-3 grid grid-cols-2 gap-2 border-b border-[#262930]">
                <button
                  onClick={() => handleQuickTrade("buy")}
                  className="bg-[#0ECB81] hover:bg-[#0ECB81]/80 text-black text-[11px] font-bold py-2 rounded-lg transition-all uppercase"
                >
                  Buy
                </button>
                <button
                  onClick={() => handleQuickTrade("sell")}
                  className="bg-[#F6465D] hover:bg-[#F6465D]/80 text-white text-[11px] font-bold py-2 rounded-lg transition-all uppercase"
                >
                  Sell
                </button>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    navigate("/wallet");
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-[11px] text-slate-300 hover:bg-[#262930] rounded"
                >
                  My Assets
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-[11px] text-red-400 hover:bg-red-900/10 rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
