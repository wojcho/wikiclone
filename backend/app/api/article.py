from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleRead, ArticleUpdate
from app.security.guards import require_user
from app.models.user import User


router = APIRouter(prefix="/articles", tags=["articles"])


@router.post("", response_model=ArticleRead)
def create_article(
    payload: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    article = Article(
        display_name=payload.display_name,
        text=payload.text,
        creator_id=current_user.id,
        primary_image_id=payload.primary_image_id,
        background_image_id=payload.background_image_id,
    )

    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.get("/{article_id}", response_model=ArticleRead)
def get_article(article_id: UUID, db: Session = Depends(get_db)):
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("", response_model=list[ArticleRead])
def list_articles(db: Session = Depends(get_db)):
    return db.query(Article).order_by(Article.created_at.desc()).all()


@router.patch("/{article_id}", response_model=ArticleRead)
def update_article(
    article_id: UUID,
    payload: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    article = db.get(Article, article_id)

    if not article:
        raise HTTPException(404, "Article not found")

    if payload.display_name is not None:
        article.display_name = payload.display_name

    if payload.text is not None:
        article.text = payload.text

    if payload.primary_image_id is not None:
        article.primary_image_id = payload.primary_image_id

    if payload.background_image_id is not None:
        article.background_image_id = payload.background_image_id

    db.commit()
    db.refresh(article)

    return article


@router.delete("/{article_id}")
def delete_article(
    article_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    db.delete(article)
    db.commit()
    return {"status": "deleted"}
