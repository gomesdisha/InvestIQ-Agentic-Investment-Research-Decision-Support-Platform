import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart2, Layers } from "lucide-react";

export default function MarketSnapshot({ snapshot }) {
  if (!snapshot) return null;

  const isPositive = (snapshot.day_change ?? 0) >= 0;
  
  // Calculate 52W range progress percentage
  let rangePercent = 50;
  if (
    snapshot.fifty_two_week_high &&
    snapshot.fifty_two_week_low &&
    snapshot.current_price &&
    snapshot.fifty_two_week_high > snapshot.fifty_two_week_low
  ) {
    const min = snapshot.fifty_two_week_low;
    const max = snapshot.fifty_two_week_high;
    const curr = Math.min(max, Math.max(min, snapshot.current_price));
    rangePercent = Math.round(((curr - min) / (max - min)) * 100);
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-white">{snapshot.ticker}</h2>
            <span className="text-sm font-medium text-slate-300">{snapshot.name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {snapshot.exchange}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-slate-500" /> {snapshot.sector}</span>
            <span>�</span>
            <span>{snapshot.industry}</span>
          </div>
        </div>

        {/* Current Price & Day Change */}
        <div className="text-right">
          <div className="text-3xl font-black tracking-tight text-white font-mono">
            ${snapshot.current_price !== null ? snapshot.current_price.toFixed(2) : "N/A"}
          </div>
          <div className={`flex items-center justify-end gap-1 text-xs font-semibold font-mono ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {snapshot.day_change !== null ? `${isPositive ? "+" : ""}${snapshot.day_change.toFixed(2)}` : "0.00"}
            </span>
            <span>
              ({snapshot.day_change_percent !== null ? `${isPositive ? "+" : ""}${snapshot.day_change_percent.toFixed(2)}%` : "0.00%"})
            </span>
          </div>
        </div>
      </div>

      {/* Primary Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
        
        {/* Market Cap */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Market Cap</div>
          <div className="text-base font-bold text-white mt-1 font-mono">{snapshot.market_cap_formatted || "N/A"}</div>
        </div>

        {/* P/E Ratio (TTM) */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">P/E (TTM)</div>
          <div className="text-base font-bold text-white mt-1 font-mono">
            {snapshot.pe_ratio !== null ? `${snapshot.pe_ratio}x` : "N/A"}
          </div>
        </div>

        {/* Forward P/E */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Forward P/E</div>
          <div className="text-base font-bold text-white mt-1 font-mono">
            {snapshot.forward_pe !== null ? `${snapshot.forward_pe}x` : "N/A"}
          </div>
        </div>

        {/* EPS (TTM) */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">EPS (TTM)</div>
          <div className="text-base font-bold text-white mt-1 font-mono">
            {snapshot.eps !== null ? `$${snapshot.eps.toFixed(2)}` : "N/A"}
          </div>
        </div>

        {/* Volume */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Volume</div>
          <div className="text-base font-bold text-white mt-1 font-mono">
            {snapshot.volume ? (snapshot.volume / 1e6).toFixed(1) + "M" : "N/A"}
          </div>
        </div>

        {/* Avg Volume */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Avg Volume (3M)</div>
          <div className="text-base font-bold text-white mt-1 font-mono">
            {snapshot.avg_volume ? (snapshot.avg_volume / 1e6).toFixed(1) + "M" : "N/A"}
          </div>
        </div>

      </div>

      {/* 52-Week Range Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
          <span>52W Low: ${snapshot.fifty_two_week_low ? snapshot.fifty_two_week_low.toFixed(2) : "N/A"}</span>
          <span className="text-slate-300 font-semibold">52-Week Trading Range</span>
          <span>52W High: ${snapshot.fifty_two_week_high ? snapshot.fifty_two_week_high.toFixed(2) : "N/A"}</span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden relative border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500/40 via-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${rangePercent}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-md -ml-1"
            style={{ left: `${rangePercent}%` }}
            title={`Current: $${snapshot.current_price}`}
          />
        </div>
      </div>

    </div>
  );
}
