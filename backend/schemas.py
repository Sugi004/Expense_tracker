from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# USER SCHEMA
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    profile_picture: Optional[str] = None

    def model_post_init(self, __context):
        if self.date_of_birth is not None and self.date_of_birth.tzinfo is not None:
            self.date_of_birth = self.date_of_birth.replace(tzinfo= None)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    profile_picture: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    profile_picture: Optional[str] = None

    def model_post_init(self, __context):
        if self.date_of_birth is not None and self.date_of_birth.tzinfo is not None:
            self.date_of_birth = self.date_of_birth.replace(tzinfo= None)

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class DeleteUser(BaseModel):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# CATEGORY SCHEMA
class CategoryCreate(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    id: int
    name: str
    user_id: Optional[int] = None

    class Config:
        from_attributes = True

# EXPENSE SCHEMA
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category_id: int
    date: Optional[datetime] = None
    note: Optional[str] = None


    def model_post_init(self, __context):
        if self.date is not None and self.date.tzinfo is not None:
            self.date = self.date.replace(tzinfo= None)

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category_id: Optional[int] = None
    date: Optional[datetime] = None
    note: Optional[str] = None

    model_config = {"arbitrary_types_allowed": True}

    def model_post_init(self, __context):
        if self.date is not None and self.date.tzinfo is not None:
            self.date = self.date.replace(tzinfo= None)

class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category_id: int
    date: datetime
    note: Optional[str] = None
    

    class Config:
        from_attributes = True

# BUDGET SCHEMA

class BudgetCreate(BaseModel):
    amount: float
    month: int
    year: int
    category_id: int
    
class BudgetUpdate(BaseModel):
    amount: Optional[float] = None
    month: Optional[int] = None
    year: Optional[int] = None
    category_id: Optional[int] = None

class BudgetResponse(BaseModel):
    id: int
    amount: float
    month: int
    year: int
    category_id: int

    class Config:
        from_attributes = True

# DASHBOARD SCHEMA

class CategorySummary(BaseModel):
    category: str
    spent: float
    budget: Optional[float] = None

class DashboardResponse(BaseModel):
    category_summary: list[CategorySummary]
    total_spent: float
    recent_expenses: list[ExpenseResponse]

