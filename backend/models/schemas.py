from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class StockSnapshot(BaseModel):
    ticker: str
    name: str = ""
    current_price: Optional[float] = None
    previous_close: Optional[float] = None
    day_change: Optional[float] = None
    day_change_percent: Optional[float] = None
    market_cap: Optional[float] = None
    market_cap_formatted: Optional[str] = "N/A"
    pe_ratio: Optional[float] = None
    forward_pe: Optional[float] = None
    eps: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    volume: Optional[int] = None
    avg_volume: Optional[int] = None
    sector: Optional[str] = "N/A"
    industry: Optional[str] = "N/A"
    currency: str = "USD"
    exchange: Optional[str] = "N/A"

class HistoricalDataPoint(BaseModel):
    date: str
    close: float
    volume: Optional[int] = None

class StockPerformance(BaseModel):
    ticker: str
    return_1m: Optional[float] = None
    return_3m: Optional[float] = None
    return_6m: Optional[float] = None
    return_1y: Optional[float] = None
    volatility_annualized: Optional[float] = None
    history: List[HistoricalDataPoint] = []

class StockFundamentals(BaseModel):
    ticker: str
    total_revenue: Optional[float] = None
    total_revenue_formatted: Optional[str] = "N/A"
    net_income: Optional[float] = None
    net_income_formatted: Optional[str] = "N/A"
    profit_margins: Optional[float] = None
    operating_margins: Optional[float] = None
    gross_margins: Optional[float] = None
    free_cashflow: Optional[float] = None
    free_cashflow_formatted: Optional[str] = "N/A"
    total_debt: Optional[float] = None
    debt_to_equity: Optional[float] = None
    return_on_equity: Optional[float] = None
    price_to_sales: Optional[float] = None
    price_to_book: Optional[float] = None
    summary: Optional[str] = ""

class NewsItem(BaseModel):
    title: str
    publisher: str = "Finance News"
    link: str = "#"
    publish_time: Optional[str] = None
    summary: Optional[str] = None

class DocumentCitation(BaseModel):
    document_name: str
    page: Optional[int] = None
    text_snippet: str
    score: Optional[float] = None

class InvestmentThesis(BaseModel):
    bull_case: str = ""
    base_case: str = ""
    bear_case: str = ""

class RiskFactors(BaseModel):
    operational_risks: List[str] = []
    market_macro_risks: List[str] = []
    regulatory_risks: List[str] = []
    valuation_risks: List[str] = []

class ResearchReport(BaseModel):
    ticker: str
    company_name: str
    generated_at: str
    market_snapshot: StockSnapshot
    performance: StockPerformance
    fundamentals: StockFundamentals
    recent_news: List[NewsItem] = []
    news_sentiment: str = "Neutral"
    news_sentiment_score: Optional[float] = 0.0
    news_sentiment_rationale: str = ""
    rag_insights: Optional[str] = None
    rag_citations: List[DocumentCitation] = []
    investment_thesis: InvestmentThesis
    risk_factors: RiskFactors
    research_signal: str = "Neutral" # "Strong Positive", "Positive", "Neutral", "Negative", "Strong Negative"
    research_signal_rationale: str = ""
    disclaimer: str = (
        "InvestIQ is an AI-powered financial decision-support and research platform designed for educational and analytical purposes only. "
        "InvestIQ does not provide financial advice, personalized investment recommendations, or automated trading signals. "
        "All data and insights should be independently verified before making investment decisions."
    )

class ChatMessage(BaseModel):
    role: str # "user" | "assistant" | "system"
    content: str

class ChatRequest(BaseModel):
    message: str
    ticker: Optional[str] = None
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    answer: str
    citations: List[DocumentCitation] = []
    tools_used: List[str] = []

class CompareRequest(BaseModel):
    ticker_a: str
    ticker_b: str

class CompareMetrics(BaseModel):
    ticker: str
    name: str
    price: Optional[float] = None
    market_cap_formatted: str = "N/A"
    pe_ratio: Optional[float] = None
    forward_pe: Optional[float] = None
    eps: Optional[float] = None
    revenue_formatted: str = "N/A"
    net_income_formatted: str = "N/A"
    profit_margins: Optional[float] = None
    return_1y: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None

class CompareResponse(BaseModel):
    ticker_a_metrics: CompareMetrics
    ticker_b_metrics: CompareMetrics
    synthesis: str
    verdict: str
    citations: List[DocumentCitation] = []

class DocumentUploadResponse(BaseModel):
    filename: str
    ticker: Optional[str] = None
    pages_processed: int
    chunks_created: int
    status: str
    message: str

class DocumentListItem(BaseModel):
    filename: str
    ticker: Optional[str] = None
    chunk_count: int
    upload_time: str
