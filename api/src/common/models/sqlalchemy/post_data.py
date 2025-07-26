from sqlalchemy import Column, Integer, Text, Boolean
from sqlalchemy.sql import func

from src.common.services.db_service import Base, now

class PostData(Base):
    __tablename__ = 'post_data'
    
    url = Column(Text, primary_key=True)
    domain = Column(Text, nullable=False)
    id = Column(Text, nullable=False)
    rating = Column(Text)
    score = Column(Text)
    upload_date = Column(Text)
    created_at = Column(Text, nullable=False, default=now())
    updated_at = Column(Text, nullable=False, default=now())
    is_delete = Column(Boolean, default=0)
    last_fetched_at = Column(Text)