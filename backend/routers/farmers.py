from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.connection import get_db
from models.farmer import Farmer


router = APIRouter()


# =========================
# Farmer Registration
# =========================

class FarmerCreate(BaseModel):
    name: str
    phone: str
    pin: str


@router.get("/farmers")
def get_farmers(db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()

    return [
        {
            "id": farmer.id,
            "full_name": farmer.full_name,
            "phone_number": farmer.phone_number,
            "created_at": farmer.created_at,
        }
        for farmer in farmers
    ]


@router.post("/farmers")
def create_farmer(
    data: FarmerCreate,
    db: Session = Depends(get_db)
):
    existing_farmer = (
        db.query(Farmer)
        .filter(Farmer.phone_number == data.phone)
        .first()
    )

    if existing_farmer:
        raise HTTPException(
            status_code=400,
            detail="Farmer with this phone number already exists"
        )

    farmer = Farmer(
        full_name=data.name,
        phone_number=data.phone,
        password_hash=data.pin,
    )

    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    return {
        "message": "Farmer registered successfully",
        "farmer": {
            "id": farmer.id,
            "full_name": farmer.full_name,
            "phone_number": farmer.phone_number,
        },
    }


# =========================
# Farmer Login
# =========================

class FarmerLogin(BaseModel):
    phone: str
    pin: str


@router.post("/login")
def login_farmer(
    data: FarmerLogin,
    db: Session = Depends(get_db)
):
    farmer = (
        db.query(Farmer)
        .filter(Farmer.phone_number == data.phone)
        .first()
    )

    if not farmer or farmer.password_hash != data.pin:
        raise HTTPException(
            status_code=401,
            detail="Invalid Phone Number or PIN"
        )

    return {
        "message": "Login successful",
        "farmer": {
            "id": farmer.id,
            "full_name": farmer.full_name,
            "phone_number": farmer.phone_number,
        },
    }


# =========================
# Create Booking
# =========================

class BookingCreate(BaseModel):
    farmer_id: int
    slot_id: int


@router.post("/bookings")
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db)
):
    from models.booking import Booking
    from models.slot import Slot

    farmer = (
        db.query(Farmer)
        .filter(Farmer.id == data.farmer_id)
        .first()
    )

    if not farmer:
        raise HTTPException(
            status_code=404,
            detail="Farmer not found"
        )

    slot = (
        db.query(Slot)
        .filter(Slot.id == data.slot_id)
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Slot not found"
        )

    if slot.booked_count >= slot.max_capacity:
        raise HTTPException(
            status_code=400,
            detail="This slot is full"
        )

    unique_token = (
        f"FC-{farmer.id}-{slot.id}-"
        f"{int(datetime.utcnow().timestamp())}"
    )

    booking = Booking(
        farmer_id=farmer.id,
        slot_id=slot.id,
        booking_status="confirmed",
        booking_token=unique_token,
        booked_at=datetime.utcnow(),
    )

    slot.booked_count += 1

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking created successfully",
        "booking": {
            "id": booking.id,
            "farmer_id": booking.farmer_id,
            "slot_id": booking.slot_id,
            "booking_status": booking.booking_status,
            "booking_token": booking.booking_token,
            "booked_at": booking.booked_at,
        },
    }


# =========================
# Get Slots
# =========================

@router.get("/slots")
def get_slots(db: Session = Depends(get_db)):
    from models.slot import Slot

    slots = db.query(Slot).all()

    return [
        {
            "id": slot.id,
            "center_id": slot.center_id,
            "slot_date": slot.slot_date,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "max_capacity": slot.max_capacity,
            "booked_count": slot.booked_count,
            "available": slot.max_capacity - slot.booked_count,
        }
        for slot in slots
    ]


# =========================
# Get All Bookings
# =========================

@router.get("/bookings")
def get_bookings(db: Session = Depends(get_db)):
    from models.booking import Booking

    bookings = db.query(Booking).all()

    return [
        {
            "id": booking.id,
            "farmer_id": booking.farmer_id,
            "slot_id": booking.slot_id,
            "booking_status": booking.booking_status,
            "booking_token": booking.booking_token,
            "booked_at": booking.booked_at,
        }
        for booking in bookings
    ]


# =========================
# Test: Update Slot Date
# =========================

@router.put("/test-slot-date")
def update_test_slot_date(
    db: Session = Depends(get_db)
):
    from models.slot import Slot

    slot = (
        db.query(Slot)
        .filter(Slot.id == 1)
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Slot not found"
        )

    slot.slot_date = date(2026, 9, 20)

    db.commit()
    db.refresh(slot)

    return {
        "message": "Test slot date updated",
        "slot_id": slot.id,
        "slot_date": slot.slot_date,
    }

# =========================
# Update Booking Status
# =========================

class BookingStatusUpdate(BaseModel):
    status: str


@router.put("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: Session = Depends(get_db)
):
    from models.booking import Booking

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    booking.booking_status = data.status

    try:
        db.commit()
        db.refresh(booking)

        return {
            "message": "Booking status updated successfully",
            "booking": {
                "id": booking.id,
                "farmer_id": booking.farmer_id,
                "slot_id": booking.slot_id,
                "booking_status": booking.booking_status,
                "booking_token": booking.booking_token,
                "booked_at": booking.booked_at,
            },
        }

    except Exception as error:
        db.rollback()

        print("STATUS UPDATE ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(error)}"
        )