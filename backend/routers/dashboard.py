from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from database import get_db
from datetime import datetime
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=schemas.DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):

    current_month = datetime.now().month
    current_year = datetime.now().year

    #  Get all expenses for current month
    expenses_result = await db.execute(select(models.Expense).where(models.Expense.user_id == current_user.id, 
        func.extract("month", models.Expense.date) == current_month, 
        func.extract("year", models.Expense.date) == current_year))
    expenses = expenses_result.scalars().all()
    
    total_spent = sum(expense.amount for expense in expenses)

#    Get all categories
    categories_result = await db.execute(select(models.Category).where(or_(models.Category.user_id == current_user.id, models.Category.user_id == None)))
    categories = categories_result.scalars().all()
    category_map = {cat.id: cat.name for cat in categories}

    #    Get all budgets for current month
    budgets_result = await db.execute(select(models.Budget).where(models.Budget.user_id == current_user.id, models.Budget.month == current_month, models.Budget.year == current_year))
    budgets = budgets_result.scalars().all()
    budget_map = {category_map.get(b.category_id, "Unknown"): b.amount for b in budgets}

    # Group spending by category
    spending_by_category = {}
    for expense in expenses:
        cat_name = category_map.get(expense.category_id, "Unknown")
        spending_by_category[cat_name] = spending_by_category.get(cat_name, 0) + expense.amount

    #  Build category Summary
    category_summary = []
    for cat_name, spent in spending_by_category.items():
        category_summary.append(
            schemas.CategorySummary(
                category=cat_name,
                spent=round(spent, 2),
                budget=budget_map.get(cat_name)
            )
        )

    #  Get 5 most recent expenses
    recent_result = await db.execute(select(models.Expense)
        .where(models.Expense.user_id == current_user.id)
        .order_by(models.Expense.date.desc()).limit(5))
    recent_expenses = recent_result.scalars().all()

    return schemas.DashboardResponse(
        total_spent=total_spent,
        category_summary=category_summary,
        recent_expenses=recent_expenses
    )