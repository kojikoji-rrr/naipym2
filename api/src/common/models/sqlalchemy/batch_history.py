from sqlalchemy import Column, Integer, Text
from sqlalchemy.sql import func

from src.common.services.db_service import Base

class BatchHistory(Base):
    __tablename__ = 'batch_history'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Text, nullable=False)
    event_type = Column(Text, nullable=False)
    event_message = Column(Text)
    event_data = Column(Text)
    created_at = Column(Text, nullable=False, default=func.datetime('now', 'localtime'))