from typing import Any, Dict
from pydantic import BaseModel

class ExecRequest(BaseModel):
    batchname: str
    args: Dict[str, Any] = {}