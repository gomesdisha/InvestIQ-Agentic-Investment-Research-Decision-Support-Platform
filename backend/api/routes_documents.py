import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.config import settings
from backend.rag.ingestion import DocumentIngestionService
from backend.rag.retriever import DocumentRetriever
from backend.models.schemas import DocumentUploadResponse, DocumentListItem

router = APIRouter(prefix="/documents", tags=["Financial Documents (RAG)"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    ticker: Optional[str] = Form(None),
    doc_type: Optional[str] = Form(None)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for financial document ingestion.")
    
    # Save file to storage
    file_path = os.path.join(settings.DOCUMENTS_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        pages, chunks = DocumentIngestionService.ingest_pdf(
            file_path=file_path,
            filename=file.filename,
            ticker=ticker,
            doc_type=doc_type
        )
        
        return DocumentUploadResponse(
            filename=file.filename,
            ticker=ticker.upper() if ticker else "GENERAL",
            pages_processed=pages,
            chunks_created=chunks,
            status="indexed",
            message=f"Successfully indexed {file.filename}: {pages} pages processed into {chunks} searchable vector chunks."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@router.get("", response_model=List[DocumentListItem])
def list_documents():
    try:
        return DocumentRetriever.list_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")
