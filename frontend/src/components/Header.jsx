import React, { useState } from "react";
import { Search, TrendingUp, Cpu, FileText, ArrowRightLeft, ShieldCheck, AlertCircle } from "lucide-react";

export default function Header({
  activeTicker,
  onSelectTicker,
  onSearch,
  loading,
  mode,
  setMode,
  systemStatus
}) {
  const [searchInput, setSearchInput] = useState("");
  const presets = ["NVDA", "AAPL", "MSFT", "TSLA", "AMD", "GOOGL"];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim().toUpperCase());
      setSearchInput("");
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">Invest<span className="text-emerald-400">IQ</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Agentic V1
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Investment Research & Decision Support</p>
            </div>
          </div>

          {/* Search bar & quick chips */}
          <div className="flex-1 max-w-xl flex flex-col gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter stock ticker (e.g. NVDA, AAPL, MSFT)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-24 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </form>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-400 pb-0.5">
              <span className="text-[11px] text-slate-500 font-medium">Quick:</span>
              {presets.map((t) => (
                <button
                  key={t}
                  onClick={() => onSelectTicker(t)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                    activeTicker === t
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Mode & Status */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setMode("report")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  mode === "report"
                    ? "bg-slate-800 text-emerald-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Research Report
              </button>
              <button
                onClick={() => setMode("compare")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  mode === "compare"
                    ? "bg-slate-800 text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Compare Stocks
              </button>
            </div>

            {/* Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${systemStatus?.gemini_configured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span>{systemStatus?.gemini_configured ? `Gemini Active` : "Fallback Mode"}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
