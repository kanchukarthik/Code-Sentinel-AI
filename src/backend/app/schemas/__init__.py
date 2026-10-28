"""Register all Pydantic schemas."""

from app.schemas.project import ProjectCreate, ProjectResponse
from app.schemas.run import RunCreate, RunResponse, AgentTaskResponse, RunSummary
from app.schemas.test import TestCaseResponse, TestResultResponse
from app.schemas.bug import BugReportResponse, RootCauseResponse, RootCauseRankingItem
from app.schemas.patch import PatchResponse, PatchActionRequest, PatchValidationReport
from app.schemas.metric import CoverageSnapshotResponse, MetricSnapshotResponse, MetricSummaryResponse, MetricTrendPoint, FeedbackRecordResponse
from app.schemas.settings import SettingsUpdate, SettingsResponse
from app.schemas.websocket import WebSocketEvent

__all__ = [
    "ProjectCreate",
    "ProjectResponse",
    "RunCreate",
    "RunResponse",
    "AgentTaskResponse",
    "RunSummary",
    "TestCaseResponse",
    "TestResultResponse",
    "BugReportResponse",
    "RootCauseResponse",
    "RootCauseRankingItem",
    "PatchResponse",
    "PatchActionRequest",
    "PatchValidationReport",
    "CoverageSnapshotResponse",
    "MetricSnapshotResponse",
    "MetricSummaryResponse",
    "MetricTrendPoint",
    "FeedbackRecordResponse",
    "SettingsUpdate",
    "SettingsResponse",
    "WebSocketEvent",
]
