import motor.motor_asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL not found in environment variables")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client.erp_database

def get_database():
    return db
