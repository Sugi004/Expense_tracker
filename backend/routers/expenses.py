from types import NoneType
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from typing import Optional
from datetime import datetime
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.get("/", response_model=list[schemas.ExpenseResponse])
async def get_expenses(db: AsyncSession = Depends(get_db), 
current_user: models.User = Depends(get_current_user),
month: Optional[int] = None,
year: Optional[int] = None,
category_id: Optional[int] = None):
    query = select(models.Expense).where(models.Expense.user_id == current_user.id)
    if month:
        query = query.where(models.Expense.date.month == month)
    if year:
        query = query.where(models.Expense.date.year == year)
    if category_id:
        query = query.where(models.Expense.category_id == category_id)

    query = query.order_by(models.Expense.date.desc())
    result = await db.execute(query)
    expenses = result.scalars().all()
    return expenses

#  Get single expense

@router.get("/{expense_id}", response_model=schemas.ExpenseResponse)
async def get_expense(expense_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = select(models.Expense).where(models.Expense.id == expense_id, models.Expense.user_id == current_user.id)
    result = await db.execute(query)
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return expense


#  Create expense

@router.post("/", response_model=schemas.ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(expense_data: schemas.ExpenseCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
#    Verify category exists
    query = select(models.Category).where(models.Category.id == expense_data.category_id)
    result = await db.execute(query)
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    new_expense = models.Expense(title=expense_data.title, amount=expense_data.amount, date=expense_data.date, category_id=expense_data.category_id, user_id=current_user.id)
    db.add(new_expense)
    await db.commit()
    await db.refresh(new_expense)
    return new_expense
    
# update expense
@router.put("/{expense_id}", response_model=schemas.ExpenseResponse)
async def update_expense(expense_id: int, expense_data: schemas.ExpenseUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = select(models.Expense).where(models.Expense.id == expense_id, models.Expense.user_id == current_user.id)
    result = await db.execute(query)
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    
    for field, value in expense_data.model_dump(exclude_unset=True).items():
        if field == "date" and value is not None and hasattr(value, "tzinfo") and value.tzinfo is None:
            value = value.replace(tzinfo=None)
        setattr(expense, field, value)
    await db.commit()
    await db.refresh(expense)
    return expense

#  Delete expense
@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(expense_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = select(models.Expense).where(models.Expense.id == expense_id, models.Expense.user_id == current_user.id)
    result = await db.execute(query)
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    await db.delete(expense)
    await db.commit()
    return