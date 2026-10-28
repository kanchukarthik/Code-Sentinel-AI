"""Feedback loop endpoints: inspect past learning adaptations."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.feedback import FeedbackRecord
from app.schemas.metric import FeedbackRecordResponse

router = APIRouter(prefix="/feedback", tags=["Feedback Loop"])


@router.get("", response_model=List[FeedbackRecordResponse])
def get_feedback_records(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieve learning feedback records showing strategy adaptation over time."""
    query = db.query(FeedbackRecord)
    if project_id:
        query = query.filter(FeedbackRecord.project_id == project_id)

    records = query.order_by(FeedbackRecord.created_at.desc()).all()
    return [
        FeedbackRecordResponse(
            id=f.id,
            project_id=f.project_id,
            run_id=f.run_id,
            bug_category=f.bug_category,
            repair_strategy=f.repair_strategy,
            success=f.success,
            iterations_needed=f.iterations_needed,
            tests_synthesized_count=f.tests_synthesized_count,
            mutation_delta=f.mutation_delta,
            tuning_parameters_json=f.tuning_parameters_json or {},
            created_at=f.created_at,
        )
        for f in records
    ]
