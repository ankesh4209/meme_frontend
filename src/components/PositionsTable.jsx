import React from "react";

const PositionsTable = () => {
  return (
    <div className="flex-1 bg-[#15181C] border-t border-[#262930] flex flex-col w-full overflow-hidden">

      {/* Tabs */}
      <div className="flex border-b border-[#262930] text-[11px] sm:text-xs font-bold bg-[#15181C] sticky top-0 z-30">
        <button className="px-3 sm:px-4 py-3 text-[#FCD535] border-b-2 border-[#FCD535] whitespace-nowrap">
          Positions (1)
        </button>
        <button className="px-3 sm:px-4 py-3 text-slate-400 hover:text-white whitespace-nowrap">
          Open Orders (0)
        </button>
        <button className="px-3 sm:px-4 py-3 text-slate-400 hover:text-white whitespace-nowrap">
          History
        </button>
      </div>

      {/* SCROLL AREA */}
      <div className="flex-1 overflow-y-auto font-mono text-xs">

        {/* DESKTOP TABLE */}
        <table className="w-full text-left hidden md:table">
          <thead className="text-slate-500 sticky top-0 bg-[#15181C] z-20">
            <tr>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Entry Price</th>
              <th className="px-4 py-3 font-medium">Mark Price</th>
              <th className="px-4 py-3 font-medium text-right">
                PNL (ROE%)
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#262930]">
            <tr className="hover:bg-[#0B0E11] transition-colors">
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[#0ECB81] font-bold">BTCUSDT</span>
                  <span className="text-[10px] text-slate-500">
                    Isolated 20x
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-white">0.500 BTC</td>
              <td className="px-4 py-3 text-slate-300">66,800.50</td>
              <td className="px-4 py-3 text-slate-300">67,450.00</td>
              <td className="px-4 py-3 text-[#0ECB81] font-bold text-right">
                +324.75 (+19.25%)
              </td>
            </tr>

            {/* Dummy rows to test scroll */}
            {[...Array(8)].map((_, i) => (
              <tr key={i} className="hover:bg-[#0B0E11]">
                <td className="px-4 py-3 text-slate-300">ETHUSDT</td>
                <td className="px-4 py-3 text-white">1.200 ETH</td>
                <td className="px-4 py-3 text-slate-300">3,200.00</td>
                <td className="px-4 py-3 text-slate-300">3,250.00</td>
                <td className="px-4 py-3 text-[#0ECB81] font-bold text-right">
                  +125.50 (+8.2%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden px-3 py-3 space-y-4 pb-6">

          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0B0E11] rounded-xl p-4 border border-[#262930] space-y-4"
            >
              {/* Top */}
              <div className="flex justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#0ECB81]/10 text-[#0ECB81] text-[10px] px-2 py-0.5 rounded font-bold">
                      LONG
                    </span>
                    <span className="font-bold text-white text-sm">
                      BTCUSDT
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      20x • Perp
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Cross Margin
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-slate-500 text-[10px]">
                    Unrealized PNL
                  </p>
                  <p className="text-[#0ECB81] font-bold text-sm">
                    +324.75 USDT
                  </p>
                  <p className="text-[#0ECB81] text-[10px] font-bold">
                    +19.25%
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#262930]">
                <div>
                  <p className="text-slate-500 text-[10px]">Size</p>
                  <p className="text-white text-[12px]">0.500 BTC</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px]">Margin</p>
                  <p className="text-white text-[12px]">1,670 USDT</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Entry</p>
                  <p className="text-slate-300 text-[12px]">66,800.50</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px]">Mark</p>
                  <p className="text-slate-300 text-[12px]">67,450.00</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-[#262930] py-2.5 rounded-lg text-[11px] font-bold text-white">
                  Close
                </button>
                <button className="flex-1 bg-[#262930] py-2.5 rounded-lg text-[11px] font-bold text-white">
                  TP / SL
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PositionsTable;
