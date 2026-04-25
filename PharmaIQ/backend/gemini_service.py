import google.generativeai as genai
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_CANDIDATES = [
    os.getenv("GEMINI_MODEL"),
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

VISION_MODEL_CANDIDATES = [
    os.getenv("GEMINI_VISION_MODEL"),
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

PREFERRED_GENERATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]


def _normalize_model_name(model_name):
    name = str(model_name or "").strip()
    if name.startswith("models/"):
        return name.split("models/", 1)[1]
    return name


def _available_generate_models():
    available = set()
    try:
        for model in genai.list_models():
            methods = getattr(model, "supported_generation_methods", []) or []
            if "generateContent" in methods:
                available.add(_normalize_model_name(getattr(model, "name", "")))
    except Exception:
        return set()
    return {name for name in available if name}


def _build_model(model_name):
    base = _normalize_model_name(model_name)
    variants = [base]
    if base and not base.startswith("models/"):
        variants.append(f"models/{base}")

    for variant in variants:
        if not variant:
            continue
        try:
            return genai.GenerativeModel(variant)
        except Exception:
            continue
    raise RuntimeError("Unable to initialize Gemini model")


def _select_model_name(candidates):
    normalized_candidates = [_normalize_model_name(name) for name in candidates if str(name or "").strip()]
    available = _available_generate_models()

    if available:
        for name in normalized_candidates:
            if name in available:
                return name
        for preferred in PREFERRED_GENERATE_MODELS:
            if preferred in available:
                return preferred
        return sorted(available)[0]

    if normalized_candidates:
        return normalized_candidates[0]
    return PREFERRED_GENERATE_MODELS[0]


def _ordered_model_names(candidates):
    ordered = []
    seen = set()
    available = _available_generate_models()

    source_names = [_normalize_model_name(name) for name in candidates if str(name or "").strip()]
    source_names.extend(PREFERRED_GENERATE_MODELS)

    if available:
        source_names.extend(sorted(available))

    for name in source_names:
        if not name or name in seen:
            continue
        if available and name not in available:
            continue
        seen.add(name)
        ordered.append(name)

    if ordered:
        return ordered
    return [PREFERRED_GENERATE_MODELS[0]]


def _is_quota_or_rate_error(err):
    text = str(err or "").lower()
    return "429" in text or "quota" in text or "rate" in text or "limit" in text


async def _generate_content_with_fallback(payload, candidates):
    last_error = None
    for model_name in _ordered_model_names(candidates):
        try:
            model = _build_model(model_name)
            response = await model.generate_content_async(payload)
            return response
        except Exception as err:
            last_error = err
            # Keep trying other models, especially on quota/rate-limit errors.
            if _is_quota_or_rate_error(err):
                continue
            continue

    if last_error:
        raise last_error
    raise RuntimeError("No usable Gemini model available")


def get_model():
    selected = _select_model_name(MODEL_CANDIDATES)
    try:
        return _build_model(selected)
    except Exception:
        for fallback in PREFERRED_GENERATE_MODELS:
            try:
                return _build_model(fallback)
            except Exception:
                continue
    return genai.GenerativeModel("gemini-2.5-flash")


def get_vision_model():
    selected = _select_model_name(VISION_MODEL_CANDIDATES)
    try:
        return _build_model(selected)
    except Exception:
        for fallback in PREFERRED_GENERATE_MODELS:
            try:
                return _build_model(fallback)
            except Exception:
                continue
    return genai.GenerativeModel("gemini-2.5-flash")


def _extract_between(text, start_marker, end_marker=None):
    start = text.find(start_marker)
    if start == -1:
        return ""
    start += len(start_marker)
    end = len(text)
    if end_marker:
        found_end = text.find(end_marker, start)
        if found_end != -1:
            end = found_end
    return text[start:end].strip()


def _extract_json_block(text):
    raw = (text or "").strip()
    if not raw:
        return ""

    if raw.startswith("```"):
        raw = raw.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{[\s\S]*\}", raw)
    return match.group(0).strip() if match else raw


def _normalize_medicine_rows(rows):
    normalized = []
    for row in rows or []:
        if isinstance(row, str):
            row = {"name": row}
        if not isinstance(row, dict):
            continue

        name = str(row.get("name", "")).strip()
        if not name:
            continue

        strength = str(row.get("strength", "")).strip()
        notes = str(row.get("notes", "")).strip()
        try:
            confidence = float(row.get("confidence", 0.0) or 0.0)
        except Exception:
            confidence = 0.0

        normalized.append({
            "name": name,
            "strength": strength,
            "notes": notes,
            "confidence": max(0.0, min(1.0, confidence))
        })
    return normalized


def _parse_medicines_from_any_text(text):
    payload = _extract_json_block(text)
    medicines = []

    # First preference: valid JSON structure.
    try:
        parsed = json.loads(payload) if payload else {}
        if isinstance(parsed, dict):
            rows = parsed.get("medicines", [])
            if not rows:
                rows = parsed.get("medicine", []) or parsed.get("drugs", []) or parsed.get("items", [])
            medicines = _normalize_medicine_rows(rows)
        elif isinstance(parsed, list):
            medicines = _normalize_medicine_rows(parsed)
    except Exception:
        medicines = []

    if medicines:
        return medicines

    # Fallback: parse free-form lines from model response.
    raw = (text or "").replace("\r", "\n")
    lines = [line.strip() for line in re.split(r"\n|,|;", raw) if line.strip()]
    if not lines:
        return []

    blocked = {
        "medicine", "medicines", "name", "names", "prescription", "unknown",
        "not", "found", "none", "n/a", "json"
    }
    result = []
    seen = set()

    for line in lines:
        clean = re.sub(r"^[\-\*\d\)\.\s]+", "", line)
        clean = re.sub(r"^(medicine\s*name|name|drug|rx|tab|tablet|cap|capsule)\s*[:\-]\s*", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"^(tab\.?|tablet\.?|cap\.?|capsule\.?|syrup\.?|inj\.?|injection\.?)\s+", "", clean, flags=re.IGNORECASE)
        clean = clean.strip("` \t")
        if not clean:
            continue

        match = re.match(
            r"(?P<name>[A-Za-z][A-Za-z0-9\s\-/\+]{1,70}?)(?:\s*[\(\-:]?\s*(?P<strength>\d+(?:\.\d+)?\s?(?:mg|mcg|g|ml)))?(?:\s*\)?\s*(?:[-,:].*)?)?$",
            clean,
            re.IGNORECASE
        )
        if match:
            name = re.sub(r"\s+", " ", match.group("name") or "").strip(" -")
            strength = (match.group("strength") or "").strip()
        else:
            fallback = re.search(r"([A-Za-z][A-Za-z0-9\-/\+]{2,})(?:\s+(\d+(?:\.\d+)?\s?(?:mg|mcg|g|ml)))?", clean, re.IGNORECASE)
            if not fallback:
                continue
            name = fallback.group(1).strip()
            strength = (fallback.group(2) or "").strip()

        name = re.sub(r"\s+", " ", name).strip(" -")
        low_name = name.lower()

        if len(name) < 3 or low_name in blocked:
            continue

        key = (low_name, strength.lower())
        if key in seen:
            continue
        seen.add(key)

        result.append({
            "name": name,
            "strength": strength,
            "notes": "",
            "confidence": 0.4
        })

    return result

MEDICAL_CHAT_INSTRUCTIONS = """You are PharmaBot, a helpful medical and medicine-shopping assistant.
Rules:
- Be concise, friendly, and practical.
- Prefer bullet points when giving advice.
- Use only simple, easy English.
- Do not use Bengali words or difficult medical jargon unless needed.
- Do not use markdown symbols like **, __, `, or code blocks.
- Keep sentences short and clear for non-technical users.
- If the user asks about medicine use, side effects, dosage, interactions, or alternatives, answer directly.
- If any important detail is missing, ask one short follow-up question.
- Never claim to replace a doctor.
- If the user describes chest pain, breathing trouble, fainting, severe allergic reaction, stroke symptoms, suicide risk, or emergency, say they need urgent medical care now.
- If the user asks for a medicine recommendation, give safer, general guidance and mention to confirm with a licensed clinician or pharmacist.
- Keep answers easy to understand for a regular user.
"""

async def get_gemini_response(prompt):
    try:
        response = await _generate_content_with_fallback(prompt, MODEL_CANDIDATES)
        return response.text or ""
    except Exception as error:
        lower_prompt = prompt.lower()

        if "return json:" in lower_prompt:
            if "find cheaper or therapeutic alternatives" in lower_prompt:
                medicine = _extract_between(prompt, "for ", "\nReason:") or "the medicine"
                return json.dumps({
                    "alternatives": [{
                        "name": f"Ask for a generic equivalent of {medicine}",
                        "type": "Generic guidance",
                        "price_range": "Usually lower than brand-name versions",
                        "effectiveness": "Often similar when the same active ingredient is used",
                        "availability": "Check your local pharmacy or the shop dataset"
                    }],
                    "category": "Medicine",
                    "warnings": ["AI service is unavailable right now. Please verify with a pharmacist."]
                })

            if "check drug interactions" in lower_prompt:
                return json.dumps({
                    "severity": "UNKNOWN",
                    "overall_risk": "AI service unavailable right now.",
                    "doctor_consult_required": True,
                    "interactions": [],
                    "summary": "Please consult a licensed clinician or pharmacist before combining medicines."
                })

            if "analyze symptoms" in lower_prompt:
                return json.dumps({
                    "possible_conditions": [{
                        "name": "General illness or infection",
                        "probability": "Unknown",
                        "explanation": "AI service unavailable right now.",
                        "red_flags": ["High fever", "Trouble breathing", "Severe weakness"]
                    }],
                    "urgent_care_needed": False,
                    "specialist_to_visit": "Primary Care",
                    "recommended_tests": ["Check with a clinician if symptoms persist"],
                    "home_care_tips": ["Rest", "Hydrate", "Monitor symptoms"],
                    "disclaimer": "Please get a medical evaluation for persistent or severe symptoms."
                })

            if "calculate dosage" in lower_prompt:
                return json.dumps({
                    "recommended_dosage": "Consult a doctor or pharmacist",
                    "frequency": "Depends on the medicine",
                    "duration": "Depends on the condition",
                    "max_daily_dose": "Unknown",
                    "with_food": True,
                    "timing": "Follow the label or clinician advice",
                    "special_notes": "AI service is unavailable right now.",
                    "missed_dose_action": "Follow the medicine label or ask a pharmacist.",
                    "warnings": ["Do not exceed the prescribed dose."]
                })

            if "predict side effects" in lower_prompt:
                return json.dumps({
                    "common_side_effects": [{
                        "effect": "AI service unavailable right now",
                        "frequency": "Unknown",
                        "severity": "Unknown",
                        "management": "Consult a pharmacist or doctor"
                    }],
                    "rare_serious_side_effects": ["Get medical help if you develop severe symptoms"],
                    "condition_specific_risks": ["Discuss personal risks with a clinician"],
                    "when_to_stop_immediately": ["Severe allergic reaction", "Breathing trouble"],
                    "things_to_monitor": ["Rash", "Dizziness", "Stomach upset"]
                })

            if "provide comprehensive drug information" in lower_prompt:
                medicine = _extract_between(prompt, "for ", ". Return JSON:") or "this medicine"
                return json.dumps({
                    "name": medicine,
                    "generic_name": "Unknown",
                    "drug_class": "Unknown",
                    "mechanism_of_action": "AI service unavailable right now.",
                    "indications": ["Ask a pharmacist for correct usage"],
                    "contraindications": ["Consult a clinician"],
                    "standard_dosage": "Follow the package label or doctor advice",
                    "pregnancy_category": "Unknown",
                    "storage": "Store as directed on the package",
                    "common_manufacturers": [],
                    "interesting_fact": "Please verify drug information from a licensed source."
                })

            return json.dumps({"detail": "AI service unavailable right now."})

        user_message = _extract_between(prompt, "User message:", "\n\nWrite the best helpful reply now.") or prompt
        message_lower = user_message.lower()

        if any(word in message_lower for word in ["chest pain", "breathing", "faint", "stroke", "suicid", "allergic", "anaphyl"]):
            return (
                "This may be urgent. Please seek emergency medical care now or contact a doctor immediately.\n\n"
                "- If breathing is hard or swelling is happening, call emergency services now.\n"
                "- Do not take any more medicine until a clinician checks you."
            )

        if any(word in message_lower for word in ["dose", "dosage", "how much", "tablet", "capsule"]):
            return (
                "I can help with general dosage guidance, but I need the medicine name, age, and weight.\n\n"
                "- Tell me the medicine name\n"
                "- Tell me the patient's age\n"
                "- Tell me the weight if possible"
            )

        if any(word in message_lower for word in ["interaction", "together", "mix", "combination"]):
            return "I can check interactions. Send me the medicine names separated by commas, and I will review them."

        if any(word in message_lower for word in ["side effect", "side effects", "adverse", "reaction"]):
            return "I can help with side effects. Send the medicine name and any existing conditions, and I will explain the common risks."

        if any(word in message_lower for word in ["cheaper", "alternative", "substitute", "brand"]):
            return "I can suggest cheaper alternatives. Send the medicine name or brand, and I will help compare options."

        return (
            "I am here to help with medicine advice, side effects, dosage, interactions, and cheaper alternatives.\n\n"
            "Try one of these:\n"
            "- What is the dose for Napa for fever?\n"
            "- Check interaction between Metformin and another medicine\n"
            "- Suggest cheaper alternatives for Seclo"
        )


def build_medical_chat_prompt(message, history=None, user_name=None):
    history = history or []
    recent_turns = history[-6:]
    conversation = "\n".join(
        f"{turn.get('role', 'user').capitalize()}: {turn.get('content', '')}"
        for turn in recent_turns
        if turn.get('content')
    )
    user_line = f"User name: {user_name}\n" if user_name else ""
    return f"""{MEDICAL_CHAT_INSTRUCTIONS}

Conversation context:
{conversation if conversation else 'No previous conversation.'}

{user_line}User message: {message}

Write the best helpful reply now."""


async def extract_medicines_from_image(image_bytes, mime_type="image/jpeg"):
    prompt = """You are reading a prescription image.
Extract medicine names from the image (handwritten or computer-typed).
Return only valid JSON with this exact shape:
{
    "medicines": [
        {"name": "Napa", "strength": "500mg", "notes": "", "confidence": 0.95}
    ]
}
Rules:
- Output only JSON, no extra text.
- If uncertain, still return best guess with lower confidence.
- Keep brand names exactly as written when possible.
- If no medicine is found, return {"medicines": []}.
"""

    fallback_prompt = """Read this prescription image carefully, including handwritten text.
List only medicine names and strengths.
Format:
- One medicine per line.
- Example: Napa 500mg
- Do not add explanations.
"""

    try:
        response = await _generate_content_with_fallback([
            prompt,
            {"mime_type": mime_type or "image/jpeg", "data": image_bytes}
        ], VISION_MODEL_CANDIDATES)
        text = response.text or ""
        medicines = _parse_medicines_from_any_text(text)
        if medicines:
            return {"medicines": medicines[:10]}

        # Retry with a looser extraction format for handwritten prescriptions.
        retry_response = await _generate_content_with_fallback([
            fallback_prompt,
            {"mime_type": mime_type or "image/jpeg", "data": image_bytes}
        ], VISION_MODEL_CANDIDATES)
        retry_text = retry_response.text or ""
        retry_medicines = _parse_medicines_from_any_text(retry_text)
        return {"medicines": retry_medicines[:10]}
    except Exception as err:
        return {
            "medicines": [],
            "error": str(err)
        }