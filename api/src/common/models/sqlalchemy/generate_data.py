from sqlalchemy import Column, Integer, Text, Boolean
from sqlalchemy.sql import func

from src.common.services.db_service import Base

class GenerateData(Base):
    __tablename__ = 'generate_data'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    model = Column(Text, nullable=False)
    prompt = Column(Text)
    negpip = Column(Text)
    char_prompt = Column(Text)
    image_path = Column(Text)
    image_name = Column(Text)
    created_at = Column(Text, nullable=False, default=func.datetime('now', 'localtime'))
    is_delete = Column(Boolean, default=0)