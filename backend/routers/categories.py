from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from sqlalchemy.future import select
import models, schemas
from auth import get_current_user
from sqlalchemy import or_

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=list[schemas.CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    result = await db.execute(select(models.Category).where(or_(models.Category.user_id == None
    ,models.Category.user_id == current_user.id)))
    return result.scalars().all()


@router.post("/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category_data: schemas.CategoryCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    result = await db.execute(select(models.Category).where(models.Category.name == category_data.name), models.Category.user_id == current_user.id)
    existing_category = result.scalar_one_or_none()
    if existing_category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists")
    new_category = models.Category(name=category_data.name, user_id=current_user.id)
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category


#  Delete Category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    result = await db.execute(select(models.Category).where(models.Category.id == category_id, models.Category.user_id == current_user.id))  
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found or not yours to delete")
    await db.delete(category)
    await db.commit()
    
    

