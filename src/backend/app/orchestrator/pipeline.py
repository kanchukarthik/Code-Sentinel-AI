"""Pipeline orchestrator state machine running the 7 cognitive agents."""

import time
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models.run import Run
from app.models.agent_task import AgentTask
from app.models.project import Project
from app.agents.base import AgentContext, BaseAgent
from app.llm import get_llm_client
from app.sandbox.workspace import WorkspaceManager
from app.core.event_bus import event_bus


class PipelineOrchestrator:
    """State machine executing the multi-agent pipeline."""

    def __init__(self, db: Session):
        self.db = db
        # Active cancellation tokens
        self._active_runs: Dict[str, AgentContext] = {}

    def cancel_run(self, run_id: str) -> bool:
        """Signals cancellation to an active pipeline run."""
        if run_id in self._active_runs:
            self._active_runs[run_id].cancelled = True
            return True
        return False

    async def execute_run(
        self,
        run_id: str,
        agents_to_run: Optional[List[str]] = None,
        llm_provider: Optional[str] = None,
    ) -> None:
        """Asynchronously executes the full 7-agent pipeline for a run."""
        run = self.db.query(Run).filter(Run.id == run_id).first()
        if not run:
            return

        project = self.db.query(Project).filter(Project.id == run.project_id).first()
        if not project:
            return

        # Prepare isolated sandbox workspace
        project_src = Path(project.source_path) if project.source_path else (settings.PROJECTS_DIR / project.name.lower().replace(" ", "_"))
        sandbox_dir = settings.SANDBOXES_DIR / run_id
        workspace_dir = WorkspaceManager.create_sandbox_workspace(project_src, sandbox_dir)

        # Initialize LLM client and context
        client = get_llm_client(provider=llm_provider or (run.config_json or {}).get("llm_provider"))
        context = AgentContext(
            run_id=run_id,
            project_id=project.id,
            workspace_dir=workspace_dir,
            db=self.db,
            llm_client=client,
            bus=event_bus,
            config=run.config_json or {},
        )
        self._active_runs[run_id] = context

        # Update run to running
        run.status = "running"
        run.started_at = datetime.now(timezone.utc)
        self.db.commit()

        await event_bus.publish(run_id, "agent_started", {"status": "running", "run_id": run_id})

        start_time = time.time()
        pipeline_success = True

        # Filter active agents
        from app.agents import ALL_AGENTS
        selected_agents = ALL_AGENTS
        if agents_to_run:
            selected_agents = [a for a in ALL_AGENTS if a.agent_id in agents_to_run]

        # Ensure AgentTasks exist in DB
        for agent in selected_agents:
            task = self.db.query(AgentTask).filter(AgentTask.run_id == run_id, AgentTask.agent_id == agent.agent_id).first()
            if not task:
                task = AgentTask(
                    run_id=run_id,
                    agent_id=agent.agent_id,
                    agent_name=agent.agent_name,
                    order=agent.order,
                    status="idle",
                    progress=0,
                    current_action="Queued for dispatch..."
                )
                self.db.add(task)
        self.db.commit()

        # Execute agents sequentially
        for agent in selected_agents:
            if context.cancelled:
                run.status = "cancelled"
                await context.emit_log("orchestrator", "WARN", "Pipeline run cancelled by user.")
                break

            task = self.db.query(AgentTask).filter(AgentTask.run_id == run_id, AgentTask.agent_id == agent.agent_id).first()
            if task:
                task.status = "running"
                task.started_at = datetime.now(timezone.utc)
                task.current_action = f"Running {agent.role}..."
                self.db.commit()

            await event_bus.publish(
                run_id,
                "agent_started",
                {
                    "agent_id": agent.agent_id,
                    "agent_name": agent.agent_name,
                    "order": agent.order,
                    "status": "running",
                }
            )

            try:
                res = await agent.run(context)
                if task:
                    task.status = res.status
                    task.progress = 100
                    task.completed_at = datetime.now(timezone.utc)
                    task.duration_ms = res.duration_ms
                    task.tokens_used = res.tokens_used
                    task.cost_estimate_usd = res.cost_usd
                    task.artifacts_json = res.artifacts
                    task.current_action = res.summary
                    self.db.commit()

                await event_bus.publish(
                    run_id,
                    "agent_completed",
                    {
                        "agent_id": agent.agent_id,
                        "status": res.status,
                        "summary": res.summary,
                        "duration_ms": res.duration_ms,
                    }
                )

                if res.status == "failed":
                    pipeline_success = False
                    break

            except Exception as e:
                pipeline_success = False
                err_msg = f"Agent {agent.agent_id} failed with error: {str(e)}"
                if task:
                    task.status = "failed"
                    task.error_message = err_msg
                    task.completed_at = datetime.now(timezone.utc)
                    self.db.commit()

                await context.emit_log(agent.agent_id, "ERROR", err_msg)
                await event_bus.publish(
                    run_id,
                    "agent_completed",
                    {"agent_id": agent.agent_id, "status": "failed", "error": err_msg}
                )
                break

        # Finalize run
        total_duration = time.time() - start_time
        run.completed_at = datetime.now(timezone.utc)
        run.duration_seconds = round(total_duration, 1)

        if not context.cancelled:
            run.status = "passed" if pipeline_success else "failed"

        self.db.commit()
        self._active_runs.pop(run_id, None)

        await event_bus.publish(
            run_id,
            "run_finished",
            {
                "run_id": run_id,
                "status": run.status,
                "duration_seconds": run.duration_seconds,
            }
        )
        return {
            "run_id": run_id,
            "status": run.status,
            "duration_seconds": run.duration_seconds,
        }
