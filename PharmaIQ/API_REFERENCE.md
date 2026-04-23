# PharmaIQ - API Reference

## Base URL
```
http://localhost:8000/api
```

## Authentication
No authentication required (for demo purposes)

---

## Endpoints

### 1. Symptom Analysis
**POST** `/symptoms`

Analyze user symptoms and get possible conditions.

**Request:**
```json
{
  "symptoms": "headache, fever, sore throat",
  "age": 25,
  "gender": "male",
  "duration": "2 days"
}
```

**Response:**
```json
{
  "possible_conditions": [
    {
      "name": "Common Cold",
      "probability": "High",
      "explanation": "...",
      "red_flags": [...]
    }
  ],
  "urgent_care_needed": false,
  "specialist_to_visit": "Primary Care",
  "recommended_tests": [...],
  "home_care_tips": [...],
  "disclaimer": "..."
}
```

---

### 2. Medicine Information
**POST** `/medicine-info`

Get comprehensive information about a medicine.

**Request:**
```json
{
  "medicine_name": "Aspirin"
}
```

**Response:**
```json
{
  "name": "Aspirin",
  "generic_name": "Acetylsalicylic acid",
  "drug_class": "NSAID",
  "mechanism_of_action": "...",
  "indications": ["Pain relief", "Fever reduction"],
  "contraindications": [...],
  "standard_dosage": "...",
  "pregnancy_category": "D",
  "storage": "Room temperature",
  "common_manufacturers": [...],
  "interesting_fact": "..."
}
```

---

### 3. Dosage Calculator
**POST** `/dosage`

Calculate appropriate dosage for a patient.

**Request:**
```json
{
  "medicine_name": "Ibuprofen",
  "age": 30,
  "weight": 75.5,
  "gender": "male",
  "condition": "Fever"
}
```

**Response:**
```json
{
  "recommended_dosage": "400mg",
  "frequency": "Every 6-8 hours",
  "duration": "3-5 days",
  "max_daily_dose": "1200mg",
  "with_food": true,
  "timing": "After meals",
  "special_notes": "...",
  "missed_dose_action": "...",
  "warnings": [...]
}
```

---

### 4. Drug Interactions
**POST** `/interactions`

Check for interactions between multiple medicines.

**Request:**
```json
{
  "medicines": ["Aspirin", "Ibuprofen", "Metformin"]
}
```

**Response:**
```json
{
  "severity": "HIGH",
  "overall_risk": "Significant interactions found",
  "doctor_consult_required": true,
  "interactions": [
    {
      "pair": "Aspirin + Ibuprofen",
      "severity": "HIGH",
      "effect": "Increased risk of GI bleeding",
      "mechanism": "Both are NSAIDs",
      "recommendation": "Do not use together"
    }
  ],
  "summary": "..."
}
```

---

### 5. Side Effects Prediction
**POST** `/side-effects`

Predict side effects for a medicine.

**Request:**
```json
{
  "medicine_name": "Metformin",
  "patient_age": 45,
  "existing_conditions": ["Diabetes", "Hypertension"]
}
```

**Response:**
```json
{
  "common_side_effects": [
    {
      "effect": "GI disturbance",
      "frequency": "30-40%",
      "severity": "Mild",
      "management": "Take with food"
    }
  ],
  "rare_serious_side_effects": [...],
  "condition_specific_risks": [...],
  "when_to_stop_immediately": [...],
  "things_to_monitor": [...]
}
```

---

### 6. Find Alternatives
**POST** `/alternatives`

Find alternative medicines with better pricing.

**Request:**
```json
{
  "medicine_name": "Brand Medicine",
  "reason": "High cost"
}
```

**Response:**
```json
{
  "alternatives": [
    {
      "name": "Generic Alternative",
      "type": "Generic",
      "price_range": "$5-8",
      "effectiveness": "Equivalent",
      "availability": "Widely available"
    }
  ],
  "category": "Pain Relief",
  "warnings": [...]
}
```

---

### 7. Chat Assistant
**POST** `/chat`

General medical queries and chat.

**Request:**
```json
{
  "message": "What is the best diet for diabetes?",
  "history": [
    {"role": "user", "content": "I have diabetes"},
    {"role": "assistant", "content": "I can help with that..."}
  ]
}
```

**Response:**
```json
{
  "response": "Here are some dietary recommendations for diabetes..."
}
```

---

### 8. Get Products
**GET** `/products`

Get all available health products.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Vitamin C 1000mg",
    "price": 12.99,
    "brand": "HealthCare+",
    "description": "..."
  }
]
```

---

### 9. Get Product Details
**GET** `/products/{product_id}`

Get details for a specific product.

**Response:**
```json
{
  "id": "1",
  "name": "Vitamin C 1000mg",
  "price": 12.99,
  "brand": "HealthCare+",
  "description": "...",
  "ingredients": [...],
  "usage": "..."
}
```

---

### 10. Get User Data
**GET** `/user/{user_id}`

Get user profile and routine information.

**Response:**
```json
{
  "user": {
    "user_id": "user123",
    "name": "John Doe",
    "age": 30
  },
  "routine": [
    {
      "medicine": "Aspirin",
      "dosage": "100mg",
      "frequency": "Daily"
    }
  ]
}
```

---

### 11. Add Routine Item
**POST** `/user/{user_id}/routine`

Add a medicine to user's routine.

**Request:**
```json
{
  "medicine": "Metformin",
  "dosage": "500mg",
  "frequency": "Twice daily"
}
```

**Response:**
```json
{
  "status": "added"
}
```

---

### 12. Health Check
**GET** `/health`

Check backend health status.

**Response:**
```json
{
  "status": "ok",
  "ai_ready": true
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

No rate limiting in development mode. In production, implement appropriate rate limiting.

---

## Usage Example (JavaScript)

```javascript
async function getSymptomAnalysis() {
  const response = await fetch('http://localhost:8000/api/symptoms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symptoms: 'fever, cough',
      age: 30,
      gender: 'male',
      duration: '3 days'
    })
  });
  const data = await response.json();
  console.log(data);
}
```

---

## Testing

Use the interactive API docs at: `http://localhost:8000/docs`

All endpoints can be tested directly from the browser UI.
