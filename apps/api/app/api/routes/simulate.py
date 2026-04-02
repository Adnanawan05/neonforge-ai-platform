from fastapi import APIRouter
from pydantic import BaseModel

from app.services.phases.simulate import run_simulation

router = APIRouter()


class SimRequest(BaseModel):
    dataset_id: str
    scenario_a: dict[str, float]
    scenario_b: dict[str, float]


@router.post("")
async def simulate(req: SimRequest):
    return await run_simulation(req.dataset_id, req.scenario_a, req.scenario_b)
