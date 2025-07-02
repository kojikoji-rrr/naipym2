from sqlalchemy import Column, Integer

from src.common.services.db_service import Base

class ArtistGenerateRelation(Base):
    __tablename__ = 'artist_generate_relation'
    
    artist_id = Column(Integer, primary_key=True)
    generate_id = Column(Integer, primary_key=True)