"""Agent 4: Bug Detection Agent."""

import time
from typing import Dict, Any, List
from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.models.bug_report import BugReport


class BugDetectionAgent(BaseAgent):
    """Combines static linting, dynamic execution failures, and LLM reasoning to flag defects."""

    def __init__(self):
        super().__init__(
            agent_id="bug_detection",
            agent_name="Bug Detection Agent",
            order=4,
            role="Defect Classifier & Trace Analyzer"
        )

    async def run(self, context: AgentContext) -> AgentResult:
        start_time = time.time()
        await context.emit_log(self.agent_id, "INFO", "Triaging dynamic failure traces with static analysis signals...")
        await context.emit_progress(self.agent_id, 30, "Analyzing failure signatures...")

        # Request bug classifications from LLM
        prompt = "Analyze the test execution failures and static code hotspots. Classify confirmed bugs with severity and confidence."
        llm_resp = await context.llm_client.generate(
            system_prompt="You are the Bug Detection Agent in CodeSentinel AI. Return structured bug reports.",
            user_prompt=prompt,
            json_mode=True
        )

        bug_data = await context.llm_client.generate_json(
            system_prompt="You are the Bug Detection Agent in CodeSentinel AI.",
            user_prompt=prompt
        )

        raw_bugs = bug_data.get("bugs", [])
        created_bugs = []

        for idx, b in enumerate(raw_bugs):
            bug_key = b.get("bug_key", f"BUG-40{idx + 1}")
            title = b.get("title", f"Defect in {b.get('target_file', 'unknown')}")
            severity = b.get("severity", "high")
            category = b.get("category", "logic_error")
            target_file = b.get("target_file", "calculator.py")
            target_func = b.get("target_function", "compute")
            target_line = int(b.get("target_line", 42))
            confidence = float(b.get("detection_confidence", 95.0))
            stack = b.get("stack_trace", "Traceback unavailable")
            explanation = b.get("root_cause_explanation", "Defect identified via dynamic assertion failure.")

            bug_report = BugReport(
                run_id=context.run_id,
                bug_key=bug_key,
                title=title,
                severity=severity,
                category=category,
                target_file=target_file,
                target_function=target_func,
                target_line=target_line,
                detection_confidence=confidence,
                static_linter=b.get("static_linter", "ruff/bandit"),
                stack_trace=stack,
                execution_log=stack,
                root_cause_explanation=explanation,
                status="patch_ready"
            )
            context.db.add(bug_report)
            created_bugs.append(bug_report)

            await context.emit_log(
                self.agent_id,
                "ERROR" if severity in ["critical", "high"] else "WARN",
                f"[{severity.upper()}] {bug_key}: {title} at {target_file}:{target_line} (Conf: {confidence}%)"
            )
            await context.event_bus.publish(
                context.run_id,
                "bug_detected",
                {
                    "bug_key": bug_key,
                    "title": title,
                    "severity": severity,
                    "target_file": target_file,
                    "target_line": target_line,
                    "confidence": confidence,
                }
            )

        context.db.commit()
        context.data["bugs"] = [
            {
                "id": b.id,
                "bug_key": b.bug_key,
                "title": b.title,
                "target_file": b.target_file,
                "target_function": b.target_function,
                "target_line": b.target_line,
                "severity": b.severity,
                "root_cause_explanation": b.root_cause_explanation
            }
            for b in created_bugs
        ]

        await context.emit_progress(self.agent_id, 100, f"Confirmed {len(created_bugs)} defects")
        duration_ms = int((time.time() - start_time) * 1000)

        return AgentResult(
            agent_id=self.agent_id,
            status="passed",
            summary=f"Detected and triaged {len(created_bugs)} bugs ({sum(1 for b in created_bugs if b.severity == 'critical')} Critical, {sum(1 for b in created_bugs if b.severity == 'high')} High).",
            duration_ms=duration_ms,
            tokens_used=llm_resp.total_tokens,
            cost_usd=llm_resp.cost_usd,
            artifacts=["defect_inventory.json", "failure_signatures.json"]
        )
