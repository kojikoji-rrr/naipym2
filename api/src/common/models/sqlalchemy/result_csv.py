from sqlalchemy import Column, Integer, Text, Boolean

from src.common.services.db_service import Base

class ResultCsv(Base):
    __tablename__ = 'result_csv'
    
    artist_id = Column(Integer)
    isBanned = Column(Boolean)
    isDeleted = Column(Boolean)
    url = Column(Text)
    source = Column(Text)
    name_org = Column(Text)
    name_nai = Column(Text)
    post_count = Column(Integer)
    image_org = Column(Text)
    image_nai = Column(Text)
    name_others = Column(Text)