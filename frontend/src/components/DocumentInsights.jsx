import React from "react";
import { BookOpen, FileText, CheckCircle2, AlertCircle, Upload } from "lucide-react";

export default function DocumentInsights({ insights, citations, onUploadClick }) {
  const hasDocs = citations && citations.length > 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            RAG-Based Financial Insights (Corporate Filings)
          </h3>
          <p className="text-xs text-slate-400">
            Semantic evidence retrieved from uploaded 10-Ks, 10-Qs, and earnings transcripts
          </p>
        </div>

        {hasDocs ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {citations.length} Grounded Source{citations.length > 1 ? "s" : ""}
          </span>
        ) : (
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Filings
          </button>
        )}
      </div>

      {/* Main Insights Text */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 mb-4 text-xs leading-relaxed text-slate-300 whitespace-pre-line">
        {insights || (
          <span className="text-slate-400 italic">
            No corporate financial filings have been uploaded for this company yet. Upload annual reports (10-K), quarterly reports (10-Q), or earnings transcripts to unlock semantic document retrieval.
          </span>
        )}
      </div>

      {/* Citations Excerpts */}
      {hasDocs && (
        <div className="space-y-2 mt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Verified Document Citations & Page References
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {citations.map((cit, idx) => (
              <div
                key={idx}
                className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1.5">
                  <span className="flex items-center gap-1 font-semibold truncate max-w-[200px]">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    {cit.document_name}
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                    {cit.page ? `Page ${cit.page}` : "Doc Excerpt"}
                  </span>
                </div>
                <p className="text-slate-300 italic text-[11px] leading-relaxed line-clamp-3">
                  "{cit.text_snippet}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
