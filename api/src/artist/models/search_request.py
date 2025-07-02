from typing import Dict
from pydantic import Field, BaseModel

class SearchRequest(BaseModel):
    limit: int = 50
    offset: int = 0
    sort: Dict[str, bool] = Field(default_factory=dict)
