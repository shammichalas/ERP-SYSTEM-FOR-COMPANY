from fastapi import FastAPI, Depends, HTTPException, status
import os
from dotenv import load_dotenv

load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from bson import ObjectId

from database import get_database
from models import UserRole
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user, 
    role_required
)
from routers import hr, accounts

app = FastAPI(title="ERP Management System API (MongoDB)")
app.include_router(hr.router)
app.include_router(accounts.router)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper for MongoDB ObjectId
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

# Pydantic models for request/response
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    full_name: str
    role: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@app.on_event("startup")
async def startup_event():
    db = get_database()
    # Create default admin if not exists
    admin_email = "admin@system.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        hashed_password = get_password_hash("admin123")
        admin_user = {
            "email": admin_email,
            "hashed_password": hashed_password,
            "role": UserRole.ADMIN,
            "full_name": "System Administrator"
        }
        await db.users.insert_one(admin_user)
        print(f"Created default admin: {admin_email}")

@app.post("/login", response_model=Token)
async def login(request: LoginRequest):
    db = get_database()
    user = await db.users.find_one({"email": request.email})
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user["role"]
    }

@app.post("/create-user", response_model=UserResponse)
async def create_user(
    data: UserCreate, 
    admin: dict = Depends(role_required([UserRole.ADMIN]))
):
    db = get_database()
    existing_user = await db.users.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(data.password)
    new_user = {
        "email": data.email,
        "hashed_password": hashed_password,
        "role": data.role,
        "full_name": data.full_name
    }
    result = await db.users.insert_one(new_user)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    # Convert ObjectId to string for Pydantic
    created_user["_id"] = str(created_user["_id"])
    return created_user

@app.get("/users", response_model=List[UserResponse])
async def get_users(
    admin: dict = Depends(role_required([UserRole.ADMIN]))
):
    db = get_database()
    users_cursor = db.users.find()
    users = []
    async for user in users_cursor:
        user["_id"] = str(user["_id"])
        users.append(user)
    return users

@app.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: dict = Depends(role_required([UserRole.ADMIN]))
):
    db = get_database()
    if str(admin["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="Administrative protection: Cannot delete own account")
    
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Identity not found")
    return {"message": "Account de-provisioned"}

@app.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = current_user.copy()
    user["_id"] = str(user["_id"])
    return user

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8005))
    uvicorn.run(app, host="0.0.0.0", port=port)
