from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator

from ..core.unified_auth import get_current_user_unified
from ..models.database import User
from ..runtime.temporal_oracle import default_oracle


router = APIRouter()


class SimTimeUpdate(BaseModel):
    sim_time: Optional[str] = None
    advance_seconds: Optional[int] = None

    @field_validator("sim_time")
    @classmethod
    def _validate_iso(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        try:
            # Accept YYYY-MM-DD or ISO 8601
            if len(v) == 10:
                datetime.strptime(v, "%Y-%m-%d")
            else:
                datetime.fromisoformat(v)
        except Exception as e:
            raise ValueError(f"Invalid datetime format: {e!s}")
        return v


@router.get("/runtime/simtime")
def get_sim_time(current_user: User = Depends(get_current_user_unified)):
    """Return current simulation time (UTC)."""
    sim = default_oracle.get_sim_time()
    return {"sim_time": sim.isoformat()}


@router.post("/runtime/simtime")
def set_or_advance_sim_time(
    payload: SimTimeUpdate, current_user: User = Depends(get_current_user_unified)
):
    """Set or advance simulation time.

    Provide either `sim_time` (ISO string) or `advance_seconds`.
    """
    if payload.sim_time:
        if len(payload.sim_time) == 10:
            tmp = datetime.strptime(payload.sim_time, "%Y-%m-%d")
            dt = datetime(tmp.year, tmp.month, tmp.day, tzinfo=UTC)
        else:
            dt = datetime.fromisoformat(payload.sim_time).astimezone(UTC)
        default_oracle.set_sim_time(dt)
        return {"sim_time": default_oracle.get_sim_time().isoformat(), "updated": True}

    if payload.advance_seconds is not None:
        if payload.advance_seconds < 0:
            raise HTTPException(status_code=400, detail="advance_seconds must be >= 0")
        new_dt = default_oracle.advance(timedelta(seconds=payload.advance_seconds))
        return {"sim_time": new_dt.isoformat(), "advanced": payload.advance_seconds}

    raise HTTPException(status_code=400, detail="Provide sim_time or advance_seconds")


