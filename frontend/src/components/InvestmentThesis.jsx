import React from "react";
import { Sparkles, ArrowUpRight, Minus, ArrowDownRight } from "lucide-react";

export default function InvestmentThesis({ thesis }) {
  if (!thesis) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Investment Thesis: Scenario Analysis
          </h3>
          <p className="text-xs text-slate-400">
            Multi-case probabilistic decision support evaluating catalysts, base execution, and downside risks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Bull Case */}
        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                Bull Case <ArrowUpRight className="w-4 h-4" />
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
              {thesis.bull_case || "Upside scenario driven by market share expansion and operating leverage."}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-400/80 font-medium">
            Catalysts: Moat expansion, pricing leverage & TAM growth
          </div>
        </div>

        {/* Base Case */}
        <div className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                Base Case <Minus className="w-4 h-4" />
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
              {thesis.base_case || "Consensus scenario tracking historical execution and normalized market growth."}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-amber-400/80 font-medium">
            Expectation: Steady earnings delivery & multiple stability
          </div>
        </div>

        {/* Bear Case */}
        <div className="bg-slate-950/70 border border-rose-500/20 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                Bear Case <ArrowDownRight className="w-4 h-4" />
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
              {thesis.bear_case || "Downside scenario triggered by multiple compression, competition, or macro slowdown."}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-rose-400/80 font-medium">
            Downside: Valuation sensitivity & demand deceleration
          </div>
        </div>

      </div>
    </div>
  );
}
