from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import os
from dotenv import load_dotenv

load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from database import get_database
from models import UserRole, AuditLog
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user, 
    role_required
)
from routers import hr, accounts
from utils import log_event

app = FastAPI(title="ERP Intelligence HQ - Enterprise Edition")
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

# Pydantic models for request/response
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole
    permissions: List[str] = []

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    full_name: str
    role: str
    permissions: List[str] = []

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    permissions: List[str] = []

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
            "full_name": "System Administrator",
            "permissions": ["all"]
        }
        await db.users.insert_one(admin_user)
        print(f"Created default admin: {admin_email}")
    
    # Seed essential accounting heads for payroll integration
    salary_head = await db.chart_of_accounts.find_one({"code": "EXP-SALARY"})
    if not salary_head:
        await db.chart_of_accounts.insert_one({
            "code": "EXP-SALARY",
            "account_name": "Employee Salary Expense",
            "account_type": "Expense",
            "balance": 0.0
        })

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
    
    # Log login event
    await log_event("LOGIN", "User", user["email"], str(user["_id"]))
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user["role"],
        "permissions": user.get("permissions", [])
    }

@app.post("/token", response_model=Token)
async def login_for_swagger(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user["role"],
        "permissions": user.get("permissions", [])
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
        "full_name": data.full_name,
        "permissions": data.permissions
    }
    result = await db.users.insert_one(new_user)
    
    # Audit trail
    await log_event("CREATE", "User", admin["email"], str(result.inserted_id), {"role": data.role})
    
    created_user = await db.users.find_one({"_id": result.inserted_id})
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
    
    # Audit trail
    await log_event("DELETE", "User", admin["email"], user_id)
    
    return {"message": "Account de-provisioned"}

@app.get("/audit-logs")
async def get_audit_logs(admin: dict = Depends(role_required([UserRole.ADMIN]))):
    db = get_database()
    logs = await db.audit_logs.find().sort("timestamp", -1).limit(100).to_list(100)
    for log in logs:
        log["_id"] = str(log["_id"])
    return logs

@app.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = current_user.copy()
    user["_id"] = str(user["_id"])
    return user

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8005))
    uvicorn.run(app, host="0.0.0.0", port=port)
