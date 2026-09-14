import logging
from typing import List, Optional, Tuple, Dict, Any
from langchain_chroma import Chroma
from langchain_core.documents import Document
from backend.config import settings
from backend.rag.embeddings import get_embeddings
from backend.models.schemas import DocumentCitation, DocumentListItem

logger = logging.getLogger(__name__)

_vectorstore_instance: Optional[Chroma] = None

def get_vectorstore() -> Chroma:
    global _vectorstore_instance
    if _vectorstore_instance is None:
        embeddings = get_embeddings()
        _vectorstore_instance = Chroma(
            collection_name="financial_documents",
            persist_directory=settings.CHROMA_DIR,
            embedding_function=embeddings
        )
    return _vectorstore_instance

def reload_vectorstore() -> Chroma:
    global _vectorstore_instance
    _vectorstore_instance = None
    return get_vectorstore()

class DocumentRetriever:
    @staticmethod
    def search(
        query: str,
        ticker: Optional[str] = None,
        top_k: int = 4
    ) -> Tuple[str, List[DocumentCitation]]:
        vs = get_vectorstore()
        
        try:
            count = vs._collection.count()
            if count == 0:
                return "No financial documents have been uploaded yet.", []
        except Exception as e:
            logger.warning(f"Error checking vector store count: {e}")
            return "No financial documents available.", []

        filter_dict = None
        if ticker and ticker.strip():
            filter_dict = {"ticker": ticker.strip().upper()}

        docs = []
        try:
            if filter_dict:
                docs = vs.similarity_search(query, k=top_k, filter=filter_dict)
                if not docs:
                    docs = vs.similarity_search(query, k=top_k)
            else:
                docs = vs.similarity_search(query, k=top_k)
        except Exception as e:
            logger.warning(f"Similarity search error: {e}. Trying simple search.")
            try:
                docs = vs.similarity_search(query, k=top_k)
            except Exception as e2:
                logger.error(f"Search failed completely: {e2}")
                return "Error retrieving documents.", []

        if not docs:
            return "No relevant financial document excerpts found for this query.", []

        citations: List[DocumentCitation] = []
        formatted_snippets: List[str] = []

        for doc in docs:
            meta = doc.metadata or {}
            filename = meta.get("filename", "Financial_Document.pdf")
            page = meta.get("page")
            
            page_str = f"Page {page}" if page is not None else "Unknown Page"
            clean_snippet = doc.page_content.strip().replace("\n", " ")
            if len(clean_snippet) > 300:
                snippet_preview = clean_snippet[:300] + "..."
            else:
                snippet_preview = clean_snippet

            citation = DocumentCitation(
                document_name=filename,
                page=page,
                text_snippet=snippet_preview,
                score=0.92
            )
            citations.append(citation)
            formatted_snippets.append(f"[Source: {filename}, {page_str}]: \"{snippet_preview}\"")

        context_str = "\n\n".join(formatted_snippets)
        return context_str, citations

    @staticmethod
    def list_documents() -> List[DocumentListItem]:
        vs = get_vectorstore()
        try:
            coll = vs._collection
            results = coll.get(include=["metadatas"])
            metadatas = results.get("metadatas") or []
            
            summary: Dict[str, Dict[str, Any]] = {}
            for m in metadatas:
                if not m:
                    continue
                fn = m.get("filename", "Unknown")
                if fn not in summary:
                    summary[fn] = {
                        "filename": fn,
                        "ticker": m.get("ticker", "GENERAL"),
                        "chunk_count": 0,
                        "upload_time": m.get("upload_time", "")
                    }
                summary[fn]["chunk_count"] += 1

            return [
                DocumentListItem(
                    filename=v["filename"],
                    ticker=v["ticker"],
                    chunk_count=v["chunk_count"],
                    upload_time=v["upload_time"]
                )
                for v in summary.values()
            ]
        except Exception as e:
            logger.error(f"Error listing documents: {e}")
            return []
