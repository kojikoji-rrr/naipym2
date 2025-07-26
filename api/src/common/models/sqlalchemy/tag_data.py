from sqlalchemy import Column, Integer, Text, Boolean
from sqlalchemy.sql import func

from src.common.services.db_service import Base, now

class TagData(Base):
    __tablename__ = 'tag_data'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tag = Column(Text, nullable=False)
    domain = Column(Text, nullable=False)
    type = Column(Text, nullable=False)
    created_at = Column(Text, nullable=False, default=now())
    updated_at = Column(Text, nullable=False, default=now())
    is_delete = Column(Boolean, default=0)