"""Unit tests for Agent logic, AST parsing, and Fault Localization algorithms."""

import math
import pytest
from app.agents.code_intelligence import CodeIntelligenceAgent, CodeComplexityVisitor
from app.agents.root_cause import RootCauseAnalysisAgent
from app.llm.mock_client import MockLLMClient
import ast


def test_ast_complexity_visitor():
    code = """
def sample_function(x, y):
    if x > 0:
        if y > 0:
            return x + y
        else:
            return x - y
    for i in range(5):
        try:
            x += i
        except ValueError:
            pass
    return x
"""
    tree = ast.parse(code)
    visitor = CodeComplexityVisitor()
    visitor.visit(tree)
    assert len(visitor.functions) == 1
    func_info = visitor.functions[0]
    assert func_info["name"] == "sample_function"
    # Cyclomatic complexity baseline is 1 + 2 (ifs) + 1 (for) + 1 (except) = 5
    assert func_info["complexity"] >= 4


def test_root_cause_ochiai_and_tarantula():
    # Perfect suspiciousness: executed by all failing tests (n_cf=2), zero passing tests (n_cs=0, n_f=2, n_s=5)
    # Ochiai: 2 / sqrt(2 * (2 + 0)) = 2 / 2 = 1.0
    ochiai_score = RootCauseAnalysisAgent.calculate_ochiai(n_cf=2, n_cs=0, n_f=2)
    assert pytest.approx(ochiai_score, 0.001) == 1.0

    # Tarantula: (2/2) / ((2/2) + (0/5)) = 1.0 / 1.0 = 1.0
    taran_score = RootCauseAnalysisAgent.calculate_tarantula(n_cf=2, n_cs=0, n_f=2, n_s=5)
    assert pytest.approx(taran_score, 0.001) == 1.0

    # No failing executions (n_cf=0) -> score 0.0
    assert RootCauseAnalysisAgent.calculate_ochiai(n_cf=0, n_cs=5, n_f=2) == 0.0
    assert RootCauseAnalysisAgent.calculate_tarantula(n_cf=0, n_cs=5, n_f=2, n_s=5) == 0.0


@pytest.mark.asyncio
async def test_mock_llm_client_responses():
    client = MockLLMClient()
    
    # Test bug detection response
    res = await client.generate(
        system_prompt="You are the Bug Detection Agent in CodeSentinel AI.",
        user_prompt="Analyze the following failed execution traces."
    )
    assert len(res.content) > 0
    assert "defects" in res.content.lower() or "bug" in res.content.lower()
    assert res.total_tokens > 0
    assert res.cost_usd >= 0.0

    # Test patch generation response
    res_patch = await client.generate(
        system_prompt="You are the Patch Generation Agent in CodeSentinel AI.",
        user_prompt="Synthesize a unified diff patch."
    )
    assert "diff --git" in res_patch.content or "@@" in res_patch.content
