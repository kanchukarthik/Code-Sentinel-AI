"""Root cause endpoints: Spectrum-Based Fault Localization rankings."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.root_cause import RootCauseResult
from app.schemas.bug import RootCauseResponse, RootCauseRankingItem

router = APIRouter(tags=["Root Cause Analysis"])


@router.get("/runs/{run_id}/root-causes", response_model=List[RootCauseResponse])
def get_run_root_causes(run_id: str, db: Session = Depends(get_db)):
    """Retrieve SBFL Ochiai/Tarantula rankings and analysis for a run."""
    results = db.query(RootCauseResult).filter(RootCauseResult.run_id == run_id).all()
    output = []
    for rc in results:
        rankings = [
            RootCauseRankingItem(
                rank=r.get("rank", idx + 1),
                file=r.get("file", "unknown"),
                line=r.get("line", 1),
                score=r.get("score", 0.0),
                code=r.get("code", ""),
                is_suspect=r.get("is_suspect", False),
            )
            for idx, r in enumerate(rc.rankings_json or [])
        ]
        output.append(
            RootCauseResponse(
                id=rc.id,
                run_id=rc.run_id,
                bug_id=rc.bug_id,
                method=rc.method,
                top1_accuracy=rc.top1_accuracy,
                top3_accuracy=rc.top3_accuracy,
                top5_accuracy=rc.top5_accuracy,
                rankings_json=rankings,
                created_at=rc.created_at,
            )
        )
    return output
