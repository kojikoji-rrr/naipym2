from sqlalchemy import Column, Integer, Text
from sqlalchemy.sql import func

from src.common.services.db_service import Base, now

class PostTagRelation(Base):
    __tablename__ = 'post_tag_relation'
    
    url = Column(Text, primary_key=True)
    tag = Column(Text, primary_key=True)
    is_depricated = Column(Integer, default=0)
    created_at = Column(Text, nullable=False, default=now())
    updated_at = Column(Text, nullable=False, default=now())
    is_delete = Column(Integer, nullable=False, default=0)