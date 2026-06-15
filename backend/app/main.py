from fastapi import FastAPI
import os

import psycopg

app = FastAPI()


@app.get("/")
def root():
    return {
        "service": "wiki-backend"
    }


@app.get("/health")
def root():
    database_url = os.environ["DATABASE_URL"]

    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            version = cur.fetchone()[0]

    return {
        "status": "ok",
        "database_version": version,
    }
