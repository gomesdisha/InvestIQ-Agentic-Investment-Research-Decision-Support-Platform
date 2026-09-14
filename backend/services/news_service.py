import logging
from datetime import datetime
from typing import List, Optional
import yfinance as yf
from backend.models.schemas import NewsItem

logger = logging.getLogger(__name__)

class NewsService:
    @staticmethod
    def get_recent_news(ticker: str, limit: int = 8) -> List[NewsItem]:
        symbol = ticker.strip().upper()
        t = yf.Ticker(symbol)
        raw_news = []
        try:
            raw_news = t.news or []
        except Exception as e:
            logger.warning(f"Error fetching news for {symbol}: {e}")

        news_items: List[NewsItem] = []
        for item in raw_news[:limit]:
            try:
                # Check modern nested yfinance structure
                if "content" in item and isinstance(item["content"], dict):
                    content = item["content"]
                    title = content.get("title") or "Market Update"
                    summary = content.get("summary") or content.get("description") or ""
                    pub_date = content.get("pubDate")
                    
                    provider = content.get("provider", {})
                    publisher = provider.get("displayName") if isinstance(provider, dict) else "Finance News"
                    
                    link_obj = content.get("clickThroughUrl") or content.get("canonicalUrl")
                    link = link_obj.get("url") if isinstance(link_obj, dict) else "#"
                else:
                    # Legacy flat structure
                    title = item.get("title", "Market Update")
                    summary = item.get("summary", "")
                    publisher = item.get("publisher", "Finance News")
                    link = item.get("link", "#")
                    pub_timestamp = item.get("providerPublishTime")
                    pub_date = None
                    if pub_timestamp:
                        try:
                            pub_date = datetime.utcfromtimestamp(pub_timestamp).isoformat() + "Z"
                        except Exception:
                            pass

                # Clean summary from html tags if any
                if summary:
                    summary = summary.replace("<p>", "").replace("</p>", "").replace("<b>", "").replace("</b>", "")
                    if len(summary) > 250:
                        summary = summary[:250] + "..."

                news_items.append(
                    NewsItem(
                        title=title,
                        publisher=publisher or "Finance News",
                        link=link or "#",
                        publish_time=pub_date,
                        summary=summary if summary else None
                    )
                )
            except Exception as e:
                logger.warning(f"Error parsing news item: {e}")

        return news_items
