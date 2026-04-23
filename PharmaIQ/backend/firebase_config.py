import firebase_admin
from firebase_admin import credentials, firestore
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

db = None
firebase_initialized = False

BASE_DIR = Path(__file__).resolve().parent

try:
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
    cred_path = Path(cred_path)
    if not cred_path.is_absolute():
        cred_path = (BASE_DIR / cred_path).resolve()

    if cred_path.exists():
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        firebase_initialized = True
    else:
        print(f"Warning: Firebase credentials file not found at {cred_path}")
except Exception as e:
    print(f"Warning: Firebase not initialized - {e}")
    db = None

# User helpers
def get_user(user_id):
    if not firebase_initialized or db is None:
        return {"user_id": user_id, "name": "Demo User", "demo": True}
    try:
        doc = db.collection('users').document(user_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

def save_user(user_id, data):
    if firebase_initialized and db:
        try:
            db.collection('users').document(user_id).set(data, merge=True)
        except Exception as e:
            print(f"Error saving user: {e}")

# Routine helpers
def get_routine(user_id):
    if firebase_initialized and db:
        try:
            docs = db.collection('users').document(user_id).collection('routine').stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            print(f"Error getting routine: {e}")
    return []

def save_routine_item(user_id, item):
    if firebase_initialized and db:
        try:
            db.collection('users').document(user_id).collection('routine').add(item)
        except Exception as e:
            print(f"Error saving routine item: {e}")

def update_routine_log(user_id, med_id, date, taken):
    pass

# Shop products (read-only)
def get_all_products():
    if firebase_initialized and db:
        try:
            preferred_collections = [
                os.getenv('FIRESTORE_PRODUCTS_COLLECTION', '').strip(),
                'medicines',
                'products'
            ]
            seen = set()

            for collection_name in preferred_collections:
                if not collection_name or collection_name in seen:
                    continue
                seen.add(collection_name)

                docs = list(db.collection(collection_name).stream())
                if docs:
                    return [{'id': doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error getting products: {e}")

    return []

def get_product(product_id):
    products = get_all_products()
    return next((p for p in products if p['id'] == product_id), None)