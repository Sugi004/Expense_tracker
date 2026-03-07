from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from database import get_db
from auth import get_current_user
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import models, schemas
import csv
import io
from fastapi.responses import StreamingResponse
import base64


router = APIRouter(prefix="/users", tags=["users"])

#  Get user profile

@router.get("/me", response_model=schemas.UserResponse)
async def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

# Update profile

@router.put("/me", response_model=schemas.UserResponse)
async def update_profile(
    data: schemas.UserUpdate,
    db: AsyncSession=Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    for field, value in data.model_dump(exclude_unset = True).items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.delete("/me")
async def delete_account(data: schemas.DeleteUser, db: AsyncSession=Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not verify_password(data.password, current_user.hashed_password):
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail="Incorrect Password"
        )
    await db.delete(current_user)
    await db.commit()
    return {"message": "Account Deleted Successfully"}

#  Export expenses as CSV

@router.get("/expenses/export")
async def export_expenses(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.Expense).where(models.Expense.user_id==current_user.id)
        )
    expenses = result.scalars().all()
    
    # Get categories
    cat_result = await db.execute(select(models.Category))
    categories = {cat.id: cat.name for cat in cat_result.scalars().all()}

    # Build CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Amount", "Category", "Date", "Note"])
    for expense in expenses:
        write.writerow([
           expense.id, 
           expense.title,
           expense.amount, 
           expense.get(expense.category_id, "Unknown"), 
           expense.date.strftime("%Y-%m-%d"), 
           expense.note or ""
           ])
    
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )


# Upload profile picture

@router.post("/me/profile-picture", response_model=schemas.UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validate the type of file
    if file.content_type not in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed."
        )
    # Validate the size of file
    if file.size > 1024 * 1024 * 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 3MB."
        )
    # Read and encode the image
    image_bytes = await file.read()
    base64_image = f"data:{file.content_type};base64,{base64.b64encode(image_bytes).decode('utf-8')}"
    
    # Update user's profile picture
    current_user.profile_picture = base64_image
    await db.commit()
    await db.refresh(current_user)
    return current_user
