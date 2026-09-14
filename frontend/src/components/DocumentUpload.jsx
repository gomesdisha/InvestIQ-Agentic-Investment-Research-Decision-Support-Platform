import React, { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Folder } from "lucide-react";
import { uploadDocument, fetchDocuments } from "../services/api";

export default function DocumentUpload({ currentTicker, onDocumentUploaded }) {
  const [file, setFile] = useState(null);
  const [ticker, setTicker] = useState(currentTicker || "NVDA");
  const [docType, setDocType] = useState("10-K Annual Report");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    if (currentTicker) setTicker(currentTicker);
  }, [currentTicker]);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!f.name.toLowerCase().endsWith(".pdf")) {
        setError("Please select a valid PDF document.");
        setFile(null);
        return;
      }
      setError(null);
      setFile(f);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const res = await uploadDocument(file, ticker.toUpperCase(), docType);
      setUploadResult(res);
      setFile(null);
      loadDocuments();
      if (onDocumentUploaded) onDocumentUploaded();
    } catch (err) {
      setError(err.message || "Failed to process document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            Financial Document Ingestion & RAG Index
          </h3>
          <p className="text-xs text-slate-400">
            Upload annual reports (10-K), 10-Qs, or earnings transcripts for semantic vector retrieval
          </p>
        </div>

        <button
          onClick={loadDocuments}
          disabled={loadingDocs}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Refresh indexed documents"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingDocs ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select PDF Document
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/40">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              {file ? (
                <div className="text-xs font-semibold text-emerald-400">
                  Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-slate-300">
                    Click to browse or drag & drop PDF here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">10-K, 10-Q, 8-K, or Transcripts</p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Associated Ticker
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. NVDA"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Filing Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="10-K Annual Report">10-K Annual Report</option>
                <option value="10-Q Quarterly Report">10-Q Quarterly Report</option>
                <option value="Earnings Call Transcript">Earnings Call Transcript</option>
                <option value="Investor Presentation">Investor Presentation</option>
                <option value="General Research Note">General Research Note</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {uploadResult && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadResult.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Parsing & Ingesting Chunks into Vector Store...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Ingest & Index Into ChromaDB
              </>
            )}
          </button>
        </form>

        {/* Currently Indexed Documents List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              Indexed Documents Repository ({documents.length})
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {documents.length > 0 ? (
              documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-200 truncate">{doc.filename}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-emerald-400">{doc.ticker || "GENERAL"}</span>
                      <span>�</span>
                      <span>{doc.chunk_count} vector chunks</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0 font-mono">
                    Indexed
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs text-slate-500">
                No corporate documents indexed yet. Upload a PDF above to populate ChromaDB.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
