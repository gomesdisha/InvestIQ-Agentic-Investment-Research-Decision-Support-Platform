import React, { useState } from "react";
import { ArrowRightLeft, Sparkles, Scale, RefreshCw, AlertCircle } from "lucide-react";
import { compareStocks } from "../services/api";

export default function StockComparison() {
  const [tickerA, setTickerA] = useState("NVDA");
  const [tickerB, setTickerB] = useState("AMD");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    if (!tickerA.trim() || !tickerB.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await compareStocks(tickerA.trim().toUpperCase(), tickerB.trim().toUpperCase());
      setResult(res);
    } catch (err) {
      setError(err.message || "Failed to compare stocks");
    } finally {
      setLoading(false);
    }
  };

  const a = result?.ticker_a_metrics;
  const b = result?.ticker_b_metrics;

  return (
    <div className="space-y-6">
      
      {/* Input Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Head-to-Head Comparative Research
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Compare two competing publicly traded companies across valuation, revenue scale, profitability, and momentum
        </p>

        <form onSubmit={handleCompare} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Stock A:</span>
            <input
              type="text"
              value={tickerA}
              onChange={(e) => setTickerA(e.target.value.toUpperCase())}
              placeholder="e.g. NVDA"
              className="w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-cyan-500"
            />
          </div>

          <span className="text-slate-500 font-bold text-xs">VS</span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Stock B:</span>
            <input
              type="text"
              value={tickerB}
              onChange={(e) => setTickerB(e.target.value.toUpperCase())}
              placeholder="e.g. AMD"
              className="w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !tickerA.trim() || !tickerB.trim()}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
            {loading ? "Comparing..." : "Run Comparison"}
          </button>
        </form>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {result && a && b && (
        <div className="space-y-6">
          
          {/* Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 font-bold text-xs uppercase tracking-wider text-slate-400">
              Fundamental & Valuation Comparison Matrix
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/40 text-slate-400 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Metric</th>
                    <th className="py-2.5 px-4 font-bold text-emerald-400">{a.ticker} ({a.name})</th>
                    <th className="py-2.5 px-4 font-bold text-cyan-400">{b.ticker} ({b.name})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-400">Current Price</td>
                    <td className="py-2 px-4 font-bold">${a.price?.toFixed(2) || "N/A"}</td>
                    <td className="py-2 px-4 font-bold">${b.price?.toFixed(2) || "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-400">Market Capitalization</td>
                    <td className="py-2 px-4">{a.market_cap_formatted}</td>
                    <td className="py-2 px-4">{b.market_cap_formatted}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-400">Trailing P/E</td>
                    <td className="py-2 px-4">{a.pe_ratio ? `${a.pe_ratio}x` : "N/A"}</td>
                    <td className="py-2 px-4">{b.pe_ratio ? `${b.pe_ratio}x` : "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-400">Forward P/E</td>
                    <td className="py-2 px-4">{a.forward_pe ? `${a.forward_pe}x` : "N/A"}</td>
                    <td className="py-2 px-4">{b.forward_pe ? `${b.forward_pe}x` : "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-400">EPS (TTM)</td>
                    <td className="py-2 px-4">{a.eps ? `$${a.eps}` : "N/A"}</td>
                    <td className="py-2 px-4">{b.eps ? `$${b.eps}` : "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-400">Total Revenue (TTM)</td>
                    <td className="py-2 px-4">{a.revenue_formatted}</td>
                    <td className="py-2 px-4">{b.revenue_formatted}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-400">Net Profit Margin</td>
                    <td className="py-2 px-4 text-emerald-400">{a.profit_margins ? `${a.profit_margins}%` : "N/A"}</td>
                    <td className="py-2 px-4 text-cyan-400">{b.profit_margins ? `${b.profit_margins}%` : "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-400">1-Year Return</td>
                    <td className={`py-2 px-4 ${(a.return_1y ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {a.return_1y !== null ? `${a.return_1y >= 0 ? "+" : ""}${a.return_1y}%` : "N/A"}
                    </td>
                    <td className={`py-2 px-4 ${(b.return_1y ?? 0) >= 0 ? "text-cyan-400" : "text-rose-400"}`}>
                      {b.return_1y !== null ? `${b.return_1y >= 0 ? "+" : ""}${b.return_1y}%` : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-400">52-Week Range</td>
                    <td className="py-2 px-4">${a.fifty_two_week_low} - ${a.fifty_two_week_high}</td>
                    <td className="py-2 px-4">${b.fifty_two_week_low} - ${b.fifty_two_week_high}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Comparative Synthesis */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Comparative Synthesis & Trade-Off Analysis
              </h3>
            </div>

            <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {result.synthesis}
            </div>

            {result.verdict && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-300">
                <span className="font-bold uppercase tracking-wider text-emerald-400 mr-1.5">Analytical Stance:</span>
                {result.verdict}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
