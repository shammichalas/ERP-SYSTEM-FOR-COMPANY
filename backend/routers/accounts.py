from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field

from database import get_database
from models import UserRole
from auth import role_required

router = APIRouter(prefix="/accounts", tags=["Accountant Module"])

# --- Models ---

class AccountBase(BaseModel):
    account_name: str
    account_type: str # Asset, Liability, Income, Expense, Bank
    code: str
    balance: float = 0.0

class PartyBase(BaseModel):
    name: str
    type: str # Customer, Vendor
    gstin: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    outstanding: float = 0.0

class PartyResponse(PartyBase):
    id: str = Field(alias="_id")
    class Config:
        populate_by_name = True

class TransactionBase(BaseModel):
    date: str
    description: str
    amount: float
    type: str # Debit, Credit, Sales, Purchase, Payment, Receipt
    account_code: str
    party_id: Optional[str] = None # Link to Customer/Vendor
    reference: Optional[str] = None # Invoice #, Bill #
    gst_amount: float = 0.0

# --- Masters ---

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

@router.post("/masters/parties", response_model=PartyResponse)
async def create_party(data: PartyBase, admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    result = await db.parties.insert_one(data.dict())
    created = await db.parties.find_one({"_id": result.inserted_id})
    created["_id"] = str(created["_id"])
    return created

@router.get("/masters/parties", response_model=List[PartyResponse])
async def get_parties(party_type: Optional[str] = None, admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    query = {"type": party_type} if party_type else {}
    cursor = db.parties.find(query)
    parties = []
    async for p in cursor:
        p["_id"] = str(p["_id"])
        parties.append(p)
    return parties

# --- Transactions ---

@router.post("/transactions")
async def add_transaction(data: TransactionBase, admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    transaction = data.dict()
    transaction["created_at"] = datetime.now().isoformat()
    await db.account_transactions.insert_one(transaction)
    
    # Simple Ledger Logic
    # 1. Update Chart of Accounts balance
    # Credits increase Income/Liability, decrease Asset/Expense
    # Debits increase Asset/Expense, decrease Income/Liability
    # For now, we use a simple Credit (+) / Debit (-) approach for generic accounts
    adjustment = data.amount if data.type in ["Credit", "Sales", "Receipt"] else -data.amount
    await db.chart_of_accounts.update_one(
        {"code": data.account_code},
        {"$inc": {"balance": adjustment}}
    )
    
    # 2. Update Party Outstanding if applicable
    if data.party_id:
        party_adj = data.amount if data.type in ["Sales", "Payment"] else -data.amount
        await db.parties.update_one(
            {"_id": ObjectId(data.party_id)},
            {"$inc": {"outstanding": party_adj}}
        )
        
    return {"message": "Transaction recorded and ledgers updated"}

@router.get("/transactions")
async def get_transactions(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    cursor = db.account_transactions.find().sort("date", -1)
    txns = []
    async for t in cursor:
        t["_id"] = str(t["_id"])
        txns.append(t)
    return txns

# --- Reports & GST ---

@router.get("/reports/balance-sheet")
async def get_balance_sheet(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    assets = await db.chart_of_accounts.find({"account_type": "Asset"}).to_list(100)
    liabilities = await db.chart_of_accounts.find({"account_type": "Liability"}).to_list(100)
    return {"assets": assets, "liabilities": liabilities}

@router.get("/reports/pnl")
async def get_pnl(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    income = await db.chart_of_accounts.find({"account_type": "Income"}).to_list(100)
    expenses = await db.chart_of_accounts.find({"account_type": "Expense"}).to_list(100)
    return {"income": income, "expenses": expenses}

@router.get("/reports/gst-summary")
async def get_gst_summary(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    cursor = db.account_transactions.find({"gst_amount": {"$gt": 0}})
    total_gst = 0
    async for t in cursor:
        total_gst += t.get("gst_amount", 0)
    return {"total_collected_gst": total_gst}

# Integration
@router.post("/integrate/payroll")
async def link_payroll_to_accounts(payload: dict, admin: dict = Depends(role_required([UserRole.ADMIN]))):
    db = get_database()
    transaction = {
        "date": datetime.now().isoformat(),
        "description": f"Payroll: {payload.get('employee_id')}",
        "amount": payload.get("amount"),
        "type": "Debit",
        "account_code": "EXP-SALARY",
        "created_at": datetime.now().isoformat(),
        "gst_amount": 0
    }
    await db.account_transactions.insert_one(transaction)
    return {"status": "success"}
