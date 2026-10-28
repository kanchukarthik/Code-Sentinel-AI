"""API v1 master router aggregating all sub-routers."""

from fastapi import APIRouter
from app.api.v1.projects import router as projects_router
from app.api.v1.runs import router as runs_router
from app.api.v1.tests import router as tests_router
from app.api.v1.bugs import router as bugs_router
from app.api.v1.root_causes import router as root_causes_router
from app.api.v1.patches import router as patches_router
from app.api.v1.metrics import router as metrics_router
from app.api.v1.feedback import router as feedback_router
from app.api.v1.settings import router as settings_router
from app.api.v1.websockets import router as websockets_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(projects_router)
api_v1_router.include_router(runs_router)
api_v1_router.include_router(tests_router)
api_v1_router.include_router(bugs_router)
api_v1_router.include_router(root_causes_router)
api_v1_router.include_router(patches_router)
api_v1_router.include_router(metrics_router)
api_v1_router.include_router(feedback_router)
api_v1_router.include_router(settings_router)
api_v1_router.include_router(websockets_router)
