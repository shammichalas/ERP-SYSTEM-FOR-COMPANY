import enum

class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    HR = "HR"
    ACCOUNTANT = "Accountant"
    EMPLOYEE = "Employee"
