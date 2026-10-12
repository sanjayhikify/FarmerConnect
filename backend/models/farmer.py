from sqlalchemy import Column, Integer, String, DateTime
from database.connection import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    phone_number = Column(String)
    password_hash = Column(String)
    created_at = Column(DateTime)