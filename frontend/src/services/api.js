const API_BASE = "/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchStock(ticker) {
  const res = await fetch(`${API_BASE}/stock/${ticker}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch stock data for ${ticker}`);
  }
  return res.json();
}

export async function fetchPerformance(ticker) {
  const res = await fetch(`${API_BASE}/stock/${ticker}/performance`);
  if (!res.ok) throw new Error(`Failed to fetch performance for ${ticker}`);
  return res.json();
}

export async function fetchFundamentals(ticker) {
  const res = await fetch(`${API_BASE}/stock/${ticker}/fundamentals`);
  if (!res.ok) throw new Error(`Failed to fetch fundamentals for ${ticker}`);
  return res.json();
}

export async function fetchNews(ticker) {
  const res = await fetch(`${API_BASE}/stock/${ticker}/news`);
  if (!res.ok) throw new Error(`Failed to fetch news for ${ticker}`);
  return res.json();
}

export async function analyzeStock(ticker) {
  const res = await fetch(`${API_BASE}/analyze?ticker=${encodeURIComponent(ticker)}`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to generate research report for ${ticker}`);
  }
  return res.json();
}

export async function agentChat(message, ticker, history = []) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, ticker, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Agent chat request failed");
  }
  return res.json();
}

export async function compareStocks(tickerA, tickerB) {
  const res = await fetch(`${API_BASE}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker_a: tickerA, ticker_b: tickerB }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Comparison request failed");
  }
  return res.json();
}

export async function uploadDocument(file, ticker, docType) {
  const formData = new FormData();
  formData.append("file", file);
  if (ticker) formData.append("ticker", ticker);
  if (docType) formData.append("doc_type", docType);

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload document");
  }
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error("Failed to fetch documents list");
  return res.json();
}
