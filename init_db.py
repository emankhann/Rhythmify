from app import app
from extensions import db
from models import db

with app.app_context():
    db.create_all()
