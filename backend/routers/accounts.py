from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field

from database import get_database
from models import UserRole
from auth import role_required

router = APIRouter(prefix="/accounts", tags=["Accountant Module"])

class AccountBase(BaseModel):
    account_name: str
    account_type: str # Income, Expense, Asset, Liability
    code: str
    balance: float = 0.0

class TransactionBase(BaseModel):
    date: str
    description: str
    amount: float
    type: str # Debit, Credit
    account_code: str
    reference: Optional[str] = None

@router.post("/masters/chart", response_model=AccountBase)
async def create_account(data: AccountBase, admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    if await db.chart_of_accounts.find_one({"code": data.code}):
        raise HTTPException(status_code=400, detail="Account code already exists")
    await db.chart_of_accounts.insert_one(data.dict())
    return data

@router.get("/masters/chart", response_model=List[AccountBase])
async def get_chart(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    cursor = db.chart_of_accounts.find()
    accounts = []
    async for acc in cursor:
        accounts.append(acc)
    return accounts

@router.post("/transactions")
async def add_transaction(data: TransactionBase, admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    transaction = data.dict()
    transaction["created_at"] = datetime.now().isoformat()
    await db.transactions.insert_one(transaction)
    
    # Update account balance
    adjustment = data.amount if data.type == "Credit" else -data.amount
    await db.chart_of_accounts.update_one(
        {"code": data.account_code},
        {"$inc": {"balance": adjustment}}
    )
    return {"message": "Transaction recorded"}

# Integration API (Payroll -> Accounts)
@router.post("/integrate/payroll")
async def link_payroll_to_accounts(payload: dict, admin: dict = Depends(role_required([UserRole.ADMIN]))):
    db = get_database()
    # Salary Expense logic
    transaction = {
        "date": datetime.now().isoformat(),
        "description": f"Monthly Salary for {payload.get('employee_id')}",
        "amount": payload.get("amount"),
        "type": "Debit",
        "account_code": "EXP-SALARY", # Predefined code
        "created_at": datetime.now().isoformat()
    }
    await db.transactions.insert_one(transaction)
    return {"status": "success", "message": "Payroll expense recorded in accounts"}
