import React from 'react';

const ChartHeader = ({ currentPrice }) => {
  return (
    <div className="min-h-[56px] py-2 bg-[#0B0E11] border-b border-[#262930]
      flex flex-col sm:flex-row items-start sm:items-center
      px-3 sm:px-4 justify-between gap-2 shrink-0 w-full">

      {/* Left Section: Pair and Price */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <h1 className="text-sm sm:text-lg font-bold flex items-center gap-1.5 whitespace-nowrap">
          BTC/USDT
          <span className="text-[8px] sm:text-[10px] text-[#FCD535] px-1.5 rounded bg-[#FCD535]/10">
            PERP
          </span>
        </h1>

        <span className="text-base sm:text-xl font-mono font-bold text-[#0ECB81]">
          {currentPrice.toFixed(2)}
        </span>
      </div>

      {/* Right Section: 24h Stats */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1
        font-mono text-[10px] sm:text-xs text-slate-400 w-full sm:w-auto">

        <div className="flex flex-row sm:flex-col gap-1 sm:gap-0
          border-r border-[#262930] pr-2 sm:pr-0">
          <span className="uppercase text-slate-500 text-[9px] sm:text-[10px]">
            24h Change
          </span>
          <span className="text-[#0ECB81] font-semibold">+2.45%</span>
        </div>

        <div className="flex flex-row sm:flex-col gap-1 sm:gap-0
          border-r border-[#262930] pr-2 sm:pr-0">
          <span className="uppercase text-slate-500 text-[9px] sm:text-[10px]">
            24h High
          </span>
          <span className="text-white sm:text-slate-400">
            68,900.00
          </span>
        </div>

        <div className="flex flex-row sm:flex-col gap-1 sm:gap-0">
          <span className="uppercase text-slate-500 text-[9px] sm:text-[10px]">
            24h Low
          </span>
          <span className="text-white sm:text-slate-400">
            66,100.00
          </span>
        </div>

      </div>
    </div>
  );
};

export default ChartHeader;
