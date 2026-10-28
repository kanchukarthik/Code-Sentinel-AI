"""Deterministic Mock LLM Client returning realistic structured agent responses."""

import json
import time
from typing import Dict, Any, Optional
from app.llm.client import BaseLLMClient, LLMResponse


class MockLLMClient(BaseLLMClient):
    """Deterministic mock LLM client for offline demos and CI testing."""

    def __init__(self, model_name: str = "mock-claude-3-7"):
        super().__init__(model_name=model_name)

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> LLMResponse:
        start_time = time.time()
        prompt_lower = (system_prompt + " " + user_prompt).lower()

        # 1. Code Intelligence Agent response
        if "code intelligence" in prompt_lower or "ast" in prompt_lower:
            content = json.dumps({
                "complexity_summary": {
                    "high_complexity_functions": [
                        {"file": "calculator.py", "function": "harmonic_mean", "cyclomatic_complexity": 14},
                        {"file": "calculator.py", "function": "compound_interest", "cyclomatic_complexity": 11},
                        {"file": "cart.py", "function": "apply_discount", "cyclomatic_complexity": 13}
                    ]
                },
                "hotspots": ["calculator.py:42", "cart.py:88"],
                "coverage_gaps": [
                    {"file": "calculator.py", "uncovered_branches": [2, 5], "line_range": [38, 52]},
                    {"file": "cart.py", "uncovered_branches": [3, 7], "line_range": [70, 95]}
                ]
            })

        # 2. Test Synthesis Agent response
        elif "test synthesis" in prompt_lower or "synthesize test" in prompt_lower or "generate test" in prompt_lower:
            content = json.dumps({
                "synthesized_tests": [
                    {
                        "test_key": "ST-101",
                        "name": "test_harmonic_mean_zero_division_guard",
                        "category": "boundary",
                        "target_file": "calculator.py",
                        "target_function": "harmonic_mean",
                        "line_start": 38,
                        "line_end": 52,
                        "code_snippet": (
                            "def test_harmonic_mean_zero_division_guard():\n"
                            "    calc = Calculator()\n"
                            "    # Boundary stress: zero value in dataset must raise ValueError, not crash\n"
                            "    with pytest.raises(ValueError, match='Zero cannot be included in harmonic mean'):\n"
                            "        calc.harmonic_mean([10.0, 0.0, 20.0])\n"
                        ),
                        "agent_rationale": "Code Intelligence identified reciprocal division 1/x without zero guard, triggering ZeroDivisionError on boundary inputs.",
                        "mutation_impact_pct": 8.4
                    },
                    {
                        "test_key": "ST-102",
                        "name": "test_compound_interest_sub_penny_precision",
                        "category": "boundary",
                        "target_file": "calculator.py",
                        "target_function": "compound_interest",
                        "line_start": 60,
                        "line_end": 78,
                        "code_snippet": (
                            "def test_compound_interest_sub_penny_precision():\n"
                            "    calc = Calculator()\n"
                            "    result = calc.compound_interest(principal=1000.00, rate=0.05, periods=365, years=1)\n"
                            "    # Verify precision is rounded using Decimal to prevent IEEE-754 drift\n"
                            "    assert isinstance(result, float)\n"
                            "    assert round(result, 2) == 1051.27\n"
                        ),
                        "agent_rationale": "High-frequency compounding exercises IEEE-754 binary floating point epsilon accumulation.",
                        "mutation_impact_pct": 6.2
                    },
                    {
                        "test_key": "ST-103",
                        "name": "test_cart_null_coupon_voucher_rejection",
                        "category": "exception_handling",
                        "target_file": "cart.py",
                        "target_function": "apply_discount",
                        "line_start": 80,
                        "line_end": 105,
                        "code_snippet": (
                            "def test_cart_null_coupon_voucher_rejection():\n"
                            "    cart = ShoppingCart()\n"
                            "    cart.add_item('ITEM-01', price=50.0, quantity=2)\n"
                            "    # Negative & Exception stress: None voucher should safely raise or ignore\n"
                            "    with pytest.raises(TypeError, match='Voucher cannot be None'):\n"
                            "        cart.apply_discount(voucher=None)\n"
                        ),
                        "agent_rationale": "Synthesized negative test ensuring uninitialized or null coupon objects do not cause unhandled AttributeError crashes.",
                        "mutation_impact_pct": 7.5
                    },
                    {
                        "test_key": "ST-104",
                        "name": "test_cart_discount_overflow_clamp",
                        "category": "negative",
                        "target_file": "cart.py",
                        "target_function": "apply_discount",
                        "line_start": 85,
                        "line_end": 110,
                        "code_snippet": (
                            "def test_cart_discount_overflow_clamp():\n"
                            "    cart = ShoppingCart()\n"
                            "    cart.add_item('ITEM-02', price=100.0, quantity=1)\n"
                            "    # Negative discount percentage greater than 100%\n"
                            "    cart.apply_discount_percentage(150.0)\n"
                            "    assert cart.get_total() >= 0.0\n"
                        ),
                        "agent_rationale": "Guards against negative cart totals when coupon discounts exceed 100%.",
                        "mutation_impact_pct": 5.1
                    }
                ]
            })

        # 3. Bug Detection Agent response
        elif "bug detection" in prompt_lower or "defect" in prompt_lower:
            content = json.dumps({
                "bugs": [
                    {
                        "bug_key": "BUG-401",
                        "title": "ZeroDivisionError in harmonic_mean calculation when dataset contains 0",
                        "severity": "critical",
                        "category": "zero_division",
                        "target_file": "calculator.py",
                        "target_function": "harmonic_mean",
                        "target_line": 45,
                        "detection_confidence": 98.5,
                        "static_linter": "ruff/bandit",
                        "stack_trace": (
                            "ZeroDivisionError: float division by zero\n"
                            "  File 'calculator.py', line 45, in harmonic_mean\n"
                            "    sum_reciprocals += 1.0 / x\n"
                        ),
                        "root_cause_explanation": "Direct division `1.0 / x` executes without validating that `x != 0`. When input contains zero, it immediately throws ZeroDivisionError instead of raising ValueError."
                    },
                    {
                        "bug_key": "BUG-402",
                        "title": "AttributeError: 'NoneType' object has no attribute 'code' on missing voucher",
                        "severity": "high",
                        "category": "null_dereference",
                        "target_file": "cart.py",
                        "target_function": "apply_discount",
                        "target_line": 92,
                        "detection_confidence": 94.0,
                        "static_linter": "ruff",
                        "stack_trace": (
                            "AttributeError: 'NoneType' object has no attribute 'code'\n"
                            "  File 'cart.py', line 92, in apply_discount\n"
                            "    if voucher.code.startswith('VIP'):\n"
                        ),
                        "root_cause_explanation": "The method dereferences `voucher.code` without checking `if voucher is None:`. When optional voucher argument is omitted or null, it crashes."
                    }
                ]
            })

        # 4. Root-Cause Analysis Agent response
        elif "root cause" in prompt_lower or "ochiai" in prompt_lower:
            content = json.dumps({
                "method": "sbfl_ochiai",
                "top1_accuracy": True,
                "top3_accuracy": True,
                "top5_accuracy": True,
                "explanation": "Spectrum-Based Fault Localization (Ochiai) computed high suspicion at the point of unvalidated arithmetic inversion and unchecked attribute dereference.",
                "rankings": [
                    {"rank": 1, "file": "calculator.py", "line": 45, "score": 0.962, "code": "sum_reciprocals += 1.0 / x", "is_suspect": True},
                    {"rank": 2, "file": "calculator.py", "line": 43, "score": 0.740, "code": "for x in numbers:", "is_suspect": True},
                    {"rank": 3, "file": "calculator.py", "line": 41, "score": 0.320, "code": "sum_reciprocals = 0.0", "is_suspect": False},
                    {"rank": 4, "file": "cart.py", "line": 92, "score": 0.941, "code": "if voucher.code.startswith('VIP'):", "is_suspect": True},
                    {"rank": 5, "file": "cart.py", "line": 90, "score": 0.410, "code": "def apply_discount(self, voucher=None):", "is_suspect": False}
                ]
            })

        # 5. Patch Generation Agent response
        elif "patch" in prompt_lower or "repair" in prompt_lower:
            content = json.dumps({
                "patch_key": "PATCH-801",
                "strategy": "Defensive Zero Guard & ValueError Raise",
                "target_file": "calculator.py",
                "diff_content": (
                    "--- a/calculator.py\n"
                    "+++ b/calculator.py\n"
                    "@@ -42,5 +42,8 @@ class Calculator:\n"
                    "     def harmonic_mean(self, numbers):\n"
                    "         sum_reciprocals = 0.0\n"
                    "         for x in numbers:\n"
                    "+            if x <= 0:\n"
                    "+                raise ValueError('Zero or negative numbers cannot be included in harmonic mean')\n"
                    "             sum_reciprocals += 1.0 / x\n"
                    "         return len(numbers) / sum_reciprocals\n"
                ),
                "confidence_score": 98.5,
                "explanation": "Added input validation guard checking for zero or negative values before reciprocal accumulation, raising a clean ValueError with informative message.",
                "author_agent": "Self-Healing / Repair Agent (DeepSeek-Coder)"
            })

        # 6. Self-Healing / Validation Agent response
        else:
            content = json.dumps({
                "verdict": "verified",
                "status": "passed",
                "baseline_passed": 84,
                "baseline_total": 84,
                "synthesized_passed": 14,
                "synthesized_total": 14,
                "regressions_introduced": 0,
                "mutation_score_delta_pct": 5.4,
                "false_positive_risk": 0.02,
                "notes": "Patch cleanly applies. All 98 tests pass without regression. Killed 42/44 mutants."
            })

        latency = int((time.time() - start_time) * 1000) + 120
        return LLMResponse(
            content=content,
            prompt_tokens=420,
            completion_tokens=280,
            total_tokens=700,
            latency_ms=latency,
            cost_usd=0.0014,
            model=self.model_name,
            provider="mock"
        )
