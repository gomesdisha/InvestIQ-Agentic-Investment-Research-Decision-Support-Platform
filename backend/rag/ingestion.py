import os
import logging
from datetime import datetime
from typing import Tuple, Optional
import pymupdf
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from backend.rag.retriever import get_vectorstore, reload_vectorstore

logger = logging.getLogger(__name__)

class DocumentIngestionService:
    @staticmethod
    def ingest_pdf(
        file_path: str,
        filename: str,
        ticker: Optional[str] = None,
        doc_type: Optional[str] = None
    ) -> Tuple[int, int]:
        ticker_clean = ticker.strip().upper() if ticker and ticker.strip() else "GENERAL"
        
        # Infer doc type if not provided
        if not doc_type:
            lower_fn = filename.lower()
            if "10-k" in lower_fn or "10k" in lower_fn:
                doc_type = "10-K Annual Report"
            elif "10-q" in lower_fn or "10q" in lower_fn:
                doc_type = "10-Q Quarterly Report"
            elif "earnings" in lower_fn or "call" in lower_fn or "transcript" in lower_fn:
                doc_type = "Earnings Call Transcript"
            elif "presentation" in lower_fn or "investor" in lower_fn:
                doc_type = "Investor Presentation"
            else:
                doc_type = "Financial Report"

        logger.info(f"Ingesting PDF {filename} for ticker {ticker_clean} (Type: {doc_type})")
        
        doc = pymupdf.open(file_path)
        pages_processed = len(doc)
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

        all_chunks: list[Document] = []
        now_str = datetime.utcnow().isoformat() + "Z"

        for page_idx, page in enumerate(doc):
            page_num = page_idx + 1
            text = page.get_text("text")
            if not text or not text.strip():
                continue

            # Split page text
            page_chunks = text_splitter.split_text(text)
            for chunk_idx, chunk_text in enumerate(page_chunks):
                chunk_doc = Document(
                    page_content=chunk_text,
                    metadata={
                        "filename": filename,
                        "ticker": ticker_clean,
                        "page": page_num,
                        "chunk_index": chunk_idx,
                        "doc_type": doc_type,
                        "upload_time": now_str
                    }
                )
                all_chunks.append(chunk_doc)

        doc.close()

        if all_chunks:
            vs = get_vectorstore()
            vs.add_documents(all_chunks)
            reload_vectorstore()
            logger.info(f"Successfully added {len(all_chunks)} chunks from {pages_processed} pages to ChromaDB.")
        else:
            logger.warning(f"No extractable text found in {filename}.")

        return pages_processed, len(all_chunks)
