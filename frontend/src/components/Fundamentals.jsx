import React, { useState } from "react";
import { Landmark, PieChart, Percent, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

export default function Fundamentals({ fundamentals }) {
  const [expanded, setExpanded] = useState(false);

  if (!fundamentals) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            Fundamental Financial Profile
          </h3>
          <p className="text-xs text-slate-400">Revenue scale, margin quality & capital efficiency</p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Revenue (TTM)</span>
          <div className="text-base font-bold text-white font-mono mt-1">
            {fundamentals.total_revenue_formatted || "N/A"}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Net Income</span>
          <div className="text-base font-bold text-white font-mono mt-1">
            {fundamentals.net_income_formatted || "N/A"}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Gross Margin</span>
          <div className="text-base font-bold text-emerald-400 font-mono mt-1">
            {fundamentals.gross_margins !== null ? `${fundamentals.gross_margins}%` : "N/A"}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Operating Margin</span>
          <div className="text-base font-bold text-emerald-400 font-mono mt-1">
            {fundamentals.operating_margins !== null ? `${fundamentals.operating_margins}%` : "N/A"}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Net Profit Margin</span>
          <div className="text-base font-bold text-emerald-400 font-mono mt-1">
            {fundamentals.profit_margins !== null ? `${fundamentals.profit_margins}%` : "N/A"}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Free Cash Flow</span>
          <div className="text-base font-bold text-cyan-400 font-mono mt-1">
            {fundamentals.free_cashflow_formatted || "N/A"}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Debt to Equity</span>
          <div className="text-base font-bold text-slate-200 font-mono mt-1">
            {fundamentals.debt_to_equity !== null ? `${fundamentals.debt_to_equity}` : "N/A"}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Price to Sales</span>
          <div className="text-base font-bold text-slate-200 font-mono mt-1">
            {fundamentals.price_to_sales !== null ? `${fundamentals.price_to_sales}x` : "N/A"}
          </div>
        </div>

      </div>

      {/* Business Summary Drawer */}
      {fundamentals.summary && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <span>Company Business Description</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {expanded && (
            <p className="mt-2 text-xs leading-relaxed text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              {fundamentals.summary}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
