import os
import json
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

print("=== 1. Testing Health Endpoint ===")
res_health = client.get("/api/health")
assert res_health.status_code == 200, f"Health failed: {res_health.status_code}"
print("[PASS] Health OK:", res_health.json())

print("\n=== 2. Testing Stock Data Endpoint (NVDA) ===")
res_stock = client.get("/api/stock/NVDA")
assert res_stock.status_code == 200, f"Stock failed: {res_stock.status_code}"
stock_data = res_stock.json()
print(f"[PASS] Stock OK: {stock_data['ticker']} ({stock_data['name']}) - ${stock_data['current_price']} | Market Cap: {stock_data['market_cap_formatted']}")

print("\n=== 3. Testing Stock Performance Endpoint (NVDA) ===")
res_perf = client.get("/api/stock/NVDA/performance")
assert res_perf.status_code == 200, f"Performance failed: {res_perf.status_code}"
perf_data = res_perf.json()
print(f"[PASS] Performance OK: 1M: {perf_data['return_1m']}%, 1Y: {perf_data['return_1y']}%, Volatility: {perf_data['volatility_annualized']}%, History Points: {len(perf_data['history'])}")

print("\n=== 4. Testing News Endpoint (NVDA) ===")
res_news = client.get("/api/stock/NVDA/news")
assert res_news.status_code == 200, f"News failed: {res_news.status_code}"
news_data = res_news.json()
print(f"[PASS] News OK: Retrieved {len(news_data)} news articles")
if news_data:
    print("  Sample Headline:", news_data[0]["title"])

print("\n=== 5. Testing PDF Document Upload & RAG Ingestion ===")
pdf_path = "data/documents/NVIDIA_10K_Sample.pdf"
with open(pdf_path, "rb") as f:
    res_upload = client.post(
        "/api/documents/upload",
        files={"file": ("NVIDIA_10K_Sample.pdf", f, "application/pdf")},
        data={"ticker": "NVDA", "doc_type": "10-K Annual Report"}
    )
assert res_upload.status_code == 200, f"Upload failed: {res_upload.status_code}"
print("[PASS] Document Upload OK:", res_upload.json())

print("\n=== 6. Testing Full Stock Analysis (NVDA) ===")
res_analyze = client.post("/api/analyze?ticker=NVDA")
assert res_analyze.status_code == 200, f"Analyze failed: {res_analyze.status_code}"
report = res_analyze.json()
print("[PASS] Analysis Report Generated:")
print("  Ticker:", report["ticker"])
print("  Signal:", report["research_signal"])
print("  Signal Rationale:", report["research_signal_rationale"])
print("  Bull Case Excerpt:", report["investment_thesis"]["bull_case"][:120], "...")
print("  RAG Citations Found:", len(report["rag_citations"]))
for c in report["rag_citations"]:
    print(f"    - {c['document_name']} (Page {c['page']})")

print("\n=== 7. Testing Stock Analysis for AAPL ===")
res_aapl = client.post("/api/analyze?ticker=AAPL")
assert res_aapl.status_code == 200, f"AAPL analyze failed: {res_aapl.status_code}"
aapl_report = res_aapl.json()
print(f"[PASS] AAPL Analysis OK: {aapl_report['ticker']} Price: ${aapl_report['market_snapshot']['current_price']} | Signal: {aapl_report['research_signal']}")

print("\n=== 8. Testing Stock Comparison (NVDA vs AMD) ===")
res_comp = client.post("/api/compare", json={"ticker_a": "NVDA", "ticker_b": "AMD"})
assert res_comp.status_code == 200, f"Compare failed: {res_comp.status_code}"
comp_data = res_comp.json()
print("[PASS] Comparison OK:")
print("  A:", comp_data["ticker_a_metrics"]["ticker"], "Price:", comp_data["ticker_a_metrics"]["price"])
print("  B:", comp_data["ticker_b_metrics"]["ticker"], "Price:", comp_data["ticker_b_metrics"]["price"])
print("  Verdict:", comp_data["verdict"])

print("\n=== 9. Testing Interactive Follow-up Chat with Grounded Citations ===")
res_chat = client.post(
    "/api/chat",
    json={
        "message": "What does the uploaded 10-K report say about China export controls and TSMC dependency?",
        "ticker": "NVDA",
        "history": []
    }
)
assert res_chat.status_code == 200, f"Chat failed: {res_chat.status_code}"
chat_data = res_chat.json()
print("[PASS] Chat OK:")
print("  Tools Used:", chat_data.get("tools_used"))
print("  Citations Returned:", len(chat_data.get("citations", [])))
for cit in chat_data.get("citations", []):
    print(f"    * Citation: {cit['document_name']} (Page {cit['page']})")
print("  Answer Preview:", chat_data.get("answer")[:180], "...")

print("\n=============================================")
print("ALL 9 VERIFICATION TESTS PASSED PERFECTLY!")
print("=============================================")