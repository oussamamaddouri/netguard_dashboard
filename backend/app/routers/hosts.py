# backend/app/routers/hosts.py

from fastapi import APIRouter, Depends
from typing import List
# Import 'joinedload' to enable eager loading of relationships
from sqlalchemy.orm import Session, joinedload
from app.dependencies import get_db
from app import models, schemas

router = APIRouter()

# Using response_model helps FastAPI with serialization and documentation
@router.get("", response_model=List[schemas.HostSchema])
@router.get("/", response_model=List[schemas.HostSchema])
def get_discovered_hosts(db: Session = Depends(get_db)):
    """
    Returns all host records from the database, eagerly loading their 
    associated ports and vulnerabilities for efficient querying.
    """
    
    # This single, efficient query replaces the previous manual logic.
    # .options(joinedload(...)) tells SQLAlchemy to fetch the related ports
    # and vulnerabilities in the same query, avoiding extra database hits
    # and correctly populating the relationships defined in your models.
    db_hosts = (
        db.query(models.Host)
        .options(
            joinedload(models.Host.ports), 
            joinedload(models.Host.vulnerabilities)
        )
        .order_by(models.Host.last_seen.desc())
        .all()
    )

    # With the relationships now loaded, FastAPI and Pydantic can handle
    # the conversion to JSON automatically. No manual stitching is needed.
    return db_hosts