import enum
from typing import List, Optional
from pydantic import BaseModel, Field

class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    HR = "HR"
    ACCOUNTANT = "Accountant"
    EMPLOYEE = "Employee"

class OrderStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    COMPLETED = "Completed"

class AuditAction(str, enum.Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    PAYROLL_GEN = "PAYROLL_GEN"

class AccountingType(str, enum.Enum):
    DEBIT = "Debit"
    CREDIT = "Credit"

class AccountCategory(str, enum.Enum):
    ASSET = "Asset"
    LIABILITY = "Liability"
    INCOME = "Income"
    EXPENSE = "Expense"
    EQUITY = "Equity"

class AuditLog(BaseModel):
    action: str
    target: str # e.g. "Employee", "Transaction"
    target_id: Optional[str] = None
    performed_by: str # User ID or Email
    timestamp: str
    details: Optional[dict] = None
