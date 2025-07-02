from sqlalchemy import Column, Integer, Text, Boolean
from sqlalchemy.sql import func

from src.common.services.db_service import Base

class TagsRelation(Base):
    __tablename__ = 'tags_relation'
    
    tag_id = Column(Integer, primary_key=True)
    rep_tag_id = Column(Integer, primary_key=True)
    created_at = Column(Text, nullable=False, default=func.datetime('now', 'localtime'))
    is_delete = Column(Boolean, nullable=False, default=0)