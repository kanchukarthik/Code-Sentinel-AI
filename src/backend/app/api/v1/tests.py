"""Test synthesis endpoints: query synthesized tests and execution results."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.test_case import TestCase, TestResult
from app.schemas.test import TestCaseResponse, TestResultResponse

router = APIRouter(tags=["Tests"])


@router.get("/runs/{run_id}/tests", response_model=List[TestCaseResponse])
def get_run_tests(
    run_id: str,
    category: Optional[str] = Query(None, description="Filter by category (functional, boundary, negative, regression, exception_handling)"),
    db: Session = Depends(get_db),
):
    """Retrieve all synthesized tests for a run."""
    query = db.query(TestCase).filter(TestCase.run_id == run_id)
    if category and category != "ALL":
        query = query.filter(TestCase.category == category)

    tests = query.order_by(TestCase.created_at.asc()).all()
    return [
        TestCaseResponse(
            id=t.id,
            run_id=t.run_id,
            test_key=t.test_key,
            name=t.name,
            category=t.category,
            target_file=t.target_file,
            target_function=t.target_function,
            line_start=t.line_start,
            line_end=t.line_end,
            code_snippet=t.code_snippet,
            agent_rationale=t.agent_rationale,
            mutation_impact_pct=t.mutation_impact_pct,
            created_at=t.created_at,
        )
        for t in tests
    ]


@router.get("/runs/{run_id}/test-results", response_model=List[TestResultResponse])
def get_run_test_results(
    run_id: str,
    status: Optional[str] = Query(None, description="Filter by status (passed, failed, error)"),
    db: Session = Depends(get_db),
):
    """Retrieve test execution results for a run."""
    query = db.query(TestResult).filter(TestResult.run_id == run_id)
    if status and status != "ALL":
        query = query.filter(TestResult.status == status)

    results = query.all()
    return [
        TestResultResponse(
            id=r.id,
            run_id=r.run_id,
            test_case_id=r.test_case_id,
            name=r.name,
            status=r.status,
            duration_ms=r.duration_ms,
            stdout=r.stdout,
            stderr=r.stderr,
            failure_message=r.failure_message,
            stack_trace=r.stack_trace,
            is_synthesized=r.is_synthesized,
        )
        for r in results
    ]
