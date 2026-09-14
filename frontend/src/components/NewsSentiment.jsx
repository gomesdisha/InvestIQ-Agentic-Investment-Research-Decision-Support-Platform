import React from "react";
import { Newspaper, ExternalLink, Activity, Radio } from "lucide-react";

export default function NewsSentiment({ news, sentiment, sentimentScore, rationale }) {
  const getSentimentBadge = () => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Negative":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "Mixed":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  // Convert score (-1 to 1) to percentage (0 to 100)
  const scorePct = Math.round(((sentimentScore ?? 0) + 1) * 50);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-cyan-400" />
            Recent Market Developments & Sentiment
          </h3>
          <p className="text-xs text-slate-400">
            Real-time news monitoring paired with qualitative sentiment reasoning
          </p>
        </div>

        {/* Sentiment Label & Score */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400 font-medium uppercase">Score: {(sentimentScore ?? 0) > 0 ? "+" : ""}{(sentimentScore ?? 0).toFixed(2)}</div>
            <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${scorePct}%` }}
              />
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border font-mono ${getSentimentBadge()}`}
          >
            {sentiment || "Neutral"}
          </span>
        </div>
      </div>

      {/* Rationale */}
      {rationale && (
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 mb-4 text-xs leading-relaxed text-slate-300">
          <span className="font-semibold text-slate-200">Sentiment Catalyst Analysis: </span>
          {rationale}
        </div>
      )}

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {news && news.length > 0 ? (
          news.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/70 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 mb-1">
                  <span className="font-medium text-emerald-400/90">{item.publisher}</span>
                  {item.publish_time && (
                    <span>
                      {new Date(item.publish_time).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <h5 className="text-xs font-bold text-slate-200 line-clamp-2 hover:text-white transition-colors">
                  {item.title}
                </h5>
                {item.summary && (
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400 line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </div>

              {item.link && item.link !== "#" && (
                <div className="mt-2 pt-2 border-t border-slate-800/60">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Read source article <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 text-xs text-slate-500 italic p-4 text-center">
            No recent news stories indexed for this ticker.
          </div>
        )}
      </div>
    </div>
  );
}
