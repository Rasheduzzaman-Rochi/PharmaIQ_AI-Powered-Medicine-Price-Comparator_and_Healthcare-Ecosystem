import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

db = None
firebase_initialized = False

BASE_DIR = Path(__file__).resolve().parent
LOCAL_STORE_PATH = BASE_DIR / "local_store.json"

DEMO_PRODUCTS = [
    {
        "id": "demo-napa-500",
        "name": "Napa 500",
        "brand_name": "Napa 500",
        "generic_name": "Paracetamol",
        "medicine_name": "Napa 500",
        "price": 12.0,
        "brand": "Beximco",
        "company": "Beximco Pharma",
        "drug_class": "Analgesic",
        "form": "Tablet",
        "strength": "500 mg",
        "category": "Pain Relief",
        "packaging": ["10 tablets"],
        "offer": "Common fever and pain relief option"
    },
    {
        "id": "demo-ace-500",
        "name": "Ace 500",
        "brand_name": "Ace 500",
        "generic_name": "Paracetamol",
        "medicine_name": "Ace 500",
        "price": 10.0,
        "brand": "Square",
        "company": "Square Pharmaceuticals",
        "drug_class": "Analgesic",
        "form": "Tablet",
        "strength": "500 mg",
        "category": "Pain Relief",
        "packaging": ["10 tablets"],
        "offer": "Budget-friendly generic option"
    },
    {
        "id": "demo-seclo-20",
        "name": "Seclo 20",
        "brand_name": "Seclo 20",
        "generic_name": "Omeprazole",
        "medicine_name": "Seclo 20",
        "price": 65.0,
        "brand": "Square",
        "company": "Square Pharmaceuticals",
        "drug_class": "Proton Pump Inhibitor",
        "form": "Capsule",
        "strength": "20 mg",
        "category": "Digestive Care",
        "packaging": ["14 capsules"]
    },
    {
        "id": "demo-ome-20",
        "name": "Ome 20",
        "brand_name": "Ome 20",
        "generic_name": "Omeprazole",
        "medicine_name": "Ome 20",
        "price": 48.0,
        "brand": "Incepta",
        "company": "Incepta Pharmaceuticals",
        "drug_class": "Proton Pump Inhibitor",
        "form": "Capsule",
        "strength": "20 mg",
        "category": "Digestive Care",
        "packaging": ["14 capsules"]
    },
    {
        "id": "demo-metformin-500",
        "name": "Comet 500",
        "brand_name": "Comet 500",
        "generic_name": "Metformin",
        "medicine_name": "Comet 500",
        "price": 78.0,
        "brand": "Square",
        "company": "Square Pharmaceuticals",
        "drug_class": "Antidiabetic",
        "form": "Tablet",
        "strength": "500 mg",
        "category": "Diabetes",
        "packaging": ["30 tablets"]
    },
    {
        "id": "demo-vitamin-c",
        "name": "Ceevit",
        "brand_name": "Ceevit",
        "generic_name": "Vitamin C",
        "medicine_name": "Ceevit",
        "price": 35.0,
        "brand": "Square",
        "company": "Square Pharmaceuticals",
        "drug_class": "Supplement",
        "form": "Tablet",
        "strength": "250 mg",
        "category": "Supplements",
        "packaging": ["10 tablets"]
    }
]

try:
    firebase_env = os.getenv("FIREBASE_CREDENTIALS")
    
    if firebase_env:
        cred_dict = json.loads(firebase_env)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        firebase_initialized = True
        print("Firebase successfully connected via Environment Variable!")
        
    else:
        cred_path = Path("serviceAccountKey.json")
        if not cred_path.is_absolute():
            cred_path = (BASE_DIR / cred_path).resolve()
            
        if cred_path.exists():
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            firebase_initialized = True
            print("Firebase successfully connected via local file!")
        else:
            print("Warning: Firebase credentials not found anywhere!")
            
except Exception as e:
    print(f"Warning: Firebase not initialized - {e}")
    db = None

def _default_local_store():
    return {
        "users": {},
        "routines": {},
        "orders": []
    }


