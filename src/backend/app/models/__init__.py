"""Register all SQLAlchemy ORM models."""

from app.models.project import Project
from app.models.run import Run
from app.models.agent_task import AgentTask
from app.models.test_case import TestCase, TestResult
from app.models.bug_report import BugReport
from app.models.root_cause import RootCauseResult
from app.models.patch import Patch
from app.models.metric import CoverageSnapshot, MetricSnapshot, LLMCallLog
from app.models.feedback import FeedbackRecord
from app.models.settings import SystemSetting

__all__ = [
    "Project",
    "Run",
    "AgentTask",
    "TestCase",
    "TestResult",
    "BugReport",
    "RootCauseResult",
    "Patch",
    "CoverageSnapshot",
    "MetricSnapshot",
    "LLMCallLog",
    "FeedbackRecord",
    "SystemSetting",
]
