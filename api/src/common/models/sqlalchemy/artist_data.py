from sqlalchemy import Column, Integer, Text, Boolean
from sqlalchemy.sql import func

from src.common.services.db_service import Base

class ArtistData(Base):
    __tablename__ = 'artist_data'
    
    artist_id = Column(Integer, primary_key=True)
    artist_name = Column(Text, nullable=False)
    other_names = Column(Text)
    post_count = Column(Integer, nullable=False, default=0)
    is_banned = Column(Boolean)
    is_deleted = Column(Boolean)
    created_at = Column(Text, nullable=False, default=func.datetime('now', 'localtime'))
    updated_at = Column(Text, nullable=False, default=func.datetime('now', 'localtime'))