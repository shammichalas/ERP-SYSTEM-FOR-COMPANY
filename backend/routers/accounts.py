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
    account_type: str # Asset, Liability, Income, Expense, Bank, Equity
    code: str
    balance: float = 0.0

class BankAccount(BaseModel):
    account_name: str
    account_number: str
    ifsc: str
    bank_name: str
    branch: str
    balance: float = 0.0

class TaxRate(BaseModel):
    name: str # e.g. GST 18%
    rate: float # 18
    cgst: float # 9
    sgst: float # 9
    igst: float # 0

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

class Entry(BaseModel):
    account_code: str
    type: str # Debit or Credit
    amount: float

class DoubleEntryTransaction(BaseModel):
    date: str
    description: str
    journal_type: str # Sales, Purchase, Payment, Receipt, Contra, Journal
    entries: List[Entry]
    reference: Optional[str] = None
    # GST mapping
    tax_rate_id: Optional[str] = None
    cgst_amount: float = 0.0
    sgst_amount: float = 0.0
    igst_amount: float = 0.0
    hsn_code: Optional[str] = None
    party_id: Optional[str] = None

# --- Masters ---

@router.post("/masters/chart", response_model=AccountBase)
async def create_account(data: AccountBase, admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    if await db.chart_of_accounts.find_one({"code": data.code}):
        raise HTTPException(status_code=400, detail="Account code already exists")
    await db.chart_of_accounts.insert_one(data.dict())
    return data

@router.put("/masters/chart/{code}")
async def update_account(code: str, data: AccountBase, admin: dict = Depends(role_required([UserRole.ADMIN]))):
    db = get_database()
    update_data = data.dict()
    # Don't allow changing balance manually through master edit if you want to keep integrity, 
    # but for simple correction we allow it here.
    result = await db.chart_of_accounts.update_one({"code": code}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account head updated"}

@router.get("/masters/chart", response_model=List[AccountBase])
async def get_chart(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    cursor = db.chart_of_accounts.find()
    accounts = []
    async for acc in cursor:
        acc["_id"] = str(acc["_id"])
        accounts.append(acc)
    return accounts

# --- Bank & Tax Masters ---

@router.post("/masters/banks")
async def add_bank(data: BankAccount, admin: dict = Depends(role_required([UserRole.ADMIN]))):
    db = get_database()
    await db.bank_accounts.insert_one(data.dict())
    return {"message": "Bank account provisioned"}

@router.get("/masters/banks")
async def get_banks(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    banks = await db.bank_accounts.find().to_list(100)
    for b in banks: b["_id"] = str(b["_id"])
    return banks

@router.post("/masters/taxes")
async def add_tax_rate(data: TaxRate, admin: dict = Depends(role_required([UserRole.ADMIN]))):
    db = get_database()
    await db.tax_masters.insert_one(data.dict())
    return {"message": "Tax rate configured"}

@router.get("/masters/taxes")
async def get_taxes(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    taxes = await db.tax_masters.find().to_list(100)
    for t in taxes: t["_id"] = str(t["_id"])
    return taxes

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
            if "entries" in t and isinstance(t["entries"], list):
                # We count standard debits as the expense actuals for budget tracking
                actual += sum(e.get("amount", 0) for e in t["entries"] if e.get("type") == "Debit")
            else:
                actual += t.get("amount", 0)
        
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

# --- Transactions (Double Entry) ---

@router.post("/transactions")
async def add_transaction(data: DoubleEntryTransaction, admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    
    # 1. Double-Entry Validation
    total_debit = sum(e.amount for e in data.entries if e.type == "Debit")
    total_credit = sum(e.amount for e in data.entries if e.type == "Credit")
    
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(status_code=400, detail=f"Entry unbalanced: Debit({total_debit}) != Credit({total_credit})")
    
    transaction = data.dict()
    transaction["created_at"] = datetime.now().isoformat()
    result = await db.account_transactions.insert_one(transaction)
    
    # 2. Sequential Ledger Posting
    for entry in data.entries:
        acc = await db.chart_of_accounts.find_one({"code": entry.account_code})
        if not acc:
            continue
            
        # Logic: Assets/Expenses increase on Debit. Income/Liabilities increase on Credit.
        if acc["account_type"] in ["Asset", "Expense", "Bank"]:
            adj = entry.amount if entry.type == "Debit" else -entry.amount
        else:
            adj = entry.amount if entry.type == "Credit" else -entry.amount
            
        await db.chart_of_accounts.update_one(
            {"code": entry.account_code},
            {"$inc": {"balance": adj}}
        )
    
    # Audit logic
    return {"message": "Transaction recorded via Double-Entry protocol", "id": str(result.inserted_id)}

@router.get("/transactions")
async def get_transactions(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    cursor = db.account_transactions.find().sort("date", -1)
    txns = []
    async for t in cursor:
        t["_id"] = str(t["_id"])
        txns.append(t)
    return txns

@router.put("/transactions/{id}")
async def update_transaction(id: str, data: DoubleEntryTransaction, admin: dict = Depends(role_required([UserRole.ADMIN]))):
    db = get_database()
    # ... logic already there but I want to make sure the routing is clean
    
    # 1. Validation
    total_debit = sum(e.amount for e in data.entries if e.type == "Debit")
    total_credit = sum(e.amount for e in data.entries if e.type == "Credit")
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(status_code=400, detail="Entry unbalanced")
    
    # 2. Get Old Transaction to Revert
    old_txn = await db.account_transactions.find_one({"_id": ObjectId(id)})
    if not old_txn: raise HTTPException(status_code=404, detail="Transaction not found")
    
    # 3. REVERT OLD BALANCES
    for entry in old_txn.get("entries", []):
        acc = await db.chart_of_accounts.find_one({"code": entry["account_code"]})
        if acc:
            factor = -1 if entry["type"] == "Debit" else 1
            if acc["account_type"] not in ["Asset", "Expense", "Bank"]: factor *= -1
            await db.chart_of_accounts.update_one({"code": entry["account_code"]}, {"$inc": {"balance": factor * entry["amount"]}})
    
    # 4. APPLY NEW BALANCES
    for entry in data.entries:
        acc = await db.chart_of_accounts.find_one({"code": entry.account_code})
        if acc:
            factor = 1 if entry.type == "Debit" else -1
            if acc["account_type"] not in ["Asset", "Expense", "Bank"]: factor *= -1
            await db.chart_of_accounts.update_one({"code": entry.account_code}, {"$inc": {"balance": factor * entry.amount}})
            
    await db.account_transactions.update_one({"_id": ObjectId(id)}, {"$set": data.dict()})
    return {"message": "Transaction corrected and ledgers updated"}

# --- Reports & GST ---

@router.get("/reports/trial-balance")
async def get_trial_balance(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    accounts = await db.chart_of_accounts.find().to_list(100)
    results = []
    for acc in accounts:
        # Aggregate logic for real-time validation
        pipeline = [
            {"$match": {"entries.account_code": acc["code"]}},
            {"$unwind": "$entries"},
            {"$match": {"entries.account_code": acc["code"]}},
            {"$group": {"_id": "$entries.type", "total": {"$sum": "$entries.amount"}}}
        ]
        aggregates = await db.account_transactions.aggregate(pipeline).to_list(5)
        debit = next((i["total"] for i in aggregates if i["_id"] == "Debit"), 0)
        credit = next((i["total"] for i in aggregates if i["_id"] == "Credit"), 0)
        results.append({
            "code": acc["code"],
            "name": acc["account_name"],
            "debit": debit,
            "credit": credit,
            "net": acc["balance"]
        })
    return results

@router.get("/reports/pnl")
async def get_pnl(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    income = await db.chart_of_accounts.find({"account_type": "Income"}).to_list(100)
    expenses = await db.chart_of_accounts.find({"account_type": "Expense"}).to_list(100)
    
    # Sanitize for JSON
    for i in income: i["_id"] = str(i["_id"])
    for e in expenses: e["_id"] = str(e["_id"])
    
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
    
    for a in assets: a["_id"] = str(a["_id"])
    for l in liabilities: l["_id"] = str(l["_id"])
    
    return {"assets": assets, "liabilities": liabilities}

@router.get("/reports/gst-filings")
async def get_gst_filings(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    # Multi-Point Tax Tracking
    txns = await db.account_transactions.find({
        "$or": [{"cgst_amount": {"$gt": 0}}, {"sgst_amount": {"$gt": 0}}, {"igst_amount": {"$gt": 0}}]
    }).to_list(1000)
    
    outward = [t for t in txns if t.get("journal_type") == "Sales" or t.get("type") == "Sales"]
    inward = [t for t in txns if t.get("journal_type") == "Purchase" or t.get("type") == "Purchase"]
    
    return {
        "gstr1_summary": {
            "cgst": sum(t.get("cgst_amount", 0) for t in outward),
            "sgst": sum(t.get("sgst_amount", 0) for t in outward),
            "igst": sum(t.get("igst_amount", 0) for t in outward)
        },
        "itc_summary": {
            "cgst_claimable": sum(t.get("cgst_amount", 0) for t in inward),
            "sgst_claimable": sum(t.get("sgst_amount", 0) for t in inward),
            "igst_claimable": sum(t.get("igst_amount", 0) for t in inward)
        }
    }

@router.get("/reports/hsn-summary")
async def get_hsn_summary(admin: dict = Depends(role_required([UserRole.ACCOUNTANT, UserRole.ADMIN]))):
    db = get_database()
    pipeline = [
        {"$match": {"hsn_code": {"$ne": None, "$ne": ""}}},
        {"$group": {
            "_id": "$hsn_code", 
            "total_count": {"$sum": 1},
            "cgst": {"$sum": {"$ifNull": ["$cgst_amount", 0]}},
            "sgst": {"$sum": {"$ifNull": ["$sgst_amount", 0]}},
            "igst": {"$sum": {"$ifNull": ["$igst_amount", 0]}}
        }}
    ]
    return await db.account_transactions.aggregate(pipeline).to_list(100)

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
