import os
import json
import logging
import re
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.prebuilt import create_react_agent

from backend.config import settings
from backend.models.schemas import (
    ResearchReport,
    InvestmentThesis,
    RiskFactors,
    DocumentCitation,
    CompareResponse
)
from backend.services.stock_service import StockService
from backend.services.news_service import NewsService
from backend.rag.retriever import DocumentRetriever
from backend.agent.tools import INVESTMENT_TOOLS
from backend.agent.prompts import (
    SYSTEM_AGENT_PROMPT,
    REPORT_SYNTHESIS_PROMPT,
    COMPARISON_PROMPT
)

logger = logging.getLogger(__name__)

def _extract_text_content(content: Any) -> str:
    """
    Extracts a clean string from LangChain / GenAI message contents,
    handling string outputs as well as structured content block lists.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                if "text" in item and item["text"]:
                    parts.append(item["text"])
                elif "content" in item and item["content"]:
                    parts.append(str(item["content"]))
                else:
                    parts.append(str(item))
            elif hasattr(item, "text") and getattr(item, "text", None):
                parts.append(getattr(item, "text"))
            else:
                parts.append(str(item))
        return "".join(parts)
    return str(content) if content is not None else ""

def get_llm():
    """
    Returns ChatGoogleGenerativeAI if key is present, else None.
    """
    api_key = settings.GOOGLE_API_KEY.strip() if settings.GOOGLE_API_KEY else ""
    if api_key and not api_key.startswith("your_"):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            return ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                google_api_key=api_key,
                temperature=0.2
            )
        except Exception as e:
            logger.error(f"Error initializing ChatGoogleGenerativeAI: {e}")
            return None
    return None

def build_react_agent():
    """
    Builds the LangGraph ReAct agent for interactive Q&A and autonomous tool execution.
    """
    llm = get_llm()
    if llm is None:
        return None
    
    agent = create_react_agent(
        model=llm,
        tools=INVESTMENT_TOOLS,
        prompt=SystemMessage(content=SYSTEM_AGENT_PROMPT)
    )
    return agent

class InvestmentAgent:
    @staticmethod
    def generate_research_report(ticker: str) -> ResearchReport:
        symbol = ticker.strip().upper()
        logger.info(f"Generating research report for {symbol}")

        # 1. Fetch real market snapshot
        snapshot = StockService.get_stock_data(symbol)
        
        # 2. Fetch real performance & chart series
        performance = StockService.get_stock_performance(symbol)
        
        # 3. Fetch fundamentals
        fundamentals = StockService.get_stock_fundamentals(symbol)
        
        # 4. Fetch recent news
        news = NewsService.get_recent_news(symbol, limit=6)
        
        # 5. Fetch RAG documents
        rag_context, rag_citations = DocumentRetriever.search(
            query=f"{symbol} financial results revenue growth gross margins business drivers risks management outlook",
            ticker=symbol,
            top_k=4
        )

        # Prepare strings for prompt
        market_str = (
            f"Ticker: {snapshot.ticker} ({snapshot.name})\n"
            f"Current Price: ${snapshot.current_price or 'N/A'}\n"
            f"Market Cap: {snapshot.market_cap_formatted}\n"
            f"P/E Ratio (TTM): {snapshot.pe_ratio or 'N/A'}, Forward P/E: {snapshot.forward_pe or 'N/A'}\n"
            f"EPS (TTM): ${snapshot.eps or 'N/A'}\n"
            f"52-Week Range: ${snapshot.fifty_two_week_low or 'N/A'} - ${snapshot.fifty_two_week_high or 'N/A'}\n"
            f"Sector: {snapshot.sector}, Industry: {snapshot.industry}"
        )

        perf_str = (
            f"1-Month Return: {performance.return_1m}%\n"
            f"3-Month Return: {performance.return_3m}%\n"
            f"6-Month Return: {performance.return_6m}%\n"
            f"1-Year Return: {performance.return_1y}%\n"
            f"Annualized Volatility: {performance.volatility_annualized}%"
        )

        fund_str = (
            f"Total Revenue: {fundamentals.total_revenue_formatted}\n"
            f"Net Income: {fundamentals.net_income_formatted}\n"
            f"Profit Margin: {fundamentals.profit_margins}%\n"
            f"Operating Margin: {fundamentals.operating_margins}%\n"
            f"Gross Margin: {fundamentals.gross_margins}%\n"
            f"Free Cash Flow: {fundamentals.free_cashflow_formatted}\n"
            f"Debt to Equity: {fundamentals.debt_to_equity}\n"
            f"Price to Sales: {fundamentals.price_to_sales}, Price to Book: {fundamentals.price_to_book}\n"
            f"Business Summary: {fundamentals.summary}"
        )

        news_str = "\n".join([
            f"- [{n.publisher}] {n.title} ({n.publish_time or 'recent'}): {n.summary or ''}"
            for n in news
        ]) if news else "No recent news headlines available."

        llm = get_llm()
        synthesis_data = None

        if llm is not None:
            prompt = REPORT_SYNTHESIS_PROMPT.format(
                ticker=symbol,
                company_name=snapshot.name,
                market_data=market_str,
                performance_data=perf_str,
                fundamentals_data=fund_str,
                news_data=news_str,
                rag_data=rag_context
            )
            try:
                response = llm.invoke([
                    SystemMessage(content=SYSTEM_AGENT_PROMPT),
                    HumanMessage(content=prompt)
                ])
                content = _extract_text_content(response.content).strip()
                # Remove any markdown code block formatting
                if content.startswith("```"):
                    content = re.sub(r"^```[a-zA-Z]*\n?", "", content)
                    content = re.sub(r"\n?```$", "", content)
                synthesis_data = json.loads(content.strip())
            except Exception as e:
                logger.error(f"Error invoking Gemini for report synthesis: {e}")

        # Fallback or rule-based synthesis if LLM is unavailable or JSON parsing failed
        if not synthesis_data:
            synthesis_data = InvestmentAgent._build_heuristic_synthesis(
                snapshot=snapshot,
                performance=performance,
                fundamentals=fundamentals,
                news=news,
                rag_context=rag_context,
                rag_citations=rag_citations
            )

        thesis_dict = synthesis_data.get("investment_thesis", {})
        investment_thesis = InvestmentThesis(
            bull_case=thesis_dict.get("bull_case", ""),
            base_case=thesis_dict.get("base_case", ""),
            bear_case=thesis_dict.get("bear_case", "")
        )

        risks_dict = synthesis_data.get("risk_factors", {})
        risk_factors = RiskFactors(
            operational_risks=risks_dict.get("operational_risks", []),
            market_macro_risks=risks_dict.get("market_macro_risks", []),
            regulatory_risks=risks_dict.get("regulatory_risks", []),
            valuation_risks=risks_dict.get("valuation_risks", [])
        )

        rag_insights_text = synthesis_data.get("rag_insights")
        if not rag_citations and ("No corporate documents" not in (rag_insights_text or "")):
            rag_insights_text = (
                "No financial documents (10-K, 10-Q, earnings transcripts) have been uploaded for this ticker yet. "
                "Upload corporate PDF filings in the Financial Documents section above to unlock document-grounded insights."
            )

        return ResearchReport(
            ticker=symbol,
            company_name=snapshot.name,
            generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            market_snapshot=snapshot,
            performance=performance,
            fundamentals=fundamentals,
            recent_news=news,
            news_sentiment=synthesis_data.get("news_sentiment", "Neutral"),
            news_sentiment_score=synthesis_data.get("news_sentiment_score", 0.0),
            news_sentiment_rationale=synthesis_data.get("news_sentiment_rationale", ""),
            rag_insights=rag_insights_text,
            rag_citations=rag_citations,
            investment_thesis=investment_thesis,
            risk_factors=risk_factors,
            research_signal=synthesis_data.get("research_signal", "Neutral"),
            research_signal_rationale=synthesis_data.get("research_signal_rationale", "")
        )

    @staticmethod
    def _build_heuristic_synthesis(
        snapshot, performance, fundamentals, news, rag_context, rag_citations
    ) -> Dict[str, Any]:
        """
        Provides disciplined, evidence-based synthesis when Gemini LLM key is not configured.
        """
        pos_words = ["surge", "jump", "record", "growth", "beat", "strong", "lead", "rally", "upgrade", "partnership"]
        neg_words = ["fall", "drop", "probe", "investigation", "slump", "miss", "weak", "cut", "risk", "tariff"]
        
        score = 0.0
        news_count = len(news)
        for n in news:
            t = (n.title or "").lower()
            for pw in pos_words:
                if pw in t:
                    score += 0.2
            for nw in neg_words:
                if nw in t:
                    score -= 0.2
        if news_count > 0:
            score = max(-1.0, min(1.0, score / max(1, news_count / 2)))

        sentiment_label = "Neutral"
        if score >= 0.3:
            sentiment_label = "Positive"
        elif score <= -0.3:
            sentiment_label = "Negative"
        elif score != 0:
            sentiment_label = "Mixed"

        ret_1y = performance.return_1y or 0.0
        pe = snapshot.pe_ratio or 25.0
        margin = fundamentals.profit_margins or 15.0

        if ret_1y > 20 and margin > 15 and score >= 0.2:
            signal = "Strong Positive"
            sig_rat = f"{snapshot.ticker} exhibits strong multi-horizon momentum (+{ret_1y:.1f}% 1Y), solid profitability ({margin:.1f}% profit margin), and positive news catalysts."
        elif ret_1y > 0 and margin > 10:
            signal = "Positive"
            sig_rat = f"Favorable operational momentum and steady gross margins support an constructive outlook despite valuation considerations."
        elif ret_1y < -20 and margin < 5:
            signal = "Strong Negative"
            sig_rat = f"Negative price trajectory and contracting margin profile present substantial operational and market headwinds."
        elif ret_1y < 0:
            signal = "Negative"
            sig_rat = f"Underperformance over the trailing 12 months accompanied by mixed financial and market signals."
        else:
            signal = "Neutral"
            sig_rat = f"Balanced profile where premium valuation is balanced by established market position and steady revenue streams."

        rag_insight_str = (
            f"Retrieved {len(rag_citations)} excerpts from uploaded filings for {snapshot.ticker}:\n{rag_context}"
            if rag_citations else
            "No corporate documents (10-K/10-Q) have been uploaded for this ticker yet. Upload a PDF filing to unlock document-grounded financial analysis."
        )

        return {
            "investment_thesis": {
                "bull_case": (
                    f"1. Market Dominance & Moat: {snapshot.name} ({snapshot.ticker}) benefits from high barriers to entry in {snapshot.industry or 'its market'}.\n"
                    f"2. Margin Strength: Trailing net margins of {margin:.1f}% and revenue of {fundamentals.total_revenue_formatted} indicate strong pricing power.\n"
                    f"3. Growth Catalysts: Secular expansion in core product segments and potential operating leverage as scale increases."
                ),
                "base_case": (
                    f"1. Consensus Trajectory: {snapshot.ticker} maintains moderate earnings growth consistent with broad industry trends.\n"
                    f"2. Valuation Normalization: Current P/E of {pe:.1f} reflects premium expectations; returns will likely track fundamental earnings execution.\n"
                    f"3. Capital Allocation: Stable free cash flow ({fundamentals.free_cashflow_formatted}) allows continued reinvestment in R&D and core capital expenditure."
                ),
                "bear_case": (
                    f"1. Valuation Sensitivity: At {pe:.1f}x trailing earnings, the stock has limited margin for error should quarterly growth decelerate.\n"
                    f"2. Competitive & Macro Risks: Shifting macroeconomic conditions and enterprise spending slowdowns could constrain near-term demand.\n"
                    f"3. Execution Headwinds: High customer concentration or supply-chain bottlenecks could pressure operating margins."
                )
            },
            "risk_factors": {
                "operational_risks": [
                    f"Supply chain dependencies and supplier concentration in {snapshot.sector or 'technology'}.",
                    "Talent acquisition and retention in specialized engineering/business functions."
                ],
                "market_macro_risks": [
                    "Sensitivity to broader monetary policy and interest rate fluctuations.",
                    "Potential cyclical slowdown in enterprise customer capital expenditure."
                ],
                "regulatory_risks": [
                    "Antitrust oversight and export control regulations in key international markets.",
                    "Data privacy and compliance mandates across domestic and international jurisdictions."
                ],
                "valuation_risks": [
                    f"P/E ratio of {pe:.1f} demands sustained double-digit earnings growth.",
                    f"52-week spread (${snapshot.fifty_two_week_low} - ${snapshot.fifty_two_week_high}) highlights historical volatility."
                ]
            },
            "news_sentiment": sentiment_label,
            "news_sentiment_score": round(score, 2),
            "news_sentiment_rationale": f"Analyzed {len(news)} recent news items. Headline coverage reflects {sentiment_label.lower()} development flow regarding operational updates and sector momentum.",
            "rag_insights": rag_insight_str,
            "research_signal": signal,
            "research_signal_rationale": sig_rat
        }

    @staticmethod
    def chat(message: str, ticker: Optional[str] = None, history: List[Dict[str, str]] = None) -> Tuple[str, List[DocumentCitation], List[str]]:
        tools_used: List[str] = []
        
        citations: List[DocumentCitation] = []
        doc_context = ""
        
        doc_keywords = ["report", "filing", "10-k", "10-q", "transcript", "margin", "china", "revenue", "risk", "management", "uploaded", "document", "what does"]
        if any(k in message.lower() for k in doc_keywords):
            doc_context, citations = DocumentRetriever.search(query=message, ticker=ticker, top_k=3)
            if citations:
                tools_used.append("search_financial_documents")

        agent = build_react_agent()
        if agent is not None:
            try:
                messages = []
                if history:
                    for h in history[-6:]:
                        role = h.get("role", "user")
                        content = h.get("content", "")
                        if role == "user":
                            messages.append(HumanMessage(content=content))
                        elif role == "assistant":
                            messages.append(AIMessage(content=content))

                user_prompt = message
                if ticker:
                    user_prompt = f"[Context Ticker: {ticker.upper()}]\n{user_prompt}"
                if doc_context and citations:
                    user_prompt += f"\n\n[Retrieved Financial Document Filings (Use citations [Source: filename, Page X])]:\n{doc_context}"

                messages.append(HumanMessage(content=user_prompt))

                result = agent.invoke({"messages": messages})
                final_msg = result["messages"][-1]
                raw_content = final_msg.content if hasattr(final_msg, "content") else final_msg
                answer = _extract_text_content(raw_content)
                
                for m in result.get("messages", []):
                    if hasattr(m, "name") and m.name:
                        if m.name not in tools_used:
                            tools_used.append(m.name)

                return answer, citations, tools_used
            except Exception as e:
                logger.error(f"Error in LangGraph agent chat: {e}")

        q_lower = message.lower()
        if "compare" in q_lower:
            tools_used.append("compare_stocks")
            answer = (
                f"To compare stocks in depth, you can use the **Stock Comparison** tool above, or provide two tickers "
                f"like 'Compare NVDA and AMD'. Live market data, P/E ratios, and revenue comparisons will be displayed side-by-side."
            )
        elif citations:
            tools_used.append("search_financial_documents")
            citations_summary = "\n".join([f"- **{c.document_name}** (Page {c.page or 'N/A'}): \"{c.text_snippet}\"" for c in citations])
            answer = (
                f"Based on semantic retrieval from the uploaded corporate filings:\n\n"
                f"{citations_summary}\n\n"
                f"*Note: Configure `GOOGLE_API_KEY` in `.env` to enable full autonomous LangGraph synthesis and follow-up reasoning.*"
            )
        elif ticker:
            tools_used.append("get_stock_data")
            snap = StockService.get_stock_data(ticker)
            perf = StockService.get_stock_performance(ticker)
            answer = (
                f"**{snap.name} ({snap.ticker}) Overview**:\n"
                f"- **Current Price**: ${snap.current_price or 'N/A'} ({snap.day_change_percent or 0:+.2f}% today)\n"
                f"- **Market Cap**: {snap.market_cap_formatted}\n"
                f"- **P/E (TTM)**: {snap.pe_ratio or 'N/A'} | **Forward P/E**: {snap.forward_pe or 'N/A'}\n"
                f"- **1-Year Return**: {perf.return_1y or 0:+.1f}%\n"
                f"- **52-Week Range**: ${snap.fifty_two_week_low or 'N/A'} - ${snap.fifty_two_week_high or 'N/A'}\n\n"
                f"You can ask specific questions about its financial statements, upload a 10-K or 10-Q filing for document-grounded answers, or compare it with a peer."
            )
        else:
            answer = (
                "I am InvestIQ's investment research assistant. You can enter a ticker (e.g., NVDA, AAPL, MSFT), "
                "upload financial reports to ask specific questions about revenue, margins, or risk disclosures, "
                "or request a head-to-head comparison."
            )

        return answer, citations, tools_used

    @staticmethod
    def compare(ticker_a: str, ticker_b: str) -> CompareResponse:
        ta = ticker_a.strip().upper()
        tb = ticker_b.strip().upper()
        
        metrics_a = StockService.get_compare_metrics(ta)
        metrics_b = StockService.get_compare_metrics(tb)
        
        rag_context, citations = DocumentRetriever.search(
            query=f"{ta} vs {tb} competition revenue market share margins",
            top_k=3
        )

        llm = get_llm()
        synthesis = ""
        verdict = ""

        if llm is not None:
            prompt = COMPARISON_PROMPT.format(
                ticker_a=ta,
                ticker_b=tb,
                comparative_metrics=json.dumps({ta: metrics_a.model_dump(), tb: metrics_b.model_dump()}, indent=2),
                rag_evidence=rag_context if citations else "No uploaded filings comparing these tickers."
            )
            try:
                res = llm.invoke([
                    SystemMessage(content=SYSTEM_AGENT_PROMPT),
                    HumanMessage(content=prompt)
                ])
                synthesis = _extract_text_content(res.content).strip()
                verdict = f"Comparative evaluation completed for {ta} and {tb} based on live metrics."
            except Exception as e:
                logger.error(f"Error invoking LLM for comparison: {e}")

        if not synthesis:
            synthesis = (
                f"### Comparative Valuation Analysis: {ta} vs {tb}\n\n"
                f"- **Valuation Multiples**: {ta} trades at a P/E of {metrics_a.pe_ratio or 'N/A'} (Forward P/E: {metrics_a.forward_pe or 'N/A'}), "
                f"whereas {tb} trades at {metrics_b.pe_ratio or 'N/A'} (Forward P/E: {metrics_b.forward_pe or 'N/A'}).\n"
                f"- **Scale & Capitalization**: {ta} commands a market cap of {metrics_a.market_cap_formatted} with trailing revenue of {metrics_a.revenue_formatted}, "
                f"compared to {tb}'s market cap of {metrics_b.market_cap_formatted} and revenue of {metrics_b.revenue_formatted}.\n"
                f"- **Margin Profile**: {ta} reports profit margins of {metrics_a.profit_margins or 'N/A'}% vs {metrics_b.profit_margins or 'N/A'}% for {tb}.\n"
                f"- **Trailing 1-Year Performance**: {ta} delivered {metrics_a.return_1y or 0:+.1f}% vs {metrics_b.return_1y or 0:+.1f}% for {tb}.\n\n"
                f"### Key Investment Trade-offs\n"
                f"Investors prioritizing pure operational momentum and higher margins may lean toward {ta if (metrics_a.profit_margins or 0) > (metrics_b.profit_margins or 0) else tb}, "
                f"while value-conscious investors should weigh relative valuation multiples and forward earnings expansion."
            )
            verdict = (
                f"Balanced peer analysis between {ta} and {tb}. {ta} and {tb} exhibit distinct risk/reward profiles based on valuation multiples and margin velocity."
            )

        return CompareResponse(
            ticker_a_metrics=metrics_a,
            ticker_b_metrics=metrics_b,
            synthesis=synthesis,
            verdict=verdict,
            citations=citations
        )
