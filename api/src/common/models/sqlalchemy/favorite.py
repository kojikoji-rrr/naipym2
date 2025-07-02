from sqlalchemy import Column, Integer, Text, Boolean

from src.common.services.db_service import Base

class Favorite(Base):
    __tablename__ = 'favorite'
    
    artist_id = Column(Integer, primary_key=True)
    favorite = Column(Boolean)
    memo = Column(Text)