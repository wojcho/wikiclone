from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.image import Image
from app.schemas.image import ImageRead
from app.security.guards import require_user
from app.models.user import User


router = APIRouter(prefix="/images", tags=["images"])


@router.post("", response_model=ImageRead)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    content = await file.read()

    image = Image(
        display_name=file.filename,
        content_type=file.content_type or "application/octet-stream",
        data=content,
    )

    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.get("/{image_id}", response_model=ImageRead)
def get_image_metadata(image_id: UUID, db: Session = Depends(get_db)):
    image = db.get(Image, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image


@router.get("/{image_id}/raw")
def get_image_file(image_id: UUID, db: Session = Depends(get_db)):
    image = db.get(Image, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    return Response(
        content=image.data,
        media_type=image.content_type,
    )


@router.get("", response_model=list[ImageRead])
def list_images(db: Session = Depends(get_db)):
    return db.query(Image).order_by(Image.created_at.desc()).all()


@router.delete("/{image_id}")
def delete_image(image_id: UUID, db: Session = Depends(get_db)):
    image = db.get(Image, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    db.delete(image)
    db.commit()
    return {"status": "deleted"}

