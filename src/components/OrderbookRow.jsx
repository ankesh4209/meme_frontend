import React from 'react';

const OrderbookRow = ({ price, size, total, type }) => {
  // Depth calculation (kitna bada background bar dikhega)
  const depth = Math.min((total / 10) * 100, 100);
  const bgColor = type === 'ask' ? 'rgba(246, 70, 93, 0.2)' : 'rgba(14, 203, 129, 0.2)';
  
  return (
    <div className="flex justify-between px-3 py-[3px] sm:py-[2px] relative group hover:bg-white/5 transition-colors cursor-pointer">
      {/* Background Depth Bar */}
      <div 
        className="absolute inset-y-0 right-0 transition-all duration-300 ease-out" 
        style={{ 
          width: `${depth}%`,
          backgroundColor: bgColor
        }}
      ></div>
      
      {/* Price Column */}
      <span className={`relative z-10 w-1/3 text-left font-semibold ${type === 'ask' ? 'text-[#F6465D]' : 'text-[#0ECB81]'}`}>
        {price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </span>

      {/* Amount (Size) Column */}
      <span className="relative z-10 w-1/3 text-right text-slate-200">
        {size.toFixed(3)}
      </span>

      {/* Total (Sum) Column - Mobile par iska color thoda light rakha hai */}
      <span className="relative z-10 w-1/3 text-right text-slate-500 text-[10px] sm:text-[11px]">
        {total.toFixed(2)}
      </span>
    </div>
  );
};

export default OrderbookRow;