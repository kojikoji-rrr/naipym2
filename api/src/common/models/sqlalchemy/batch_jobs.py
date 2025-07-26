from typing import Any, Dict
from sqlalchemy import Column, Integer, Text, BLOB

from src.common.services.db_service import Base, now

class BatchJobs(Base):
    __tablename__ = 'batch_jobs'
    
    job_id = Column(Text, primary_key=True)
    job_name = Column(Text, nullable=True)
    argument = Column(Text)
    pid = Column(Integer, nullable=True)
    log_file = Column(Text)
    status = Column(Text)
    message = Column(Text)
    started_at = Column(Text, nullable=False, default=now())
    stopped_at = Column(Text)

    def to_dict(self) -> Dict[str,Any]:
        return {
            "job_id": self.job_id,
            "job_name": self.job_name,
            "argument": self.argument,
            "pid": self.pid,
            "log_file": self.log_file,
            "status": self.status,
            "message": self.message,
            "started_at": self.started_at,
            "stopped_at": self.stopped_at
        }
