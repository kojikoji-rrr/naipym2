from typing import Any, Dict
from pydantic import Field, BaseModel

class SearchRequest(BaseModel):
    limit: int = 50
    page: int = 0
    props: Dict[str,Any] = Field(default_factory=dict)
