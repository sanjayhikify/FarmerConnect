from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from database.connection import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer)
    slot_id = Column(Integer)
    booking_status = Column(String)
    booking_token = Column(String)
    booked_at = Column(DateTime, default=datetime.utcnow)