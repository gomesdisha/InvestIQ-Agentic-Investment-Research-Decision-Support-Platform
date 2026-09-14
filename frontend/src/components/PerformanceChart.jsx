import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { TrendingUp, TrendingDown, Clock, ShieldAlert } from "lucide-react";

export default function PerformanceChart({ performance }) {
  const [range, setRange] = useState("1Y");

  const history = performance?.history || [];

  // Filter history points according to selected range
  const filteredData = useMemo(() => {
    if (!history || history.length === 0) return [];
    if (range === "1M") return history.slice(-22);
    if (range === "3M") return history.slice(-64);
    if (range === "6M") return history.slice(-126);
    return history;
  }, [history, range]);

  if (!performance || history.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-center text-slate-400">
        No price performance history available for this ticker.
      </div>
    );
  }

  const startPrice = filteredData[0]?.close ?? 0;
  const endPrice = filteredData[filteredData.length - 1]?.close ?? 0;
  const periodReturn = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
  const isPositive = periodReturn >= 0;

  const minPrice = Math.min(...filteredData.map((d) => d.close));
  const maxPrice = Math.max(...filteredData.map((d) => d.close));
  const padding = (maxPrice - minPrice) * 0.05;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Title & Range Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Price Performance</h3>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {isPositive ? "+" : ""}
              {periodReturn.toFixed(2)}% in {range}
            </span>
          </div>
          <p className="text-xs text-slate-400">Historical daily closing price & volatility</p>
        </div>

        {/* Range Buttons */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          {["1M", "3M", "6M", "1Y"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                range === r
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? "#10b981" : "#f43f5e"}
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "#10b981" : "#f43f5e"}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(d) => {
                const parts = d.split("-");
                return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : d;
              }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[Math.floor(minPrice - padding), Math.ceil(maxPrice + padding)]}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                      <div className="text-slate-400 mb-1">{data.date}</div>
                      <div className="text-white font-bold text-sm">
                        Close: ${data.close?.toFixed(2)}
                      </div>
                      {data.volume > 0 && (
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Vol: {(data.volume / 1e6).toFixed(2)}M
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? "#10b981" : "#f43f5e"}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorClose)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-Horizon Returns & Volatility Pill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-800">
        
        {/* 1M Return */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium uppercase">1M Return</span>
          <div
            className={`text-sm font-bold font-mono mt-0.5 ${
              (performance.return_1m ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {performance.return_1m !== null
              ? `${performance.return_1m >= 0 ? "+" : ""}${performance.return_1m}%`
              : "N/A"}
          </div>
        </div>

        {/* 3M Return */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium uppercase">3M Return</span>
          <div
            className={`text-sm font-bold font-mono mt-0.5 ${
              (performance.return_3m ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {performance.return_3m !== null
              ? `${performance.return_3m >= 0 ? "+" : ""}${performance.return_3m}%`
              : "N/A"}
          </div>
        </div>

        {/* 6M Return */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium uppercase">6M Return</span>
          <div
            className={`text-sm font-bold font-mono mt-0.5 ${
              (performance.return_6m ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {performance.return_6m !== null
              ? `${performance.return_6m >= 0 ? "+" : ""}${performance.return_6m}%`
              : "N/A"}
          </div>
        </div>

        {/* 1Y Return */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium uppercase">1Y Return</span>
          <div
            className={`text-sm font-bold font-mono mt-0.5 ${
              (performance.return_1y ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {performance.return_1y !== null
              ? `${performance.return_1y >= 0 ? "+" : ""}${performance.return_1y}%`
              : "N/A"}
          </div>
        </div>

        {/* Annualized Volatility */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 font-medium uppercase flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" /> Ann. Volatility
          </span>
          <div className="text-sm font-bold font-mono mt-0.5 text-amber-300">
            {performance.volatility_annualized !== null
              ? `${performance.volatility_annualized}%`
              : "N/A"}
          </div>
        </div>

      </div>
    </div>
  );
}
