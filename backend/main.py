import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.api.routes_health import router as health_router
from backend.api.routes_stock import router as stock_router
from backend.api.routes_documents import router as documents_router
from backend.api.routes_agent import router as agent_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("investiq")

app = FastAPI(
    title="InvestIQ API",
    description="Agentic Investment Research & Decision Support Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(stock_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(agent_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "InvestIQ API is running",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
