from fastapi import FastAPI
import os

from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.dependencies import get_db

from app.api.user import router as user_router

from app.db import engine
from app.models.base import Base
from app.models import user, image, article


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(user_router)


@app.get("/health")
def health(db: Session = Depends(get_db)):
    return {
        "status": "ok",
        "database_version": db.execute(text("SELECT version()")).scalar()
    }
