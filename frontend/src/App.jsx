import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import MarketSnapshot from "./components/MarketSnapshot";
import PerformanceChart from "./components/PerformanceChart";
import Fundamentals from "./components/Fundamentals";
import InvestmentThesis from "./components/InvestmentThesis";
import ResearchSignal from "./components/ResearchSignal";
import RiskFactors from "./components/RiskFactors";
import NewsSentiment from "./components/NewsSentiment";
import DocumentInsights from "./components/DocumentInsights";
import DocumentUpload from "./components/DocumentUpload";
import ChatAssistant from "./components/ChatAssistant";
import StockComparison from "./components/StockComparison";
import { fetchHealth, analyzeStock } from "./services/api";
import { RefreshCw, AlertTriangle, ShieldCheck, Database, Cpu, Terminal } from "lucide-react";

export default function App() {
  const [activeTicker, setActiveTicker] = useState("NVDA");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("report");
  const [systemStatus, setSystemStatus] = useState(null);

  // Load system status
  useEffect(() => {
    fetchHealth()
      .then((data) => setSystemStatus(data))
      .catch((err) => console.warn("Backend not reachable yet", err));
  }, []);

  // Run analysis for ticker
  const runAnalysis = async (ticker) => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeStock(ticker);
      setReport(data);
      setActiveTicker(ticker);
    } catch (err) {
      setError(err.message || `Failed to analyze ${ticker}`);
    } finally {
      setLoading(false);
    }
  };

  // Run initial analysis on NVDA on load
  useEffect(() => {
    runAnalysis("NVDA");
  }, []);

  const handleSelectTicker = (ticker) => {
    setActiveTicker(ticker);
    runAnalysis(ticker);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Header */}
      <Header
        activeTicker={activeTicker}
        onSelectTicker={handleSelectTicker}
        onSearch={handleSelectTicker}
        loading={loading}
        mode={mode}
        setMode={setMode}
        systemStatus={systemStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Comparison Mode */}
        {mode === "compare" && <StockComparison />}

        {/* Research Report Mode */}
        {mode === "report" && (
          <>
            {/* Loading Indicator */}
            {loading && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center shadow-2xl backdrop-blur-md">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  InvestIQ Agent Orchestration in Progress
                </h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                  Retrieving real-time market data, historical performance, financial statements, recent news headlines, and executing semantic RAG over corporate filings for <span className="text-emerald-400 font-mono font-bold">{activeTicker}</span>...
                </p>
                <div className="flex items-center justify-center gap-4 mt-6 text-[11px] font-mono text-slate-500">
                  <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> yfinance Market Data</span>
                  <span>�</span>
                  <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> ChromaDB Filings</span>
                  <span>�</span>
                  <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> LangGraph Decisioning</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-5 text-xs text-rose-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-sm block text-rose-200 mb-1">
                    Analysis Error for {activeTicker}
                  </span>
                  <p>{error}</p>
                  <button
                    onClick={() => runAnalysis(activeTicker)}
                    className="mt-3 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-md border border-rose-500/30 font-semibold"
                  >
                    Retry Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Report Content */}
            {report && !loading && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* 1. Research Signal & Disclaimer */}
                <ResearchSignal
                  signal={report.research_signal}
                  rationale={report.research_signal_rationale}
                  disclaimer={report.disclaimer}
                />

                {/* 2. Market Snapshot & Price Performance Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MarketSnapshot snapshot={report.market_snapshot} />
                  <PerformanceChart performance={report.performance} />
                </div>

                {/* 3. Fundamental Overview & Investment Thesis (Bull/Base/Bear) */}
                <Fundamentals fundamentals={report.fundamentals} />
                <InvestmentThesis thesis={report.investment_thesis} />

                {/* 4. Risk Factors Breakdown */}
                <RiskFactors riskFactors={report.risk_factors} />

                {/* 5. RAG Document Insights */}
                <DocumentInsights
                  insights={report.rag_insights}
                  citations={report.rag_citations}
                  onUploadClick={() => {
                    const el = document.getElementById("document-upload-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                />

                {/* 6. Recent News & Sentiment + Document Upload Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NewsSentiment
                    news={report.recent_news}
                    sentiment={report.news_sentiment}
                    sentimentScore={report.news_sentiment_score}
                    rationale={report.news_sentiment_rationale}
                  />

                  <div id="document-upload-section">
                    <DocumentUpload
                      currentTicker={activeTicker}
                      onDocumentUploaded={() => runAnalysis(activeTicker)}
                    />
                  </div>
                </div>

                {/* 7. Ask InvestIQ (Interactive Follow-up Chat with Grounded Citations) */}
                <ChatAssistant currentTicker={activeTicker} />

              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">InvestIQ</span>
            <span>� Agentic Investment Research & Decision Support Platform</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Tech Stack: FastAPI � LangGraph � Google Gemini � ChromaDB � PyMuPDF � yfinance � React
          </div>
        </div>
      </footer>

    </div>
  );
}
