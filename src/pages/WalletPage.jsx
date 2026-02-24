// ...existing code up to the main WalletPage logic...

// (UI rendering logic, including OTP UI for deposit and withdrawal)

// Add OTP UI for deposit
// In the deposit section, after the amount input, add:
// <div className="flex gap-2 mt-2">
//   <button onClick={requestDepositOtp} disabled={depositOtpLoading || depositOtpSent} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60">
//     {depositOtpLoading ? "Sending OTP..." : depositOtpSent ? "OTP Sent" : "Get OTP"}
//   </button>
//   <input type="text" value={depositOtp} onChange={e => setDepositOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="px-4 py-2 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm w-32" placeholder="Enter OTP" disabled={!depositOtpSent} />
// </div>
// {depositOtpMsg && (<p className="mt-2 text-sm text-blue-300">{depositOtpMsg}</p>)}

// Add OTP UI for withdraw
// In the withdraw section, after the withdraw amount input, add:
// <div className="flex gap-2 mt-2">
//   <button onClick={requestWithdrawOtp} disabled={withdrawOtpLoading || withdrawOtpSent} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60">
//     {withdrawOtpLoading ? "Sending OTP..." : withdrawOtpSent ? "OTP Sent" : "Get OTP"}
//   </button>
//   <input type="text" value={withdrawOtp} onChange={e => setWithdrawOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="px-4 py-2 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm w-32" placeholder="Enter OTP" disabled={!withdrawOtpSent} />
// </div>
// {withdrawOtpMsg && (<p className="mt-2 text-sm text-blue-300">{withdrawOtpMsg}</p>)}

// ...rest of WalletPage component and export...
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const WalletPage = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({
    usdBalance: 0,
    realUsdBalance: 0,
    tokenBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [depositAmount, setDepositAmount] = useState();
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMessage, setDepositMessage] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [gateway, setGateway] = useState("stripe");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // ...existing code...

  const { user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
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
        setWallet({
          usdBalance: Number(res.data.wallet?.usdBalance || 0),
          realUsdBalance: Number(
            res.data.wallet?.realUsdBalance ?? res.data.wallet?.usdBalance ?? 0,
          ),
          tokenBalance: Number(res.data.wallet?.tokenBalance || 0),
        });
        setLastUpdated(
          res.data.wallet?.updatedAt || res.data.wallet?.createdAt || null,
        );
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

  const formatCardNumber = (value) =>
    value
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length < 3) return cleaned;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  };

  const handleCardDeposit = async (forcedAmount) => {
    const amount = Number(forcedAmount ?? depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setDepositMessage("Enter a valid amount greater than $0.");
      return;
    }

    if (!cardHolder.trim() || cardHolder.trim().length < 3) {
      setDepositMessage("Enter a valid card holder name.");
      return;
    }

    if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ""))) {
      setDepositMessage("Enter a valid card number.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setDepositMessage("Expiry must be in MM/YY format.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setDepositMessage("Enter a valid CVV.");
      return;
    }

    try {
      setDepositLoading(true);
      setDepositMessage("");

      const res = await api.post("/auth/deposit-card", {
        amount,
        gateway,
        cardHolder: cardHolder.trim(),
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiry,
        cvv,
      });

      if (res.data?.success) {
        const nextWallet = {
          usdBalance: Number(res.data.wallet?.usdBalance || 0),
          realUsdBalance: Number(
            res.data.wallet?.realUsdBalance ?? res.data.wallet?.usdBalance ?? 0,
          ),
          tokenBalance: Number(res.data.wallet?.tokenBalance || 0),
        };

        setWallet(nextWallet);
        setDepositMessage(`$${amount.toFixed(2)} added to your account.`);

        const storedUserRaw = localStorage.getItem("user");
        if (storedUserRaw) {
          const storedUser = JSON.parse(storedUserRaw);
          const updatedUser = {
            ...storedUser,
            balance: nextWallet.realUsdBalance,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        setCvv("");
      }
    } catch (err) {
      setDepositMessage(err?.error || "Failed to add balance.");
    } finally {
      setDepositLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0e11]">
        <div className="h-10 w-10 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const activeUsdBalance = wallet.realUsdBalance;
  const portfolioValue = activeUsdBalance + wallet.tokenBalance * 0.05;

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
              className={`w-2 h-2 rounded-full ${
                error ? "bg-red-500" : "bg-emerald-500 animate-pulse"
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
          </h1>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              <select
                value={gateway}
                disabled
                className="px-4 py-3 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm opacity-60 cursor-not-allowed"
              >
                <option value="stripe">Stripe</option>
              </select>
              <div></div>

              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="px-4 py-3 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm"
                placeholder="Card Holder Name"
                autoComplete="cc-name"
              />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                className="px-4 py-3 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm"
                placeholder="Card Number"
                autoComplete="cc-number"
                inputMode="numeric"
              />
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className="px-4 py-3 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm"
                placeholder="MM/YY"
                autoComplete="cc-exp"
                inputMode="numeric"
              />
              <input
                type="password"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="px-4 py-3 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm"
                placeholder="CVV"
                autoComplete="cc-csc"
                inputMode="numeric"
              />

              <input
                type="number"
                min="1"
                step="1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="px-4 py-3 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm"
                placeholder="Amount"
              />
              <button
                onClick={() => handleCardDeposit()}
                disabled={depositLoading}
                className="px-6 py-3 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:brightness-110 disabled:opacity-60"
              >
                {depositLoading ? "Processing..." : "Deposit by Card"}
              </button>
              <button
                onClick={() => handleCardDeposit()}
                disabled={depositLoading}
                className="px-6 py-3 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 disabled:opacity-60"
              >
                Add Funds
              </button>
            </div>
          </div>
          {depositMessage && (
            <p className="mt-3 text-sm text-slate-300">{depositMessage}</p>
          )}
        </section>

        {/* ASSETS + ACCOUNT */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ASSETS */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-slate-400">
              Assets
            </h3>

            <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex flex-col gap-2">
              <div className="flex justify-between">
                <div>
                  <p className="text-white font-medium">Real Balance</p>
                  <p className="text-xs text-slate-500">Available</p>
                </div>
                <p className="font-semibold text-white">
                  $
                  {wallet.realUsdBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm"
                  placeholder="Withdraw Amount"
                  disabled={withdrawLoading}
                />
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || !canWithdraw()}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60"
                >
                  {withdrawLoading ? "Processing..." : "Withdraw"}
                </button>
              </div>
              {withdrawMessage && (
                <p className="mt-2 text-sm text-red-300">{withdrawMessage}</p>
              )}
              {!canWithdraw() && (
                <p className="mt-1 text-xs text-yellow-400">
                  Withdrawal allowed only after 7 days from last deposit/update.
                </p>
              )}
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
