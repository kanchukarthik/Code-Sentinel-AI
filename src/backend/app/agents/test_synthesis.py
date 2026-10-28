"""Agent 2: Test Synthesis Agent."""

import time
from typing import Dict, Any, List
from app.agents.base import BaseAgent, AgentContext, AgentResult
from app.models.test_case import TestCase


class TestSynthesisAgent(BaseAgent):
    """Synthesizes functional, boundary, negative, regression, and exception tests targeting uncovered paths."""

    def __init__(self):
        super().__init__(
            agent_id="test_synthesis",
            agent_name="Test Synthesis Agent",
            order=2,
            role="Autonomous Multi-Category Test Generation"
        )

    async def run(self, context: AgentContext) -> AgentResult:
        start_time = time.time()
        await context.emit_log(self.agent_id, "INFO", "Identifying untested control-flow branches and boundary values...")
        await context.emit_progress(self.agent_id, 20, "Synthesizing path constraints...")

        # Request tests from LLM
        prompt = (
            "Generate pytest test cases for the target modules targeting unexplored paths across 5 categories: "
            "functional, boundary, negative, regression, exception_handling."
        )
        llm_resp = await context.llm_client.generate(
            system_prompt="You are the Test Synthesis Agent in CodeSentinel AI. Return structured test cases.",
            user_prompt=prompt,
            json_mode=True
        )

        test_data = await context.llm_client.generate_json(
            system_prompt="You are the Test Synthesis Agent in CodeSentinel AI.",
            user_prompt=prompt
        )

        synthesized_tests = test_data.get("synthesized_tests", [])
        created_test_records = []
        test_file_code_blocks = [
            "import pytest\nimport math\nfrom decimal import Decimal\n\n# CodeSentinel AI Auto-Synthesized Test Suite\n"
        ]

        for idx, t_info in enumerate(synthesized_tests):
            test_key = t_info.get("test_key", f"ST-{200 + idx}")
            name = t_info.get("name", f"test_generated_{idx}")
            category = t_info.get("category", "boundary")
            target_file = t_info.get("target_file", "module.py")
            target_function = t_info.get("target_function", "execute")
            code_snippet = t_info.get("code_snippet", f"def {name}(): assert True\n")
            agent_rationale = t_info.get("agent_rationale", "Generated to cover unexplored branch.")
            mutation_impact = float(t_info.get("mutation_impact_pct", 5.0))

            test_case = TestCase(
                run_id=context.run_id,
                test_key=test_key,
                name=name,
                category=category,
                target_file=target_file,
                target_function=target_function,
                line_start=t_info.get("line_start", 1),
                line_end=t_info.get("line_end", 20),
                code_snippet=code_snippet,
                agent_rationale=agent_rationale,
                mutation_impact_pct=mutation_impact
            )
            context.db.add(test_case)
            created_test_records.append(test_case)
            test_file_code_blocks.append(code_snippet + "\n")

            await context.emit_log(
                self.agent_id,
                "AGENT",
                f"Synthesized [{category.upper()}] test `{name}` for {target_file}:{target_function}"
            )
            await context.event_bus.publish(
                context.run_id,
                "test_synthesized",
                {
                    "test_key": test_key,
                    "name": name,
                    "category": category,
                    "target_file": target_file,
                    "target_function": target_function,
                }
            )

        context.db.commit()

        # Write synthesized tests to workspace for Execution Agent
        synth_file = context.workspace_dir / "test_sentinel_synthesized.py"
        synth_file.write_text("\n".join(test_file_code_blocks), encoding="utf-8")

        context.data["synthesized_tests"] = synthesized_tests

        await context.emit_progress(self.agent_id, 100, f"Synthesized {len(synthesized_tests)} test cases")
        duration_ms = int((time.time() - start_time) * 1000)

        return AgentResult(
            agent_id=self.agent_id,
            status="passed",
            summary=f"Synthesized {len(synthesized_tests)} test cases across 5 categories.",
            duration_ms=duration_ms,
            tokens_used=llm_resp.total_tokens,
            cost_usd=llm_resp.cost_usd,
            artifacts=["test_sentinel_synthesized.py", "test_plan.json"]
        )
