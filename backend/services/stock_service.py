import logging
from typing import Dict, Any, Optional, List
import yfinance as yf
import pandas as pd
import numpy as np
from backend.models.schemas import (
    StockSnapshot,
    StockPerformance,
    HistoricalDataPoint,
    StockFundamentals,
    CompareMetrics
)

logger = logging.getLogger(__name__)

def format_number(val: Optional[float], prefix: str = "$") -> str:
    if val is None or pd.isna(val):
        return "N/A"
    try:
        val = float(val)
        abs_val = abs(val)
        if abs_val >= 1e12:
            return f"{prefix}{val / 1e12:.2f}T"
        if abs_val >= 1e9:
            return f"{prefix}{val / 1e9:.2f}B"
        if abs_val >= 1e6:
            return f"{prefix}{val / 1e6:.2f}M"
        if abs_val >= 1e3:
            return f"{prefix}{val / 1e3:.2f}K"
        return f"{prefix}{val:.2f}"
    except Exception:
        return "N/A"

class StockService:
    @staticmethod
    def get_stock_data(ticker: str) -> StockSnapshot:
        symbol = ticker.strip().upper()
        t = yf.Ticker(symbol)
        
        info: Dict[str, Any] = {}
        try:
            info = t.info or {}
        except Exception as e:
            logger.warning(f"Error getting info for {symbol}: {e}")
            
        fast_info = getattr(t, "fast_info", None)
        
        current_price = None
        if fast_info:
            try:
                current_price = getattr(fast_info, "last_price", None)
            except Exception:
                pass
        if current_price is None:
            current_price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose")

        prev_close = None
        if fast_info:
            try:
                prev_close = getattr(fast_info, "previous_close", None)
            except Exception:
                pass
        if prev_close is None:
            prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose")

        day_change = None
        day_change_pct = None
        if current_price is not None and prev_close is not None and prev_close > 0:
            day_change = round(current_price - prev_close, 2)
            day_change_pct = round((day_change / prev_close) * 100, 2)

        market_cap = None
        if fast_info:
            try:
                market_cap = getattr(fast_info, "market_cap", None)
            except Exception:
                pass
        if market_cap is None:
            market_cap = info.get("marketCap")

        fifty_two_high = None
        fifty_two_low = None
        if fast_info:
            try:
                fifty_two_high = getattr(fast_info, "year_high", None)
                fifty_two_low = getattr(fast_info, "year_low", None)
            except Exception:
                pass
        if fifty_two_high is None:
            fifty_two_high = info.get("fiftyTwoWeekHigh")
        if fifty_two_low is None:
            fifty_two_low = info.get("fiftyTwoWeekLow")

        volume = None
        if fast_info:
            try:
                volume = getattr(fast_info, "last_volume", None)
            except Exception:
                pass
        if volume is None:
            volume = info.get("volume") or info.get("regularMarketVolume")

        pe_ratio = info.get("trailingPE")
        if pe_ratio is not None:
            pe_ratio = round(pe_ratio, 2)
            
        fwd_pe = info.get("forwardPE")
        if fwd_pe is not None:
            fwd_pe = round(fwd_pe, 2)

        eps = info.get("trailingEps")
        if eps is not None:
            eps = round(eps, 2)

        return StockSnapshot(
            ticker=symbol,
            name=info.get("shortName") or info.get("longName") or symbol,
            current_price=round(float(current_price), 2) if current_price is not None else None,
            previous_close=round(float(prev_close), 2) if prev_close is not None else None,
            day_change=day_change,
            day_change_percent=day_change_pct,
            market_cap=market_cap,
            market_cap_formatted=format_number(market_cap),
            pe_ratio=pe_ratio,
            forward_pe=fwd_pe,
            eps=eps,
            fifty_two_week_high=round(float(fifty_two_high), 2) if fifty_two_high is not None else None,
            fifty_two_week_low=round(float(fifty_two_low), 2) if fifty_two_low is not None else None,
            volume=int(volume) if volume is not None and not pd.isna(volume) else None,
            avg_volume=int(info.get("averageVolume", 0)) if info.get("averageVolume") else None,
            sector=info.get("sector", "N/A"),
            industry=info.get("industry", "N/A"),
            currency=info.get("currency", "USD"),
            exchange=info.get("exchange", "N/A")
        )

    @staticmethod
    def get_stock_performance(ticker: str) -> StockPerformance:
        symbol = ticker.strip().upper()
        t = yf.Ticker(symbol)
        
        try:
            df = t.history(period="1y", interval="1d")
        except Exception as e:
            logger.warning(f"Error fetching history for {symbol}: {e}")
            df = pd.DataFrame()

        if df.empty or "Close" not in df.columns or len(df) < 5:
            return StockPerformance(ticker=symbol, history=[])

        df = df.dropna(subset=["Close"])
        closes = df["Close"].values
        dates = [d.strftime("%Y-%m-%d") for d in df.index]
        volumes = df["Volume"].values if "Volume" in df.columns else [0] * len(df)

        curr_close = closes[-1]
        
        # 1 Month return (~21 trading days)
        ret_1m = None
        if len(closes) > 21 and closes[-21] > 0:
            ret_1m = round(((curr_close - closes[-21]) / closes[-21]) * 100, 2)
        elif len(closes) > 5 and closes[0] > 0:
            ret_1m = round(((curr_close - closes[0]) / closes[0]) * 100, 2)

        # 3 Month return (~63 trading days)
        ret_3m = None
        if len(closes) > 63 and closes[-63] > 0:
            ret_3m = round(((curr_close - closes[-63]) / closes[-63]) * 100, 2)

        # 6 Month return (~126 trading days)
        ret_6m = None
        if len(closes) > 126 and closes[-126] > 0:
            ret_6m = round(((curr_close - closes[-126]) / closes[-126]) * 100, 2)

        # 1 Year return (full df)
        ret_1y = None
        if closes[0] > 0:
            ret_1y = round(((curr_close - closes[0]) / closes[0]) * 100, 2)

        # Annualized Volatility
        volatility = None
        try:
            daily_returns = pd.Series(closes).pct_change().dropna()
            if len(daily_returns) > 10:
                vol = daily_returns.std() * np.sqrt(252) * 100
                if not np.isnan(vol):
                    volatility = round(float(vol), 2)
        except Exception:
            pass

        # Build history points (keep at most ~250 points for snappy chart rendering)
        history_points = []
        for d, c, v in zip(dates, closes, volumes):
            history_points.append(
                HistoricalDataPoint(
                    date=d,
                    close=round(float(c), 2),
                    volume=int(v) if not pd.isna(v) else 0
                )
            )

        return StockPerformance(
            ticker=symbol,
            return_1m=ret_1m,
            return_3m=ret_3m,
            return_6m=ret_6m,
            return_1y=ret_1y,
            volatility_annualized=volatility,
            history=history_points
        )

    @staticmethod
    def get_stock_fundamentals(ticker: str) -> StockFundamentals:
        symbol = ticker.strip().upper()
        t = yf.Ticker(symbol)
        
        info: Dict[str, Any] = {}
        try:
            info = t.info or {}
        except Exception as e:
            logger.warning(f"Error getting fundamentals for {symbol}: {e}")

        revenue = info.get("totalRevenue")
        net_income = info.get("netIncomeToCommon")
        profit_margins = info.get("profitMargins")
        if profit_margins is not None:
            profit_margins = round(profit_margins * 100, 2)
            
        operating_margins = info.get("operatingMargins")
        if operating_margins is not None:
            operating_margins = round(operating_margins * 100, 2)
            
        gross_margins = info.get("grossMargins")
        if gross_margins is not None:
            gross_margins = round(gross_margins * 100, 2)

        free_cf = info.get("freeCashflow")
        total_debt = info.get("totalDebt")
        debt_to_equity = info.get("debtToEquity")
        if debt_to_equity is not None:
            debt_to_equity = round(float(debt_to_equity), 2)

        roe = info.get("returnOnEquity")
        if roe is not None:
            roe = round(roe * 100, 2)

        ps = info.get("priceToSalesTrailing12Months")
        if ps is not None:
            ps = round(float(ps), 2)

        pb = info.get("priceToBook")
        if pb is not None:
            pb = round(float(pb), 2)

        summary = info.get("longBusinessSummary", "")
        if summary and len(summary) > 400:
            summary = summary[:400] + "..."

        return StockFundamentals(
            ticker=symbol,
            total_revenue=revenue,
            total_revenue_formatted=format_number(revenue),
            net_income=net_income,
            net_income_formatted=format_number(net_income),
            profit_margins=profit_margins,
            operating_margins=operating_margins,
            gross_margins=gross_margins,
            free_cashflow=free_cf,
            free_cashflow_formatted=format_number(free_cf),
            total_debt=total_debt,
            debt_to_equity=debt_to_equity,
            return_on_equity=roe,
            price_to_sales=ps,
            price_to_book=pb,
            summary=summary
        )

    @staticmethod
    def get_compare_metrics(ticker: str) -> CompareMetrics:
        snapshot = StockService.get_stock_data(ticker)
        perf = StockService.get_stock_performance(ticker)
        fund = StockService.get_stock_fundamentals(ticker)

        return CompareMetrics(
            ticker=snapshot.ticker,
            name=snapshot.name,
            price=snapshot.current_price,
            market_cap_formatted=snapshot.market_cap_formatted or "N/A",
            pe_ratio=snapshot.pe_ratio,
            forward_pe=snapshot.forward_pe,
            eps=snapshot.eps,
            revenue_formatted=fund.total_revenue_formatted or "N/A",
            net_income_formatted=fund.net_income_formatted or "N/A",
            profit_margins=fund.profit_margins,
            return_1y=perf.return_1y,
            fifty_two_week_high=snapshot.fifty_two_week_high,
            fifty_two_week_low=snapshot.fifty_two_week_low
        )
