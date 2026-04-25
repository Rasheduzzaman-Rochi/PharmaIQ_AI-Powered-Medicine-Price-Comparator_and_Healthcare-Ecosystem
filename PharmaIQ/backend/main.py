from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from models import *
from gemini_service import get_gemini_response, build_medical_chat_prompt, extract_medicines_from_image
from firebase_config import get_all_products, get_product as get_product_from_store, get_user, save_user, get_routine, save_routine_item, delete_routine_item, update_routine_item_status, save_order
import json
import os
import re

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

AI_RESPONSE_STYLE = """Style requirements:
- Use easy, plain English for non-technical users.
- Keep sentences short and clear.
- Do not use markdown formatting like **bold**, bullets symbols, or code fences.
- Return clean JSON only, following the exact requested fields.
- Keep list item text concise and readable.
"""


def parse_json_response(response_text: str, fallback: dict):
    raw = str(response_text or "").strip()
    if not raw:
        return fallback

    cleaned = raw.replace("```json", "").replace("```", "").strip()
    match = re.search(r"\{[\s\S]*\}", cleaned)
    payload = match.group(0).strip() if match else cleaned

    try:
        return json.loads(payload)
    except Exception:
        return fallback

# ------------------- AI Endpoints using Gemini -------------------
@app.post("/api/alternatives")
async def find_alternatives(req: SearchQuery):
    prompt = f"""As a clinical pharmacist, find cheaper or therapeutic alternatives for {req.medicine_name}.
Reason: {req.reason}.
{AI_RESPONSE_STYLE}
Return JSON with fields: alternatives (list of objects with name, type, price_range, effectiveness, availability), category, warnings."""
    response = await get_gemini_response(prompt)
    result = parse_json_response(response, {"alternatives": [], "raw": response})
    return result

@app.post("/api/interactions")
async def check_interactions(req: InteractionRequest):
    prompt = f"""Check drug interactions for {', '.join(req.medicines)}.
{AI_RESPONSE_STYLE}
Return JSON: severity, overall_risk, doctor_consult_required, interactions(list with pair, severity, effect, mechanism, recommendation), summary."""
    response = await get_gemini_response(prompt)
    result = parse_json_response(response, {"interactions": [], "raw": response})
    return result

@app.post("/api/symptoms")
async def analyze_symptoms(req: SymptomRequest):
    prompt = f"""Analyze symptoms: {req.symptoms}, age: {req.age}, duration: {req.duration}.
{AI_RESPONSE_STYLE}
Return JSON: possible_conditions(list with name, probability, explanation, red_flags), urgent_care_needed, specialist_to_visit, recommended_tests, home_care_tips, disclaimer."""
    response = await get_gemini_response(prompt)
    result = parse_json_response(response, {"possible_conditions": [], "raw": response})
    return result

@app.post("/api/dosage")
async def calculate_dosage(req: DosageRequest):
    prompt = f"""Calculate dosage for {req.medicine_name} for {req.age} year old, {req.weight}kg, condition: {req.condition}.
{AI_RESPONSE_STYLE}
Return JSON: recommended_dosage, frequency, duration, max_daily_dose, with_food, timing, special_notes, missed_dose_action, warnings."""
    response = await get_gemini_response(prompt)
    result = parse_json_response(response, {"recommended_dosage": "Consult doctor", "raw": response})
    return result

@app.post("/api/side-effects")
async def predict_side_effects(req: SideEffectRequest):
    prompt = f"""Predict side effects for {req.medicine_name} for patient age {req.patient_age}, existing conditions: {req.existing_conditions}.
{AI_RESPONSE_STYLE}
Return JSON: common_side_effects(list with effect, frequency, severity, management), rare_serious_side_effects, condition_specific_risks, when_to_stop_immediately, things_to_monitor."""
    response = await get_gemini_response(prompt)
    result = parse_json_response(response, {"common_side_effects": [], "raw": response})
    return result

@app.post("/api/medicine-info")
async def medicine_info(req: MedicineInfoRequest):
    prompt = f"""Provide comprehensive drug information for {req.medicine_name}.
{AI_RESPONSE_STYLE}
Return JSON: name, generic_name, drug_class, mechanism_of_action, indications(list), contraindications(list), standard_dosage, pregnancy_category, storage, common_manufacturers(list), interesting_fact."""
    response = await get_gemini_response(prompt)
    result = parse_json_response(response, {"name": req.medicine_name, "raw": response})
    return result

@app.post("/api/chat")
async def chat(req: ChatRequest):
    prompt = build_medical_chat_prompt(req.message, req.history)
    response = await get_gemini_response(prompt)
    return {"response": response.strip()}

@app.post("/api/scan-prescription")
async def scan_prescription(image: UploadFile = File(...)):
    content_type = image.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(400, "Please upload a valid image file")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(400, "Uploaded image is empty")

    result = await extract_medicines_from_image(image_bytes, content_type)
    medicines = result.get("medicines", [])
    error = result.get("error", "")

    return {
        "medicines": medicines,
        "count": len(medicines),
        "message": "Scan completed" if medicines else "No medicine names detected",
        "error": error
    }

# ------------------- Firebase CRUD for Routine & User -------------------
@app.get("/api/user/{user_id}")
async def get_user_data(user_id: str):
    user = get_user(user_id)
    routine = get_routine(user_id)
    return {"user": user, "routine": routine}

@app.post("/api/user/{user_id}/routine")
async def add_routine_item(user_id: str, item: dict):
    routine_id = save_routine_item(user_id, item)
    return {"status": "added", "id": routine_id}

@app.delete("/api/user/{user_id}/routine/{routine_id}")
async def remove_routine_item(user_id: str, routine_id: str):
    deleted = delete_routine_item(user_id, routine_id)
    if not deleted:
        raise HTTPException(404, "Routine item not found")
    return {"status": "deleted"}

@app.put("/api/user/{user_id}/routine/{routine_id}")
async def update_routine_item(user_id: str, routine_id: str, item: dict):
    status = str(item.get("status", "")).strip()
    if not status:
        raise HTTPException(400, "status is required")

    updated = update_routine_item_status(user_id, routine_id, status)
    if not updated:
        raise HTTPException(404, "Routine item not found")

    return {"status": "updated", "routine_id": routine_id}

# ------------------- Shop Products (from Firestore) -------------------
@app.get("/api/products")
async def get_products():
    products = get_all_products()
    return products

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    product = get_product_from_store(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@app.post("/api/orders")
async def create_order(req: OrderRequest):
    if not req.items:
        raise HTTPException(400, "Order must contain at least one item")

    order_payload = {
        "customer_name": req.customer_name.strip(),
        "mobile": req.mobile.strip(),
        "address": req.address.strip(),
        "total": req.total,
        "items": [item.model_dump() for item in req.items]
    }

    if not order_payload["customer_name"] or not order_payload["mobile"] or not order_payload["address"]:
        raise HTTPException(400, "Customer name, mobile and address are required")

    try:
        order_id = save_order(order_payload)
    except RuntimeError as err:
        raise HTTPException(503, str(err))
    except Exception:
        raise HTTPException(500, "Failed to save order")

    return {"status": "saved", "order_id": order_id}

# ------------------- Health Check -------------------
@app.get("/api/health")
async def health():
    return {"status": "ok", "ai_ready": bool(os.getenv("GEMINI_API_KEY"))}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)