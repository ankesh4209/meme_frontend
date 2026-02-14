import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const WalletPage = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ usdBalance: 0, tokenBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* const fetchWalletData = async () => { ... } */ // Moved to useEffect with auth check

  const { user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (user) {
      fetchWalletData();
    }
  }, [user, authLoading, navigate]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const res = await api.get("/header/wallet");

      if (res.data?.success) {
        setWallet(res.data.wallet);
        setError(null);
      }
    } catch (err) {
      console.error("Wallet fetch error:", err);
      // If 401, it might mean token expired even if user state existed
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setError(err.response?.data?.error || "Unauthorized access");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0e11]">
        <div className="h-10 w-10 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const portfolioValue = wallet.usdBalance + wallet.tokenBalance * 0.05;

  return (
    <div className="min-h-screen w-full bg-[#0b0e11] text-slate-200">
      {/* HEADER */}
      <header className="bg-[#0e1117] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                }`}
            />
            <span className="text-xs uppercase tracking-widest text-slate-500">
              {error ? "Disconnected" : "Market Live"}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT (SCROLLABLE) */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-12">
        {/* PORTFOLIO */}
        <section className="bg-[#11151c] border border-white/5 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Portfolio Value
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-white">
            $
            {portfolioValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
            <span className="text-lg text-slate-400 ml-2">USD</span>
          </h1>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="px-6 py-3 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:brightness-110">
              Deposit
            </button>
            <button className="px-6 py-3 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5">
              Withdraw
            </button>
          </div>
        </section>

        {/* ASSETS + ACCOUNT */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ASSETS */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-slate-400">
              Assets
            </h3>

            <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex justify-between">
              <div>
                <p className="text-white font-medium">USD Balance</p>
                <p className="text-xs text-slate-500">Available</p>
              </div>
              <p className="font-semibold text-white">
                ${wallet.usdBalance.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex justify-between">
              <div>
                <p className="text-white font-medium">Pasa Meme Token</p>
                <p className="text-xs text-slate-500">Tradable</p>
              </div>
              <p className="font-semibold text-amber-400">
                {wallet.tokenBalance.toLocaleString()} PM
              </p>
            </div>
          </div>

          {/* ACCOUNT INFO */}
          <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 space-y-4">
            <h4 className="text-sm uppercase tracking-wider text-slate-400">
              Account
            </h4>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">KYC</span>
              <span className="text-emerald-500">Verified</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Daily Limit</span>
              <span className="text-white">$10,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Risk Level</span>
              <span className="text-amber-400">Moderate</span>
            </div>
          </div>
        </section>

        {/* ACTIVITY (BOTTOM - FULL SCROLL) */}
        <section className="space-y-3">
          <h3 className="text-sm uppercase tracking-wider text-slate-400">
            Trade Activity
          </h3>
          <div className="bg-[#11151c] border border-white/5 rounded-xl overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead className="bg-[#0e1117] text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/5">
                  <td className="px-4 py-3 text-slate-400">
                    {new Date().toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white">Wallet Sync</td>
                  <td className="px-4 py-3 text-right text-emerald-500">
                    Completed
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* FOOTER (SCROLLS NATURALLY) */}
      <footer className="mt-12 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Trading Dashboard
      </footer>
    </div>
  );
};

export default WalletPage;
