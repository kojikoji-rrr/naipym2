from sqlalchemy import Column, Integer, Text
from sqlalchemy.sql import func

from src.common.services.db_service import Base

class BatchJobs(Base):
    __tablename__ = 'batch_jobs'
    
    job_id = Column(Text, primary_key=True)
    job_type = Column(Text, nullable=False)
    job_name = Column(Text, nullable=False)
    parameters = Column(Text)
    status = Column(Text, nullable=False, default='pending')
    process_id = Column(Integer)
    created_at = Column(Text, nullable=False, default=func.datetime('now', 'localtime'))
    started_at = Column(Text)
    completed_at = Column(Text)
    error_message = Column(Text)
    log_file = Column(Text)
    progress_current = Column(Integer, default=0)
    progress_total = Column(Integer, default=0)
    created_by = Column(Text, default='system')