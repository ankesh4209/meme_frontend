import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const WalletPage = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({
    usdBalance: 0,
    realUsdBalance: 0,
    demoUsdBalance: 1000,
    tokenBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [depositAmount, setDepositAmount] = useState(1000);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMessage, setDepositMessage] = useState("");
  const [accountType, setAccountType] = useState("demo");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [gateway, setGateway] = useState(
    import.meta.env.VITE_DEFAULT_PAYMENT_GATEWAY || "mock",
  );

  /* const fetchWalletData = async () => { ... } */ // Moved to useEffect with auth check

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

  useEffect(() => {
    localStorage.setItem("tradeAccountType", accountType);

    if (accountType === "demo") {
      setCardHolder("");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setDepositMessage("");
    }
  }, [accountType]);

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
          usdBalance: Number(res.data.wallet?.usdBalance || 1000),
          realUsdBalance: Number(
            res.data.wallet?.realUsdBalance ?? res.data.wallet?.usdBalance ?? 0,
          ),
          demoUsdBalance: Number(res.data.wallet?.demoUsdBalance ?? 1000),
          tokenBalance: Number(res.data.wallet?.tokenBalance || 0),
        });
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

    if (accountType === "real") {
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
    }

    try {
      setDepositLoading(true);
      setDepositMessage("");

      const request =
        accountType === "real"
          ? api.post("/auth/deposit-card", {
              amount,
              accountType,
              gateway,
              cardHolder: cardHolder.trim(),
              cardNumber: cardNumber.replace(/\s/g, ""),
              expiry,
              cvv,
            })
          : api.patch("/auth/balance", {
              amount,
              accountType: "demo",
            });

      const res = await request;

      if (res.data?.success) {
        const nextWallet = {
          usdBalance: Number(res.data.wallet?.usdBalance || 1000),
          realUsdBalance: Number(
            res.data.wallet?.realUsdBalance ??
              res.data.wallet?.usdBalance ??
              1000,
          ),
          demoUsdBalance: Number(res.data.wallet?.demoUsdBalance ?? 1000),
          tokenBalance: Number(res.data.wallet?.tokenBalance || 0),
        };

        setWallet(nextWallet);
        setDepositMessage(
          `$${amount.toFixed(2)} added to ${accountType} account.`,
        );

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

  const activeUsdBalance =
    accountType === "demo" ? wallet.demoUsdBalance : wallet.realUsdBalance;
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
          <div className="mt-4 inline-flex rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setAccountType("real")}
              className={`px-4 py-2 text-sm ${accountType === "real" ? "bg-emerald-500 text-black font-semibold" : "bg-transparent text-slate-300"}`}
            >
              Real
            </button>
            <button
              onClick={() => setAccountType("demo")}
              className={`px-4 py-2 text-sm ${accountType === "demo" ? "bg-emerald-500 text-black font-semibold" : "bg-transparent text-slate-300"}`}
            >
              Demo
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {accountType === "demo"
              ? "Demo mode is for testing only. You start with $1000."
              : "Real mode requires card payment and gateway processing."}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {accountType === "real" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                <select
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm"
                >
                  <option value="mock">Demo Gateway (Mock)</option>
                  <option value="stripe">Stripe</option>
                  <option value="razorpay">Razorpay</option>
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
                  onClick={() => handleCardDeposit(1000)}
                  disabled={depositLoading}
                  className="px-6 py-3 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 disabled:opacity-60"
                >
                  Add $1000
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
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
                  {depositLoading ? "Processing..." : "Add Demo Balance"}
                </button>
                <button
                  onClick={() => handleCardDeposit(1000)}
                  disabled={depositLoading}
                  className="px-6 py-3 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 disabled:opacity-60"
                >
                  Add $1000
                </button>
              </div>
            )}
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

            <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex justify-between">
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

            <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex justify-between">
              <div>
                <p className="text-white font-medium">Demo Balance</p>
                <p className="text-xs text-slate-500">Available</p>
              </div>
              <p className="font-semibold text-white">
                $
                {wallet.demoUsdBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
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
