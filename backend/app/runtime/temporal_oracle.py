from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta


@dataclass
class TemporalOracle:
    """Maintains a simulation clock and enforces anti-look-ahead guards.

    This is a minimal, in-memory scaffold. It should be wrapped by a service
    (or dependency) in FastAPI when we wire it, and optionally persisted per run.
    """

    _sim_time: datetime | None = None

    def get_sim_time(self) -> datetime:
        """Return current simulation time (UTC). Defaults to now if unset."""
        if self._sim_time is None:
            return datetime.now(tz=UTC)
        return self._sim_time

    def set_sim_time(self, value: datetime) -> None:
        """Set simulation time (UTC)."""
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        self._sim_time = value.astimezone(UTC)

    def advance(self, delta: timedelta) -> datetime:
        """Advance simulation time by a timedelta and return new value."""
        self.set_sim_time(self.get_sim_time() + delta)
        return self.get_sim_time()

    # --- Guards -----------------------------------------------------------

    def gate_timestamp(self, ts: datetime, *, kind: str = "data") -> None:
        """Raise if a timestamp belongs to the future relative to sim time."""
        sim = self.get_sim_time()
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=UTC)
        ts_utc = ts.astimezone(UTC)
        if ts_utc > sim:
            raise ValueError(
                f"{kind} timestamp {ts_utc.isoformat()} is in the future of sim {sim.isoformat()}"
            )

    def gate_price_timestamp(self, ts: datetime) -> None:
        self.gate_timestamp(ts, kind="price")

    def gate_news_timestamp(self, ts: datetime) -> None:
        self.gate_timestamp(ts, kind="news")


# Singleton-style default for simple usage before DI wiring
default_oracle = TemporalOracle()
