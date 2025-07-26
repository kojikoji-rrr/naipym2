from sqlalchemy import Column, Integer, Text
from sqlalchemy.sql import func

from src.common.services.db_service import Base, now

class CharacterData(Base):
    __tablename__ = 'character_data'
    
    seq = Column(Integer, primary_key=True, autoincrement=True)
    prompt = Column(Text)
    negpip = Column(Text)
    created_at = Column(Text, nullable=False, default=now())