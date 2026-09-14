import React from "react";
import { Compass, Info, AlertTriangle } from "lucide-react";

export default function ResearchSignal({ signal, rationale, disclaimer }) {
  if (!signal) return null;

  // Signal color styling
  const getBadgeStyle = () => {
    switch (signal) {
      case "Strong Positive":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Positive":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Negative":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "Strong Negative":
        return "bg-rose-500/25 text-rose-300 border-rose-500/50";
      default:
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            Overall Research Signal
          </h3>
          <p className="text-xs text-slate-400">
            Synthesized qualitative stance based on fundamental momentum, valuation, and risks
          </p>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider border font-mono ${getBadgeStyle()}`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            {signal}
          </span>
        </div>
      </div>

      {/* Rationale */}
      {rationale && (
        <div className="mt-3 text-xs leading-relaxed text-slate-300">
          <span className="font-semibold text-slate-200">Analytical Synthesis: </span>
          {rationale}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-300 uppercase tracking-wide">Research Notice: </span>
          {disclaimer || "InvestIQ is an analytical decision-support system for educational and research purposes only. It does not provide personalized investment advice, trading instructions, or guaranteed price predictions."}
        </div>
      </div>
    </div>
  );
}
