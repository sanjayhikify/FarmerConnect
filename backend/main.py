from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

from routers.farmers import router as farmers_router


app = FastAPI(title="FarmerConnect API")


# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# PostgreSQL farmers API
app.include_router(farmers_router)


class Procurement(BaseModel):
    farmerId: str
    procurementId: str
    crop: str
    quantity: int
    pricePerKg: int
    centreId: str


@app.get("/")
def home():
    return {
        "message": "Farmer Procurement Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/procurement")
def create_procurement(data: Procurement):

    blockchain_response = requests.post(
        "http://127.0.0.1:3001/record-procurement",
        json=data.model_dump()
    )

    blockchain_data = blockchain_response.json()

    return {
        "message": "Procurement recorded successfully",
        "procurement": data,
        "blockchain": blockchain_data
    }


@app.get("/procurement/{procurementId}")
def get_procurement(procurementId: str):

    blockchain_response = requests.get(
        f"http://127.0.0.1:3001/procurement/{procurementId}"
    )

    blockchain_data = blockchain_response.json()

    procurement = blockchain_data.get("procurement", {})

    if not procurement.get("procurementId"):
        raise HTTPException(
            status_code=404,
            detail=f"Procurement ID '{procurementId}' not found"
        )

    return {
        "message": "Procurement retrieved successfully",
        "blockchain": blockchain_data
    }