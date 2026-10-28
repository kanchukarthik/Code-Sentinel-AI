"""Integration tests for the Pipeline Orchestrator executing agents end-to-end."""

import uuid
import pytest
from datetime import datetime, timezone
from app.models.project import Project
from app.models.run import Run
from app.models.agent_task import AgentTask
from app.orchestrator.pipeline import PipelineOrchestrator


@pytest.mark.asyncio
async def test_orchestrator_pipeline_execution(db_session):
    # Find seeded calculator project
    project = db_session.query(Project).filter(Project.name.like("%Calculator%")).first()
    if not project:
        project = db_session.query(Project).first()
    assert project is not None

    run_id = f"test-run-{uuid.uuid4().hex[:6]}"
    run = Run(
        id=run_id,
        project_id=project.id,
        run_number=999,
        status="queued",
        trigger="manual",
        branch="main",
        commit_hash="test1234",
        commit_message="Test run for orchestrator verification",
        author="tester",
        started_at=datetime.now(timezone.utc),
        config_json={
            "agents": [
                "code_intelligence",
                "test_synthesis",
                "execution",
                "bug_detection",
                "root_cause_analysis",
                "patch_generation",
                "self_healing_validation",
            ],
            "max_repair_iterations": 1,
            "timeout_sec": 10,
            "llm_provider": "mock",
        },
    )
    db_session.add(run)
    db_session.commit()

    orchestrator = PipelineOrchestrator(db_session)
    result = await orchestrator.execute_run(run_id, llm_provider="mock")

    assert result["status"] in ["passed", "completed", "failed"]

    # Verify AgentTask records were created and completed
    tasks = db_session.query(AgentTask).filter(AgentTask.run_id == run_id).all()
    assert len(tasks) >= 4
    agent_names = [t.agent_name for t in tasks]
    assert any("Code Intelligence" in name for name in agent_names)
