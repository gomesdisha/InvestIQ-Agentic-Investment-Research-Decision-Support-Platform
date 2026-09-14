import logging
import hashlib
import numpy as np
from typing import List
from langchain_core.embeddings import Embeddings
from backend.config import settings

logger = logging.getLogger(__name__)

class FallbackEmbeddings(Embeddings):
    """
    Lightweight deterministic hashing embedding for offline/testing mode
    when GOOGLE_API_KEY is not provided. Generates 768-dim normalized vectors.
    """
    def __init__(self, dim: int = 768):
        self.dim = dim

    def _embed(self, text: str) -> List[float]:
        # Hash text into deterministic pseudo-random vector
        vec = np.zeros(self.dim, dtype=np.float32)
        words = text.lower().split()
        if not words:
            vec[0] = 1.0
            return vec.tolist()
        
        for w in words:
            h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dim
            vec[idx] += 1.0
            
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed(text)

def get_embeddings() -> Embeddings:
    if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY.strip() and not settings.GOOGLE_API_KEY.startswith("your_"):
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            logger.info("Using GoogleGenerativeAIEmbeddings")
            return GoogleGenerativeAIEmbeddings(
                model=settings.EMBEDDING_MODEL,
                google_api_key=settings.GOOGLE_API_KEY
            )
        except Exception as e:
            logger.warning(f"Failed to initialize Google embeddings: {e}. Falling back to local embeddings.")
            return FallbackEmbeddings()
    else:
        logger.info("No GOOGLE_API_KEY set. Using FallbackEmbeddings.")
        return FallbackEmbeddings()
