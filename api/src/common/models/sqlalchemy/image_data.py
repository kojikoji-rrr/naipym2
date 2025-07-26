from sqlalchemy import Column, Integer, Text
from sqlalchemy.sql import func

from src.common.services.db_service import Base, now

class ImageData(Base):
    __tablename__ = 'image_data'
    
    url = Column(Text, primary_key=True)
    image_url = Column(Text)
    source_url = Column(Text)
    width = Column(Integer)
    height = Column(Integer)
    image_path = Column(Text)
    image_name = Column(Text)
    download_at = Column(Text, nullable=False, default=now())