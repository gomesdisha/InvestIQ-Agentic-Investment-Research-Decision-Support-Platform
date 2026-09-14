import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, FileText, Wrench, Sparkles, RefreshCw } from "lucide-react";
import { agentChat } from "../services/api";

export default function ChatAssistant({ currentTicker }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I am InvestIQ's AI Investment Assistant. I can answer questions about **${currentTicker || "any ticker"}**, retrieve specific details from uploaded 10-K/10-Q filings with exact citations, analyze margins, or run stock comparisons. What would you like to explore?`,
      citations: [],
      tools_used: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    `Why are ${currentTicker || "NVDA"}'s margins expanding?`,
    `What does the 10-K say about China exposure and export controls?`,
    `What are the biggest supply-chain risks mentioned in filings?`,
    `How does the valuation compare relative to fundamentals?`,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (userText) => {
    const text = userText || input;
    if (!text.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: text.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history for context
      const history = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await agentChat(text.trim(), currentTicker, history);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: res.answer,
          citations: res.citations || [],
          tools_used: res.tools_used || [],
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${err.message || "Failed to process question."}`,
          citations: [],
          tools_used: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[520px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            Ask InvestIQ: Agentic Financial Q&A
          </h3>
          <p className="text-xs text-slate-400">
            Autonomous multi-source research agent with citation grounding & tool decisioning
          </p>
        </div>

        {currentTicker && (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Context: {currentTicker}
          </span>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 border-b border-slate-800/60 text-xs">
        <span className="text-slate-500 text-[11px] font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Suggested:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs shrink-0 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3.5 ${
                m.role === "user"
                  ? "bg-emerald-600 text-white font-medium"
                  : "bg-slate-950/80 border border-slate-800 text-slate-200"
              }`}
            >
              {/* Tool Pills */}
              {m.tools_used && m.tools_used.length > 0 && (
                <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-800 text-[10px] font-mono text-cyan-400">
                  <Wrench className="w-3 h-3" />
                  <span>Agent executed:</span>
                  {m.tools_used.map((t, tIdx) => (
                    <span key={tIdx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-line">{m.content}</div>

              {/* Citations Footer */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Document Citations:
                  </div>
                  {m.citations.map((cit, cIdx) => (
                    <div
                      key={cIdx}
                      className="bg-slate-900/90 p-2 rounded border border-slate-800 text-[11px] text-slate-300 font-mono"
                    >
                      <span className="text-emerald-400 font-semibold">{cit.document_name}</span>
                      {cit.page && <span className="text-slate-400"> (Page {cit.page})</span>}
                      <p className="font-sans italic text-slate-400 mt-0.5 line-clamp-2">
                        "{cit.text_snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Agent deciding tools & synthesizing answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-3 border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask a question about ${currentTicker || "a stock"} or uploaded filings...`}
          disabled={loading}
          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
