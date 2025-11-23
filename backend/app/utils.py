import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

def load_env():
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        dotenv_path = os.path.join(BASE_DIR, "../.env")

        load_dotenv(dotenv_path=dotenv_path)
    except:
        load_dotenv()