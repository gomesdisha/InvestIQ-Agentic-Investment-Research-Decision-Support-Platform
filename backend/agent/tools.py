import json
from typing import Optional
from langchain_core.tools import tool
from backend.services.stock_service import StockService
from backend.services.news_service import NewsService
from backend.rag.retriever import DocumentRetriever

@tool
def get_stock_data(ticker: str) -> str:
    """
    Retrieve current market data and fundamental valuation metrics for a given stock ticker (e.g. NVDA, AAPL, MSFT).
    Returns current price, market cap, P/E ratio, forward P/E, EPS, 52-week high/low, sector, and industry.
    """
    try:
        data = StockService.get_stock_data(ticker)
        return json.dumps({
            "ticker": data.ticker,
            "company_name": data.name,
            "current_price": data.current_price,
            "market_cap": data.market_cap_formatted,
            "pe_ratio": data.pe_ratio,
            "forward_pe": data.forward_pe,
            "eps": data.eps,
            "fifty_two_week_high": data.fifty_two_week_high,
            "fifty_two_week_low": data.fifty_two_week_low,
            "sector": data.sector,
            "industry": data.industry,
            "currency": data.currency
        }, indent=2)
    except Exception as e:
        return f"Error retrieving stock data for {ticker}: {str(e)}"

@tool
def get_stock_performance(ticker: str) -> str:
    """
    Retrieve historical price performance metrics for a given stock ticker over 1M, 3M, 6M, and 1Y horizons,
    along with annualized historical volatility.
    """
    try:
        perf = StockService.get_stock_performance(ticker)
        return json.dumps({
            "ticker": perf.ticker,
            "return_1m_percent": perf.return_1m,
            "return_3m_percent": perf.return_3m,
            "return_6m_percent": perf.return_6m,
            "return_1y_percent": perf.return_1y,
            "volatility_annualized_percent": perf.volatility_annualized
        }, indent=2)
    except Exception as e:
        return f"Error retrieving stock performance for {ticker}: {str(e)}"

@tool
def get_recent_news(ticker: str) -> str:
    """
    Retrieve recent market news headlines, summaries, and publication sources for a given stock ticker.
    Useful for assessing recent company developments, earnings announcements, or macroeconomic headwinds.
    """
    try:
        news = NewsService.get_recent_news(ticker, limit=6)
        if not news:
            return f"No recent news articles found for {ticker}."
        formatted = []
        for n in news:
            formatted.append({
                "title": n.title,
                "publisher": n.publisher,
                "published": n.publish_time,
                "summary": n.summary
            })
        return json.dumps(formatted, indent=2)
    except Exception as e:
        return f"Error retrieving news for {ticker}: {str(e)}"

@tool
def search_financial_documents(query: str, ticker: str = "") -> str:
    """
    Perform semantic search over uploaded corporate financial documents (10-K, 10-Q, earnings call transcripts, investor presentations).
    Returns grounded evidence excerpts along with exact source document names and page numbers.
    """
    try:
        context_str, _ = DocumentRetriever.search(query=query, ticker=ticker if ticker else None, top_k=4)
        return context_str
    except Exception as e:
        return f"Error querying financial documents: {str(e)}"

@tool
def compare_stocks(ticker_a: str, ticker_b: str) -> str:
    """
    Retrieve side-by-side comparative financial and valuation metrics for two stock tickers (e.g. NVDA vs AMD, AAPL vs MSFT).
    Returns price, market cap, P/E, EPS, revenue, profit margin, and 1-year return for both.
    """
    try:
        ma = StockService.get_compare_metrics(ticker_a)
        mb = StockService.get_compare_metrics(ticker_b)
        return json.dumps({
            ticker_a.upper(): ma.model_dump(),
            ticker_b.upper(): mb.model_dump()
        }, indent=2)
    except Exception as e:
        return f"Error comparing stocks {ticker_a} and {ticker_b}: {str(e)}"

INVESTMENT_TOOLS = [
    get_stock_data,
    get_stock_performance,
    get_recent_news,
    search_financial_documents,
    compare_stocks
]
