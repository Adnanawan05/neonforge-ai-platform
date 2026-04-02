from fastapi import APIRouter

from app.api.routes import collector, datasets, pipeline, cleaner, processor, query, simulate, ml, insights, export, logs, ws, painter

api_router = APIRouter()

api_router.include_router(collector.router, prefix="/collector", tags=["collector"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
api_router.include_router(cleaner.router, prefix="/cleaner", tags=["cleaner"])
api_router.include_router(processor.router, prefix="/processor", tags=["processor"])
api_router.include_router(query.router, prefix="/query", tags=["query"])
api_router.include_router(simulate.router, prefix="/simulate", tags=["simulate"])
api_router.include_router(ml.router, prefix="/ml", tags=["ml"])
api_router.include_router(painter.router, prefix="/painter", tags=["painter"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(ws.router, tags=["ws"])
