from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_URL = 'mysql+pymysql://iam:iam@localhost:3306/iam_db'

engine = create_engine(DB_URL, connect_args={'auth_plugin': 'mysql_native_password'})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()