def _read_local_store():
    if not LOCAL_STORE_PATH.exists():
        return _default_local_store()

    try:
        raw = json.loads(LOCAL_STORE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return _default_local_store()

    base = _default_local_store()
    if isinstance(raw, dict):
        base.update({
            "users": raw.get("users", {}) if isinstance(raw.get("users", {}), dict) else {},
            "routines": raw.get("routines", {}) if isinstance(raw.get("routines", {}), dict) else {},
            "orders": raw.get("orders", []) if isinstance(raw.get("orders", []), list) else []
        })
    return base


def _write_local_store(payload):
    LOCAL_STORE_PATH.write_text(json.dumps(payload, ensure_ascii=True, indent=2), encoding="utf-8")


def _ensure_local_user(user_id):
    store = _read_local_store()
    users = store.setdefault("users", {})
    if user_id not in users:
        users[user_id] = {"user_id": user_id, "name": "Local User", "demo": True}
        _write_local_store(store)
    return users[user_id]


def get_storage_mode():
    return "firebase" if firebase_initialized and db is not None else "local"

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
        return _ensure_local_user(user_id)
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
        return

    store = _read_local_store()
    users = store.setdefault("users", {})
    current = users.get(user_id, {"user_id": user_id, "demo": True})
    users[user_id] = {**current, **data, "user_id": user_id}
    _write_local_store(store)

# Routine helpers
def get_routine(user_id):
    if firebase_initialized and db:
        try:
            docs = db.collection('users').document(user_id).collection('routine').stream()
            # Keep Firestore document id authoritative even if payload contains an `id` field.
            return [{**doc.to_dict(), 'id': doc.id} for doc in docs]
        except Exception as e:
            print(f"Error getting routine: {e}")

    store = _read_local_store()
    routine = store.get("routines", {}).get(user_id, [])
    return [dict(item) for item in routine if isinstance(item, dict)]

def save_routine_item(user_id, item):
    if firebase_initialized and db:
        try:
            ref = db.collection('users').document(user_id).collection('routine').add(item)[1]
            return ref.id
        except Exception as e:
            print(f"Error saving routine item: {e}")

    store = _read_local_store()
    users = store.setdefault("users", {})
    if user_id not in users:
        users[user_id] = {"user_id": user_id, "name": "Local User", "demo": True}
    routines = store.setdefault("routines", {})
    rows = routines.setdefault(user_id, [])
    row = dict(item or {})
    row["id"] = row.get("id") or f"routine-{uuid4().hex[:10]}"
    rows.append(row)
    _write_local_store(store)
    return row["id"]

def delete_routine_item(user_id, routine_id):
    if firebase_initialized and db:
        try:
            db.collection('users').document(user_id).collection('routine').document(routine_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting routine item: {e}")

    store = _read_local_store()
    rows = store.get("routines", {}).get(user_id, [])
    next_rows = [row for row in rows if str(row.get("id")) != str(routine_id)]
    if len(next_rows) == len(rows):
        return False

    store["routines"][user_id] = next_rows
    _write_local_store(store)
    return True

def update_routine_item_status(user_id, routine_id, status, last_taken_date=None):
    if firebase_initialized and db:
        try:
            payload = {'status': status}
            if last_taken_date is not None:
                payload['last_taken_date'] = last_taken_date
            db.collection('users').document(user_id).collection('routine').document(routine_id).set(
                payload,
                merge=True
            )
            return True
        except Exception as e:
            print(f"Error updating routine item: {e}")
            return False

    store = _read_local_store()
    rows = store.get("routines", {}).get(user_id, [])
    updated = False

    for row in rows:
        if str(row.get("id")) != str(routine_id):
            continue
        row["status"] = status
        if last_taken_date is not None:
            row["last_taken_date"] = last_taken_date
        updated = True
        break

    if updated:
        _write_local_store(store)
    return updated

def update_routine_log(user_id, med_id, date, taken):
    return update_routine_item_status(
        user_id,
        med_id,
        "Taken" if taken else "Pending",
        date if taken else ""
    )

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

    return [dict(product) for product in DEMO_PRODUCTS]

def get_product(product_id):
    products = get_all_products()
    return next((p for p in products if p['id'] == product_id), None)


def save_order(order_data):
    if firebase_initialized and db is not None:
        try:
            payload = {
                **order_data,
                'created_at': firestore.SERVER_TIMESTAMP,
                'status': 'placed'
            }
            ref = db.collection('orders').add(payload)[1]
            return ref.id
        except Exception as e:
            print(f"Error saving order: {e}")

    store = _read_local_store()
    orders = store.setdefault("orders", [])
    order_id = f"ORD-{uuid4().hex[:8].upper()}"
    payload = {
        **order_data,
        "id": order_id,
        "status": "placed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    orders.append(payload)
    _write_local_store(store)
    return order_id
