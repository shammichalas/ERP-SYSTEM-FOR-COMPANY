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
    type: str # Debit, Credit, Sales, Purchase, Payment, Receipt, Credit Note, Debit Note
    account_code: str
    party_id: Optional[str] = None # Link to Customer/Vendor
    reference: Optional[str] = None # Invoice #, Bill #
    gst_amount: float = 0.0
    hsn_code: Optional[str] = None
    itc_eligible: bool = False

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

class BudgetBase(BaseModel):
    department_name: str
    amount: float
    period: str # Month-Year e.g., April-2026
    category: str # Hiring, Tech, Operations, Marketing

@router.post("/budgets")
async def create_budget(data: BudgetBase, admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    await db.budgets.insert_one(data.dict())
    return {"message": "Budget allocation saved"}

@router.get("/budgets")
async def get_budgets(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    cursor = db.budgets.find()
    budgets = []
    async for b in cursor:
        b["_id"] = str(b["_id"])
        budgets.append(b)
    return budgets

@router.get("/reports/budget-comparison")
async def budget_vs_actual(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    # 1. Get all budgets
    budgets = await db.budgets.find().to_list(100)
    
    # 2. Match with actual expenses from transactions
    # Simplified: We match by 'category' (description keyword for now)
    results = []
    for b in budgets:
        # Sum transactions where description contains category name or matching period
        cursor = db.account_transactions.find({"description": {"$regex": b["category"], "$options": "i"}})
        actual = 0
        async for t in cursor:
            actual += t["amount"]
        
        results.append({
            "department": b["department_name"],
            "category": b["category"],
            "budgeted": b["amount"],
            "actual": actual,
            "variance": b["amount"] - actual
        })
    return results

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

@router.get("/reports/trial-balance")
async def get_trial_balance(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    return await db.chart_of_accounts.find().to_list(100)

@router.get("/reports/pnl")
async def get_pnl(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    income = await db.chart_of_accounts.find({"account_type": "Income"}).to_list(100)
    expenses = await db.chart_of_accounts.find({"account_type": "Expense"}).to_list(100)
    
    total_income = sum(a["balance"] for a in income)
    total_expense = sum(a["balance"] for a in expenses)
    
    return {
        "income_heads": income,
        "expense_heads": expenses,
        "net_profit": total_income - total_expense
    }

@router.get("/reports/balance-sheet")
async def get_balance_sheet(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    assets = await db.chart_of_accounts.find({"account_type": "Asset"}).to_list(100)
    liabilities = await db.chart_of_accounts.find({"account_type": "Liability"}).to_list(100)
    return {"assets": assets, "liabilities": liabilities}

@router.get("/reports/gst-filings")
async def get_gst_filings(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    # GSTR-1: Sales transactions
    sales = await db.account_transactions.find({"type": "Sales"}).to_list(100)
    # GSTR-3B summary
    purchases = await db.account_transactions.find({"type": "Purchase"}).to_list(100)
    
    total_output_tax = sum(s.get("gst_amount", 0) for s in sales)
    total_itc = sum(p.get("gst_amount", 0) for p in purchases if p.get("itc_eligible"))
    
    return {
        "gstr1": sales,
        "gstr3b_summary": {
            "output_tax": total_output_tax,
            "itc_available": total_itc,
            "net_payable": max(0, total_output_tax - total_itc)
        }
    }

@router.get("/reports/hsn-summary")
async def get_hsn_summary(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    pipeline = [
        {"$match": {"hsn_code": {"$ne": None}}},
        {"$group": {"_id": "$hsn_code", "total_value": {"$sum": "$amount"}, "total_gst": {"$sum": "$gst_amount"}}}
    ]
    cursor = db.account_transactions.aggregate(pipeline)
    return await cursor.to_list(100)

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
