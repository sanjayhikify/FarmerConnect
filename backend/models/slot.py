from sqlalchemy import Column, Integer, Date, Time, DateTime
from database.connection import Base


class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(Integer)
    slot_date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    max_capacity = Column(Integer)
    booked_count = Column(Integer)
    created_at = Column(DateTime)