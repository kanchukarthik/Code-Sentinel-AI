"""Export all 7 specialized cognitive agents."""

from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.agents.code_intelligence import CodeIntelligenceAgent
from app.agents.test_synthesis import TestSynthesisAgent
from app.agents.execution import ExecutionAgent
from app.agents.bug_detection import BugDetectionAgent
from app.agents.root_cause import RootCauseAnalysisAgent
from app.agents.patch_generation import PatchGenerationAgent
from app.agents.self_healing import SelfHealingValidationAgent

ALL_AGENTS = [
    CodeIntelligenceAgent(),
    TestSynthesisAgent(),
    ExecutionAgent(),
    BugDetectionAgent(),
    RootCauseAnalysisAgent(),
    PatchGenerationAgent(),
    SelfHealingValidationAgent(),
]

__all__ = [
    "BaseAgent",
    "AgentContext",
    "AgentResult",
    "CodeIntelligenceAgent",
    "TestSynthesisAgent",
    "ExecutionAgent",
    "BugDetectionAgent",
    "RootCauseAnalysisAgent",
    "PatchGenerationAgent",
    "SelfHealingValidationAgent",
    "ALL_AGENTS",
]
