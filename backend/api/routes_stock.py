from fastapi import APIRouter, HTTPException
from typing import List
from backend.services.stock_service import StockService
from backend.services.news_service import NewsService
from backend.models.schemas import StockSnapshot, StockPerformance, StockFundamentals, NewsItem

router = APIRouter(prefix="/stock", tags=["Stock Data"])

@router.get("/{ticker}", response_model=StockSnapshot)
def get_stock(ticker: str):
    try:
        return StockService.get_stock_data(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")

@router.get("/{ticker}/performance", response_model=StockPerformance)
def get_performance(ticker: str):
    try:
        return StockService.get_stock_performance(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch performance: {str(e)}")

@router.get("/{ticker}/fundamentals", response_model=StockFundamentals)
def get_fundamentals(ticker: str):
    try:
        return StockService.get_stock_fundamentals(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fundamentals: {str(e)}")

@router.get("/{ticker}/news", response_model=List[NewsItem])
def get_news(ticker: str, limit: int = 8):
    try:
        return NewsService.get_recent_news(ticker, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")
