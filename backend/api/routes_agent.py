from fastapi import APIRouter, HTTPException, Query
from backend.agent.graph import InvestmentAgent
from backend.models.schemas import (
    ResearchReport,
    ChatRequest,
    ChatResponse,
    CompareRequest,
    CompareResponse
)

router = APIRouter(tags=["Agentic Research & Decisions"])

@router.post("/analyze", response_model=ResearchReport)
def analyze_stock(ticker: str = Query(..., description="Stock ticker symbol (e.g. NVDA, AAPL, MSFT)")):
    try:
        return InvestmentAgent.generate_research_report(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate research report: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
def agent_chat(req: ChatRequest):
    try:
        history_dicts = [{"role": m.role, "content": m.content} for m in req.history]
        answer, citations, tools_used = InvestmentAgent.chat(
            message=req.message,
            ticker=req.ticker,
            history=history_dicts
        )
        return ChatResponse(
            answer=answer,
            citations=citations,
            tools_used=tools_used
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent chat failure: {str(e)}")

@router.post("/compare", response_model=CompareResponse)
def compare_stocks_endpoint(req: CompareRequest):
    try:
        return InvestmentAgent.compare(req.ticker_a, req.ticker_b)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare stocks: {str(e)}")
