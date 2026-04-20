from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field

from database import get_database
from models import UserRole
from auth import role_required, get_current_user

router = APIRouter(prefix="/hr", tags=["HR Module"])

# Pydantic Models for HR
class EmployeeBase(BaseModel):
    full_name: str
    email: str
    employee_id: str
    department: str
    designation: str
    joining_date: str
    status: str = "Active"
    salary: float

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: str = Field(alias="_id")
    class Config:
        populate_by_name = True

class LeaveRequest(BaseModel):
    employee_id: str
    type: str # Sick, Casual, Annual
    start_date: str
    end_date: str
    reason: str
    status: str = "Pending"

class LeaveResponse(LeaveRequest):
    id: str = Field(alias="_id")
    applied_on: str
    class Config:
        populate_by_name = True

# 1. Employee Management
@router.post("/employees", response_model=EmployeeResponse)
async def add_employee(data: EmployeeCreate, admin: dict = Depends(role_required([UserRole.HR, UserRole.ADMIN]))):
    db = get_database()
    # Check if employee_id exists
    if await db.employees.find_one({"employee_id": data.employee_id}):
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    
    new_emp = data.dict()
    result = await db.employees.insert_one(new_emp)
    created = await db.employees.find_one({"_id": result.inserted_id})
    created["_id"] = str(created["_id"])
    return created

@router.get("/employees", response_model=List[EmployeeResponse])
async def get_employees(admin: dict = Depends(role_required([UserRole.HR, UserRole.ADMIN]))):
    db = get_database()
    cursor = db.employees.find()
    emps = []
    async for emp in cursor:
        emp["_id"] = str(emp["_id"])
        emps.append(emp)
    return emps

# 2. Leave Management
@router.post("/leaves", response_model=LeaveResponse)
async def apply_leave(data: LeaveRequest, user: dict = Depends(get_current_user)):
    db = get_database()
    leave_data = data.dict()
    leave_data["applied_on"] = datetime.now().isoformat()
    result = await db.leaves.insert_one(leave_data)
    created = await db.leaves.find_one({"_id": result.inserted_id})
    created["_id"] = str(created["_id"])
    return created

@router.get("/leaves", response_model=List[LeaveResponse])
async def get_all_leaves(admin: dict = Depends(role_required([UserRole.HR, UserRole.ADMIN]))):
    db = get_database()
    cursor = db.leaves.find()
    leaves = []
    async for l in cursor:
        l["_id"] = str(l["_id"])
        leaves.append(l)
    return leaves

@router.patch("/leaves/{leave_id}")
async def update_leave_status(leave_id: str, status: str, admin: dict = Depends(role_required([UserRole.HR, UserRole.ADMIN]))):
    db = get_database()
    result = await db.leaves.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return {"message": f"Leave {status}"}

# 3. Payroll (Basic Logic)
@router.post("/payroll/generate")
async def generate_payroll(month: str, admin: dict = Depends(role_required([UserRole.HR, UserRole.ADMIN]))):
    db = get_database()
    # Fetch all active employees
    cursor = db.employees.find({"status": "Active"})
    count = 0
    async for emp in cursor:
        # Simple payroll logic: create a payslip entry
        payslip = {
            "employee_id": emp["employee_id"],
            "employee_name": emp["full_name"],
            "month": month,
            "base_salary": emp["salary"],
            "generated_at": datetime.now().isoformat(),
            "status": "Generated"
        }
        await db.payslips.insert_one(payslip)
        count += 1
    return {"message": f"Payroll generated for {count} employees"}

@router.get("/payslips/{employee_id}")
async def get_employee_payslips(employee_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.payslips.find({"employee_id": employee_id})
    payslips = []
    async for p in cursor:
        p["_id"] = str(p["_id"])
        payslips.append(p)
    return payslips
