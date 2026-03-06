from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from typing import Optional
from datetime import datetime
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.get("/", response_model=list[schemas.BudgetResponse])
async def get_budgets(db: AsyncSession = Depends(get_db), 
current_user: models.User = Depends(get_current_user),
month: Optional[int] = None,
year: Optional[int] = None):
    query = select(models.Budget).where(models.Budget.user_id == current_user.id)
    if month:
        query = query.where(models.Budget.month == month)
    if year:
        query = query.where(models.Budget.year == year)
    result = await db.execute(query)
    budgets = result.scalars().all()
    return budgets

# Get single budget
@router.get("/{budget_id}", response_model=schemas.BudgetResponse)
async def get_budget(budget_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = select(models.Budget).where(models.Budget.id == budget_id, models.Budget.user_id == current_user.id)
    result = await db.execute(query)
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return budget

# Create budget
@router.post("/", response_model=schemas.BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(budget_data: schemas.BudgetCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):

    # Verify category exists
    query = select(models.Category).where(models.Category.id == budget_data.category_id)
    result = await db.execute(query)
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # check if budget already exists for the month and year
    query = select(models.Budget).where(models.Budget.user_id == current_user.id, models.Budget.category_id == budget_data.category_id, models.Budget.month == budget_data.month, models.Budget.year == budget_data.year)
    result = await db.execute(query)
    existing_budget = result.scalar_one_or_none()
    if existing_budget:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Budget already exists for this month and year")
    
    new_budget = models.Budget(amount=budget_data.amount, month=budget_data.month, year=budget_data.year,category_id=budget_data.category_id, user_id=current_user.id)
    db.add(new_budget)
    await db.commit()
    await db.refresh(new_budget)
    return new_budget

# Update budget
@router.put("/{budget_id}", response_model=schemas.BudgetResponse)
async def update_budget(budget_id: int, budget_data: schemas.BudgetUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = select(models.Budget).where(models.Budget.id == budget_id, models.Budget.user_id == current_user.id)
    result = await db.execute(query)
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    for field, value in budget_data.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)
    await db.commit()
    await db.refresh(budget)
    return budget

# Delete budget
@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(budget_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = select(models.Budget).where(models.Budget.id == budget_id, models.Budget.user_id == current_user.id)
    result = await db.execute(query)
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    await db.delete(budget)
    await db.commit()
    return