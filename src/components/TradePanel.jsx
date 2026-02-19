import React, { useState, useEffect } from "react";
import api from "../api/axios";

const TradePanel = ({ inputPrice, setInputPrice }) => {
  const [size, setSize] = useState("");
  const [leverage, setLeverage] = useState(20);
  const [balance, setBalance] = useState(0);
  const [realBalance, setRealBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // --- REAL PRICE AUTO-UPDATE LOGIC ---
  // Whenever inputPrice (BTC live) changes via props, keep this field in sync
  useEffect(() => {
    if (inputPrice) {
      setInputPrice(inputPrice);
    }
  }, [inputPrice, setInputPrice]);

  // Sync Balance
  useEffect(() => {
    const syncWallet = async () => {
      try {
        const res = await api.get("/header/wallet");
        if (res.data?.success) {
          const nextReal = Number(
            res.data.wallet?.realUsdBalance ?? res.data.wallet?.usdBalance ?? 0,
          );

          setRealBalance(nextReal);
          setBalance(nextReal);
        }
      } catch {
        const storedUser = JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(localStorage.getItem("user_data")) || { balance: 0 };
        setRealBalance(Number(storedUser.balance || 0));
        setBalance(Number(storedUser.balance || 0));
      }
    };

    syncWallet();
  }, []);

  useEffect(() => {
    setBalance(realBalance);
  }, [realBalance]);

  const currentPrice = inputPrice
    ? parseFloat(inputPrice.toString().replace(/,/g, ""))
    : 0;
  const totalCost = (currentPrice * Number(size)).toFixed(2);
  const marginRequired = (totalCost / leverage).toFixed(2);
  const isInsufficient = parseFloat(marginRequired) > balance;

  const handlePercentage = (pct) => {
    if (!currentPrice || currentPrice <= 0) return;
    const calculatedSize = (
      (balance * (pct / 100) * leverage) /
      currentPrice
    ).toFixed(3);
    setSize(calculatedSize);
  };

  const placeTrade = async (side) => {
    if (!currentPrice || !size || size <= 0) return alert("Enter Size");
    if (isInsufficient) return alert("Insufficient Balance!");

    setLoading(true);
    setTimeout(async () => {
      try {
        const res = await api.patch("/auth/balance", {
          amount: -Number(marginRequired),
        });

        const nextReal = Number(
          res.data?.wallet?.realUsdBalance ??
            res.data?.wallet?.usdBalance ??
            realBalance,
        );

        setRealBalance(nextReal);
        setBalance(nextReal);

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, balance: nextReal }),
        );

        setModalData({
          side,
          price: currentPrice.toLocaleString(),
          size,
          margin: marginRequired,
        });
        setShowModal(true);
        setSize("");
      } catch (error) {
        alert(error?.error || "Trade failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-[#15181C] text-white border-l border-[#2B3139] w-full relative">
      {/* SUCCESS MODAL */}
      {showModal && (
        <div className="fixed lg:absolute inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-2xl p-6 w-full max-w-[280px] shadow-2xl">
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${modalData.side === "buy" ? "bg-[#0ECB81]/20 text-[#0ECB81]" : "bg-[#F6465D]/20 text-[#F6465D]"}`}
            >
              <svg
                className="w-7 h-7"
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
            <h3 className="text-center font-bold text-white uppercase tracking-tight">
              Order Placed
            </h3>
            <div className="my-4 space-y-2 bg-[#15181C] p-3 rounded-lg border border-white/5 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase">
                  Price
                </span>
                <span className="text-white">${modalData.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase">
                  Margin
                </span>
                <span className="text-[#FCD535]">${modalData.margin}</span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 bg-[#FCD535] text-black rounded-lg font-bold text-xs uppercase"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* TRADE INPUTS */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex justify-between text-xs sm:text-[11px]">
          <span className="text-slate-500 font-bold uppercase">Available</span>
          <span className="text-white font-mono">
            ${balance.toLocaleString()}
          </span>
        </div>

        {/* --- REAL-TIME PRICE BOX --- */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs sm:text-[10px] text-slate-500 font-black uppercase">
              Price ($)
            </label>
            <span className="text-xs sm:text-[9px] text-[#0ECB81] font-bold tracking-tighter">
              ● LIVE STREAMING
            </span>
          </div>
          <input
            type="text"
            value={inputPrice}
            readOnly // Optional: keep readOnly so manual edits do not interrupt live updates
            className="w-full bg-[#1E2329] p-3 sm:p-3 rounded-xl border border-white/5 text-[#0ECB81] font-mono font-bold text-sm sm:text-base outline-none shadow-inner"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-[10px] text-slate-500 font-black uppercase">
            Size (BTC)
          </label>
          <input
            type="number"
            placeholder="0.000"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full bg-[#1E2329] p-3 rounded-xl border border-white/5 focus:border-[#FCD535]/50 outline-none transition-all font-mono"
          />
        </div>

        {/* Leverage Slider */}
        <div className="space-y-2 py-2">
          <div className="flex justify-between text-xs sm:text-[10px] font-bold">
            <span className="text-slate-500 uppercase">Leverage</span>
            <span className="text-[#FCD535]">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="125"
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
            className="w-full accent-[#FCD535] h-1.5 sm:h-1.5 bg-[#2B3139] rounded-lg"
          />
        </div>

        {/* Percent Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => handlePercentage(p)}
              className="bg-[#2B3139] py-2 sm:py-2 rounded-lg text-xs sm:text-[10px] font-bold hover:bg-[#FCD535] hover:text-black transition-all"
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Calculation Info */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/[0.03] mt-2">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-500 font-bold uppercase">
              Margin Required
            </span>
            <span
              className={`font-mono font-bold ${isInsufficient ? "text-red-500 animate-pulse" : "text-[#FCD535]"}`}
            >
              ${marginRequired}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-3 sm:p-4 mt-auto border-t border-[#2B3139] flex gap-2 bg-[#15181C]">
        <button
          onClick={() => placeTrade("buy")}
          disabled={loading}
          className="flex-1 bg-[#0ECB81] hover:brightness-110 py-3 sm:py-4 rounded-xl font-black text-black text-sm sm:text-xs uppercase active:scale-95 transition-all"
        >
          Buy / Long
        </button>
        <button
          onClick={() => placeTrade("sell")}
          disabled={loading}
          className="flex-1 bg-[#F6465D] hover:brightness-110 py-3 sm:py-4 rounded-xl font-black text-white text-sm sm:text-xs uppercase active:scale-95 transition-all"
        >
          Sell / Short
        </button>
      </div>
    </div>
  );
};

export default TradePanel;
