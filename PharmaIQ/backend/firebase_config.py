import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

db = None
firebase_initialized = False

try:
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        firebase_initialized = True
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
    # Demo products for testing
    demo_products = [
        {"id": "1", "name": "Vitamin C 1000mg", "price": 12.99, "brand": "HealthCare+"},
        {"id": "2", "name": "Omega-3 Fish Oil", "price": 14.99, "brand": "NutraLife"},
        {"id": "3", "name": "Medical Face Masks (50)", "price": 9.99, "brand": "SafeGuard"},
        {"id": "4", "name": "Digital Thermometer", "price": 19.99, "brand": "MediCheck"},
        {"id": "5", "name": "Blood Pressure Monitor", "price": 39.99, "brand": "CardioX"},
        {"id": "6", "name": "First Aid Kit", "price": 24.99, "brand": "Emergency"}
    ]

    if firebase_initialized and db:
        try:
            docs = db.collection('products').stream()
            return [{'id': doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error getting products: {e}")

    return demo_products

def get_product(product_id):
    products = get_all_products()
    return next((p for p in products if p['id'] == product_id), None)