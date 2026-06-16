from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.dependencies import get_db
from app.models.image import Image
from app.schemas.image import ImageRead
from app.security.guards import require_user
from app.models.user import User
from app.ml.text_image_embeddings import image_embed_bytes, is_supported_image_content_type, text_embed


router = APIRouter(prefix="/images", tags=["images"])


@router.post("", response_model=ImageRead)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    content = await file.read()

    embedding = None
    if is_supported_image_content_type(file.content_type):
        embedding = image_embed_bytes(content)

    image = Image(
        display_name=file.filename,
        content_type=file.content_type or "application/octet-stream",
        data=content,
        embedding=embedding,
    )

    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.get("/search", response_model=list[ImageRead])
def search_images(
    q: str = Query(...),
    limit: int = 10,
    db: Session = Depends(get_db),
):
    embedding = text_embed(q)

    stmt = (
        select(Image)
        .where(Image.embedding.isnot(None))
        .order_by(
            Image.embedding.cosine_distance(embedding)
        )
        .limit(limit)
    )

    return db.scalars(stmt).all()


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


@router.patch("/{image_id}", response_model=ImageRead)
async def update_image(
    image_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    image = db.get(Image, image_id)

    if not image:
        raise HTTPException(404, "Image not found")

    content = await file.read()

    image.embedding = None
    if is_supported_image_content_type(file.content_type):
        image.embedding = image_embed_bytes(content)

    image.display_name = file.filename
    image.content_type = file.content_type or "application/octet-stream"
    image.data = content

    db.commit()
    db.refresh(image)

    return image


@router.delete("/{image_id}")
def delete_image(image_id: UUID, db: Session = Depends(get_db)):
    image = db.get(Image, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    db.delete(image)
    db.commit()
    return {"status": "deleted"}


@router.get("/{image_id}/similar", response_model=list[ImageRead])
def similar_images(
    image_id: UUID,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    image = db.get(Image, image_id)

    if not image:
        raise HTTPException(404, "Image not found")

    if image.embedding is None:
        raise HTTPException(400, "Image has no embedding")

    stmt = (
        select(Image)
        .where(
            Image.id != image.id,
            Image.embedding.isnot(None),
        )
        .order_by(
            Image.embedding.cosine_distance(image.embedding)
        )
        .limit(limit)
    )

    return db.scalars(stmt).all()
