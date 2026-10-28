"""Database and project seeding script for CodeSentinel AI.

Creates 2 real sample Python codebases with seeded bugs and seeds 3 historical
completed runs with comprehensive telemetry, tests, defects, and patches.
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.database import engine, SessionLocal, init_db
from app.config import settings
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
from app.agents import ALL_AGENTS


def create_sample_projects():
    """Writes the 2 sample buggy Python projects to data/projects/."""
    # 1. CalculatorPro Project
    calc_dir = settings.PROJECTS_DIR / "calculator_pro"
    calc_dir.mkdir(parents=True, exist_ok=True)

    calc_code = '''"""CalculatorPro - Core financial and scientific mathematical utility."""

from decimal import Decimal


class Calculator:
    """Mathematical computation engine."""

    def add(self, a: float, b: float) -> float:
        return a + b

    def subtract(self, a: float, b: float) -> float:
        return a - b

    def multiply(self, a: float, b: float) -> float:
        return a * b

    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ZeroDivisionError("Division by zero")
        return a / b

    def harmonic_mean(self, numbers: list) -> float:
        """Computes harmonic mean.
        BUG SEEDED: If numbers contains 0, it crashes with ZeroDivisionError
        instead of validating that inputs must be strictly positive.
        """
        if not numbers:
            return 0.0
        sum_reciprocals = 0.0
        for x in numbers:
            # Seeded bug: direct division without check
            sum_reciprocals += 1.0 / x
        return len(numbers) / sum_reciprocals

    def compound_interest(self, principal: float, rate: float, periods: int, years: int) -> float:
        """Computes compounding interest.
        BUG SEEDED: Direct float exponentiation leads to IEEE-754 epsilon drift.
        """
        # Seeded bug: float math without Decimal scaling
        amount = principal * ((1.0 + (rate / periods)) ** (periods * years))
        return amount

    def percentile(self, data: list, p: float) -> float:
        """Computes p-th percentile from dataset.
        BUG SEEDED: Off-by-one indexing error on boundary index calculation.
        """
        if not data:
            return 0.0
        sorted_data = sorted(data)
        # Seeded bug: int(len * p) causes off-by-one at 1.0 boundary
        idx = int(len(sorted_data) * p)
        if idx >= len(sorted_data):
            idx = len(sorted_data) - 1
        return sorted_data[idx]
'''
    (calc_dir / "calculator.py").write_text(calc_code, encoding="utf-8")

    calc_test = '''"""Baseline test suite for CalculatorPro."""

import pytest
from calculator import Calculator


def test_basic_arithmetic():
    calc = Calculator()
    assert calc.add(10, 5) == 15
    assert calc.subtract(10, 5) == 5
    assert calc.multiply(10, 5) == 50
    assert calc.divide(10, 5) == 2


def test_harmonic_mean_standard():
    calc = Calculator()
    assert round(calc.harmonic_mean([2.0, 4.0, 8.0]), 2) == 3.43


def test_percentile_median():
    calc = Calculator()
    assert calc.percentile([1, 2, 3, 4, 5], 0.5) == 3
'''
    (calc_dir / "test_calculator.py").write_text(calc_test, encoding="utf-8")

    # 2. ShoppingCartCore Project
    cart_dir = settings.PROJECTS_DIR / "shopping_cart_core"
    cart_dir.mkdir(parents=True, exist_ok=True)

    cart_code = '''"""ShoppingCartCore - E-commerce cart and promotional discount engine."""

from typing import Optional, Dict


class Voucher:
    def __init__(self, code: str, discount_pct: float):
        self.code = code
        self.discount_pct = discount_pct


class ShoppingCart:
    """Manages customer items, taxes, and promotional coupons."""

    def __init__(self):
        self.items: Dict[str, dict] = {}
        self.applied_discount = 0.0

    def add_item(self, item_id: str, price: float, quantity: int = 1):
        if item_id in self.items:
            self.items[item_id]["quantity"] += quantity
        else:
            self.items[item_id] = {"price": price, "quantity": quantity}

    def remove_item(self, item_id: str):
        if item_id in self.items:
            del self.items[item_id]

    def get_subtotal(self) -> float:
        return sum(item["price"] * item["quantity"] for item in self.items.values())

    def apply_discount(self, voucher: Optional[Voucher] = None) -> float:
        """Applies promotional discount.
        BUG SEEDED: Accesses voucher.code directly without checking `if voucher is None`.
        """
        subtotal = self.get_subtotal()
        # Seeded bug: AttributeError when voucher is None
        if voucher.code.startswith("VIP"):
            self.applied_discount = subtotal * (voucher.discount_pct / 100.0)
        else:
            self.applied_discount = subtotal * 0.05
        return self.get_total()

    def apply_discount_percentage(self, percentage: float):
        """BUG SEEDED: Does not clamp discount percentage, allowing negative totals."""
        subtotal = self.get_subtotal()
        # Seeded bug: percentage > 100 produces negative total
        self.applied_discount = subtotal * (percentage / 100.0)

    def get_total(self) -> float:
        return self.get_subtotal() - self.applied_discount
'''
    (cart_dir / "cart.py").write_text(cart_code, encoding="utf-8")

    cart_test = '''"""Baseline test suite for ShoppingCartCore."""

import pytest
from cart import ShoppingCart, Voucher


def test_cart_add_and_subtotal():
    cart = ShoppingCart()
    cart.add_item("ITEM-1", 20.0, 2)
    cart.add_item("ITEM-2", 15.0, 1)
    assert cart.get_subtotal() == 55.0


def test_cart_valid_voucher():
    cart = ShoppingCart()
    cart.add_item("ITEM-1", 100.0, 1)
    voucher = Voucher(code="VIP-50", discount_pct=50.0)
    assert cart.apply_discount(voucher) == 50.0
'''
    (cart_dir / "test_cart.py").write_text(cart_test, encoding="utf-8")


def seed_database():
    """Populates database with projects, historical runs, and evaluation metrics."""
    init_db()
    db = SessionLocal()

    # Clear existing data if any
    try:
        # Check if already seeded
        if db.query(Project).count() > 0:
            print("Database already contains projects. Re-seeding with clean demo data...")
            db.query(FeedbackRecord).delete()
            db.query(MetricSnapshot).delete()
            db.query(CoverageSnapshot).delete()
            db.query(Patch).delete()
            db.query(RootCauseResult).delete()
            db.query(BugReport).delete()
            db.query(TestResult).delete()
            db.query(TestCase).delete()
            db.query(AgentTask).delete()
            db.query(Run).delete()
            db.query(Project).delete()
            db.query(SystemSetting).delete()
            db.commit()

        # 1. Seed Projects
        p1 = Project(
            id="proj-calc-001",
            name="CalculatorPro",
            description="High-precision scientific & financial computation library with arithmetic and amortization algorithms.",
            source_type="sample",
            source_path=str(settings.PROJECTS_DIR / "calculator_pro"),
            default_branch="main",
            language="python",
        )
        p2 = Project(
            id="proj-cart-002",
            name="ShoppingCartCore",
            description="E-commerce shopping cart, promotional vouchers, discount matrix, and checkout pricing engine.",
            source_type="sample",
            source_path=str(settings.PROJECTS_DIR / "shopping_cart_core"),
            default_branch="main",
            language="python",
        )
        db.add_all([p1, p2])
        db.commit()

        # 2. Seed 3 Completed Historical Runs for CalculatorPro
        now = datetime.now(timezone.utc)
        run_data = [
            {
                "run_id": "run-hist-101",
                "run_number": 1,
                "commit_hash": "a1b2c3d",
                "branch": "main",
                "started_at": now - timedelta(days=3),
                "duration": 185.0,
                "coverage": 72.4,
                "mutation": 64.0,
                "defects": 3,
                "top1": 78.0,
                "fp_rate": 8.5,
                "patch_success": 66.7,
            },
            {
                "run_id": "run-hist-102",
                "run_number": 2,
                "commit_hash": "e4f5g6h",
                "branch": "main",
                "started_at": now - timedelta(days=1, hours=4),
                "duration": 142.0,
                "coverage": 81.0,
                "mutation": 75.5,
                "defects": 2,
                "top1": 86.4,
                "fp_rate": 5.1,
                "patch_success": 82.0,
            },
            {
                "run_id": "run-hist-103",
                "run_number": 3,
                "commit_hash": "8b771e3",
                "branch": "feat/harmonic-zero-guard",
                "started_at": now - timedelta(minutes=45),
                "duration": 119.0,
                "coverage": 88.6,
                "mutation": 84.2,
                "defects": 2,
                "top1": 93.1,
                "fp_rate": 2.4,
                "patch_success": 93.3,
            }
        ]

        for rd in run_data:
            run = Run(
                id=rd["run_id"],
                project_id=p1.id,
                run_number=rd["run_number"],
                status="passed",
                trigger="manual",
                commit_hash=rd["commit_hash"],
                branch=rd["branch"],
                commit_message=f"feat(calc): autonomous synthesis & fault localization pass #{rd['run_number']}",
                author="karthik@codesentinel.ai",
                started_at=rd["started_at"],
                completed_at=rd["started_at"] + timedelta(seconds=rd["duration"]),
                duration_seconds=rd["duration"],
                config_json={"llm_provider": "mock", "max_repair_iterations": 3}
            )
            db.add(run)

            # Seed 7 Agent Tasks for this run
            for agent in ALL_AGENTS:
                task = AgentTask(
                    run_id=rd["run_id"],
                    agent_id=agent.agent_id,
                    agent_name=agent.agent_name,
                    order=agent.order,
                    status="passed",
                    progress=100,
                    current_action=f"Completed {agent.role}",
                    started_at=rd["started_at"] + timedelta(seconds=agent.order * 10),
                    completed_at=rd["started_at"] + timedelta(seconds=agent.order * 10 + 15),
                    duration_ms=1500,
                    tokens_used=12400,
                    cost_estimate_usd=0.035,
                    artifacts_json=[f"{agent.agent_id}_artifact.json"]
                )
                db.add(task)

            # Seed MetricSnapshot
            ms = MetricSnapshot(
                run_id=rd["run_id"],
                code_coverage_pct=rd["coverage"],
                branch_coverage_pct=rd["coverage"] - 6.2,
                mutation_score=rd["mutation"],
                defect_detection_rate=95.0 + (rd["run_number"] * 0.8),
                fault_localization_top1_acc=rd["top1"],
                fault_localization_top3_acc=rd["top1"] + 5.0,
                false_positive_rate=rd["fp_rate"],
                patch_success_rate=rd["patch_success"],
                execution_duration_sec=rd["duration"],
                total_tokens_used=86500,
                cost_usd=0.26
            )
            db.add(ms)

            # Seed CoverageSnapshot
            cs = CoverageSnapshot(
                run_id=rd["run_id"],
                statement_coverage_pct=rd["coverage"],
                branch_coverage_pct=rd["coverage"] - 6.2,
                uncovered_lines_count=max(4, 30 - rd["run_number"] * 8),
                file_coverage_json={
                    "calculator.py": {"pct": rd["coverage"], "lines": [42, 45, 62]},
                    "test_calculator.py": {"pct": 100.0, "lines": []}
                }
            )
            db.add(cs)

        # 3. Seed rich detailed records for the latest run (run-hist-103)
        latest_run_id = "run-hist-103"

        # Synthesized Test Cases
        tc1 = TestCase(
            run_id=latest_run_id,
            test_key="ST-101",
            name="test_harmonic_mean_zero_division_guard",
            category="boundary",
            target_file="calculator.py",
            target_function="harmonic_mean",
            line_start=38,
            line_end=52,
            code_snippet=(
                "def test_harmonic_mean_zero_division_guard():\n"
                "    calc = Calculator()\n"
                "    # Zero input must raise ValueError instead of ZeroDivisionError\n"
                "    with pytest.raises(ValueError, match='Zero cannot be included in harmonic mean'):\n"
                "        calc.harmonic_mean([10.0, 0.0, 20.0])\n"
            ),
            agent_rationale="Unexplored branch: reciprocal division 1/x lacks zero input guard.",
            mutation_impact_pct=8.4
        )
        tc2 = TestCase(
            run_id=latest_run_id,
            test_key="ST-102",
            name="test_compound_interest_sub_penny_precision",
            category="boundary",
            target_file="calculator.py",
            target_function="compound_interest",
            line_start=55,
            line_end=70,
            code_snippet=(
                "def test_compound_interest_sub_penny_precision():\n"
                "    calc = Calculator()\n"
                "    res = calc.compound_interest(1000.0, 0.05, 365, 1)\n"
                "    assert round(res, 2) == 1051.27\n"
            ),
            agent_rationale="Tests IEEE-754 epsilon drift under 365 compounding intervals.",
            mutation_impact_pct=6.2
        )
        tc3 = TestCase(
            run_id=latest_run_id,
            test_key="ST-103",
            name="test_percentile_maximum_boundary_clamp",
            category="negative",
            target_file="calculator.py",
            target_function="percentile",
            line_start=72,
            line_end=85,
            code_snippet=(
                "def test_percentile_maximum_boundary_clamp():\n"
                "    calc = Calculator()\n"
                "    val = calc.percentile([1, 2, 3, 4, 5], 1.0)\n"
                "    assert val == 5\n"
            ),
            agent_rationale="Off-by-one test ensuring 100th percentile accesses valid index.",
            mutation_impact_pct=5.5
        )
        db.add_all([tc1, tc2, tc3])

        # Test results
        tr1 = TestResult(run_id=latest_run_id, name="test_harmonic_mean_zero_division_guard", status="failed", duration_ms=62, is_synthesized=True, failure_message="ZeroDivisionError: float division by zero")
        tr2 = TestResult(run_id=latest_run_id, name="test_compound_interest_sub_penny_precision", status="passed", duration_ms=45, is_synthesized=True)
        tr3 = TestResult(run_id=latest_run_id, name="test_basic_arithmetic", status="passed", duration_ms=30, is_synthesized=False)
        db.add_all([tr1, tr2, tr3])

        # Bug Report
        bug1 = BugReport(
            id="bug-seeded-401",
            run_id=latest_run_id,
            bug_key="BUG-401",
            title="ZeroDivisionError in harmonic_mean calculation when dataset contains 0",
            severity="critical",
            category="zero_division",
            target_file="calculator.py",
            target_function="harmonic_mean",
            target_line=45,
            detection_confidence=98.5,
            static_linter="ruff/bandit",
            stack_trace="ZeroDivisionError: float division by zero\n  File 'calculator.py', line 45, in harmonic_mean\n    sum_reciprocals += 1.0 / x",
            root_cause_explanation="Direct division 1.0 / x executes without checking x != 0. When input contains zero, it immediately crashes.",
            status="patch_ready"
        )
        db.add(bug1)

        # Root Cause Ochiai Ranking
        rc1 = RootCauseResult(
            run_id=latest_run_id,
            bug_id="bug-seeded-401",
            method="sbfl_ochiai",
            top1_accuracy=True,
            top3_accuracy=True,
            top5_accuracy=True,
            rankings_json=[
                {"rank": 1, "file": "calculator.py", "line": 45, "score": 0.962, "code": "sum_reciprocals += 1.0 / x", "is_suspect": True},
                {"rank": 2, "file": "calculator.py", "line": 43, "score": 0.740, "code": "for x in numbers:", "is_suspect": True},
                {"rank": 3, "file": "calculator.py", "line": 41, "score": 0.320, "code": "sum_reciprocals = 0.0", "is_suspect": False},
                {"rank": 4, "file": "calculator.py", "line": 38, "score": 0.150, "code": "if not numbers: return 0.0", "is_suspect": False}
            ]
        )
        db.add(rc1)

        # Candidate Patch
        p_diff = (
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
        )
        patch1 = Patch(
            id="patch-seeded-801",
            run_id=latest_run_id,
            bug_id="bug-seeded-401",
            patch_key="PATCH-801",
            iteration=1,
            strategy="Defensive Zero Guard & ValueError Raise",
            target_file="calculator.py",
            diff_content=p_diff,
            status="candidate",
            confidence_score=98.5,
            explanation="Added defensive input guard checking for zero or negative values before reciprocal accumulation.",
            author_agent="Self-Healing / Repair Agent (DeepSeek-Coder)",
            validation_result_json={
                "baseline_passed": 84,
                "baseline_total": 84,
                "synthesized_passed": 14,
                "synthesized_total": 14,
                "regressions_introduced": 0,
                "mutation_score_delta_pct": 5.4,
                "false_positive_risk": 0.02,
                "verdict": "verified",
                "notes": "Verified against all 98 tests. Zero regressions. Mutation test killed 42/44 surviving mutants."
            }
        )
        db.add(patch1)

        # Feedback Record
        fb1 = FeedbackRecord(
            project_id=p1.id,
            run_id=latest_run_id,
            bug_category="zero_division",
            repair_strategy="Defensive Zero Guard & ValueError Raise",
            success=True,
            iterations_needed=1,
            tests_synthesized_count=3,
            mutation_delta=5.4,
            tuning_parameters_json={"prompt_temperature": 0.2, "beam_width": 3}
        )
        db.add(fb1)

        # System Setting
        setting = db.query(SystemSetting).filter_by(id=1).first()
        if not setting:
            setting = SystemSetting(
                id=1,
                llm_provider="mock",
                active_model="claude-3-7-sonnet",
                api_keys_json={},
                auto_heal_policy="human_review",
                confidence_threshold=0.85,
                max_repair_iterations=3,
                sandbox_timeout_sec=30,
                sandbox_max_memory_mb=512
            )
            db.add(setting)

        db.commit()
        print("Successfully seeded 2 sample projects and 3 historical pipeline runs with rich telemetry!")

    finally:
        db.close()


if __name__ == "__main__":
    create_sample_projects()
    seed_database()
