# PharmaIQ: AI-Powered Medicine Price Comparator & Healthcare Ecosystem

PharmaIQ is an AI-assisted medicine guidance and pharmacy support platform built as a full-stack academic project.

PharmaIQ helps users:
- find lower-cost alternatives for prescribed medicines,
- check possible drug interactions,
- get medicine and dosage guidance,
- analyze symptoms for preliminary insights,
- scan prescription images to detect medicine names,
- manage personal daily medicine routines,
- browse and order from a medicine/product catalog.

This repository is structured and documented to support:
- final year project demonstrations,
- software engineering submissions (SRS / report),
- recruiter portfolio review.

## 1. Executive Summary

PharmaIQ is a healthcare-oriented decision support web application. It integrates a FastAPI backend, Gemini-based AI analysis, and a responsive single-page frontend to provide practical medicine information workflows in one interface.

The system is intentionally designed in a modular way so it can run in two storage modes:
- Firebase mode (Firestore-backed data persistence)
- Local fallback mode (JSON file persistence with demo catalog)

This dual-mode strategy improves reliability in academic/demo environments where cloud setup may be incomplete.

## 2. Problem Statement

Many users face several medicine-related challenges:
- difficulty identifying safe and affordable alternatives,
- uncertainty about interactions between multiple medicines,
- confusion around dosage timing and side effects,
- lack of centralized medicine tools in one easy interface.

PharmaIQ addresses these by combining product data, AI-driven analysis, and routine tracking into one platform.

## 3. Project Objectives

- Build an end-to-end healthcare support web system.
- Provide AI-powered medicine assistance using natural language prompts.
- Support prescription image scanning to reduce manual typing.
- Offer product comparison and alternative suggestions.
- Persist routine and order data with cloud-first and local fallback storage.
- Deliver a clean UI usable on desktop and mobile.

## 4. Scope

### In Scope
- Medicine alternative finder from local/catalog dataset.
- Drug interaction, side effect, dosage, symptom, and medicine info analysis via AI endpoints.
- Prescription image scan to extract medicine names.
- User routine CRUD (create, read, update, delete).
- Product listing and order creation.
- Chat assistant for medicine-related queries.

### Out of Scope
- Real clinical diagnosis certification.
- E-prescription legal workflows.
- Hospital EMR integration.
- Production-grade patient authentication and authorization.

## 5. Intended Users and Stakeholders

- General users/patients (for medicine support guidance).
- Pharmacists (for quick cross-check support).
- Academic evaluators (faculty/supervisors).
- Recruiters/engineering reviewers.

## 6. Key Features

1. Alternative Finder
- Search by medicine name or scan prescription image.
- Detects multiple medicines and lets users focus on single medicine results.

2. AI Clinical Guidance Modules
- Symptom Analyzer
- Drug Interaction Checker
- Dosage Calculator
- Side Effects Predictor
- Drug Encyclopedia
- Medical Chat Assistant

3. Prescription OCR Workflow
- Upload image
- Send to backend scan endpoint
- Extract medicine names
- Clickable detected chips to search alternatives quickly

4. Medicine Shop and Ordering
- Catalog browsing
- Add to cart
- Checkout and order submission

5. Daily Routine Manager
- Add medicine reminders
- Mark taken/pending
- Delete items
- Persist state in Firebase or local store

6. System Health Awareness
- Health endpoint reports AI readiness and storage mode.

## 7. Functional Requirement Snapshot (SRS-Friendly)

### FR-01: User can search medicine alternatives
Input: medicine text query
Output: base medicine details, cheaper alternatives, saving hints

### FR-02: User can upload prescription image
Input: image file
Output: detected medicine list; user can click each item for focused results

### FR-03: User can perform AI analysis tasks
Input: module-specific form payload
Output: structured JSON response rendered in UI

### FR-04: User can manage medicine routine
Input: routine item operations
Output: saved and updated routine list

### FR-05: User can place orders
Input: customer details + cart items
Output: stored order with generated order id

### FR-06: System supports storage fallback
Condition: Firebase unavailable
Behavior: switch to local JSON storage and demo products

## 8. Non-Functional Requirements Snapshot

- Usability: simple, single-page interface with guided actions.
- Availability: local fallback mode prevents complete feature failure.
- Portability: works on Windows/macOS/Linux (Python + browser).
- Maintainability: modular backend endpoints and typed models.
- Performance: lightweight frontend with direct API calls.
- Safety note: informational support only, not a clinical substitute.

## 9. System Architecture

PharmaIQ follows a client-server model.

- Frontend
  - Single-page interface in `frontend/index.html`
  - React (UMD), Tailwind CSS, browser fetch API

- Backend
  - FastAPI service in `backend/main.py`
  - Pydantic request models in `backend/models.py`
  - Gemini integration in `backend/gemini_service.py`
  - Data layer in `backend/firebase_config.py`

- Data Layer
  - Primary: Firestore (if credentials available)
  - Fallback: `backend/local_store.json`
  - Demo catalog available when Firestore products are unavailable

## 10. Technology Stack

### Backend
- Python 3.8+
- FastAPI
- Uvicorn
- Pydantic
- google-generativeai (Gemini)
- firebase-admin
- python-dotenv

### Frontend
- HTML5 + CSS3 + JavaScript
- React 18 (browser UMD)
- Tailwind CSS (CDN)
- Font Awesome icons

## 11. Project Structure

```text
PharmaIQ/
	API_REFERENCE.md
	QUICKSTART.md
	README.md
	start.sh
	start.bat
	backend/
		main.py
		models.py
		gemini_service.py
		firebase_config.py
		requirements.txt
		serviceAccountKey.json      # optional, environment-specific
		local_store.json            # auto-created in local mode
	frontend/
		index.html
```

## 12. Installation and Setup

### 12.1 Prerequisites

- Python 3.8 or higher
- pip
- Internet connection for AI features
- Gemini API key
- Optional: Firebase service account JSON for Firestore mode

### 12.2 Quick Start (Recommended)

### macOS/Linux
```bash
cd PharmaIQ
bash start.sh
```

### Windows
```bat
cd PharmaIQ
start.bat
```

### 12.3 Manual Start

```bash
cd PharmaIQ/backend
pip install -r requirements.txt
python main.py
```

Backend default URL:
- http://localhost:8000

Swagger docs:
- http://localhost:8000/docs

Frontend:
- Open `frontend/index.html` in browser

## 13. Configuration

Create `.env` inside `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

### Important Notes
- If Firebase credentials are missing/invalid, system runs in local mode.
- If Gemini key is missing, AI endpoints will not provide useful responses.

## 14. API Overview

Base URL:
- http://localhost:8000/api

Main endpoint groups:
- AI: `/alternatives`, `/interactions`, `/symptoms`, `/dosage`, `/side-effects`, `/medicine-info`, `/chat`, `/scan-prescription`
- User/Routine: `/user/{user_id}`, routine CRUD endpoints
- Shop/Orders: `/products`, `/products/{product_id}`, `/orders`
- System: `/health`

For complete endpoint request/response examples, see `API_REFERENCE.md`.

## 15. Data and Storage Behavior

### Firebase Mode
- User, routine, order, and product data are read/written through Firestore collections.

### Local Mode
- User/routine/order data persist in `backend/local_store.json`.
- Product list is served from embedded demo product objects.

This behavior makes the system demo-friendly even without cloud dependencies.

## 16. Core User Flow

1. User opens frontend and health check runs automatically.
2. User uses any module (finder, scan, AI tools, routine, shop).
3. Frontend sends request to FastAPI backend.
4. Backend either:
   - queries Gemini for AI modules, and/or
   - reads/writes Firebase/local store for data modules.
5. Response is rendered immediately in UI cards/chips/tables.

## 17. Error Handling and Resilience

- Health endpoint reports backend and AI readiness.
- Frontend shows user-readable messages for unavailable backend.
- Scan flow handles quota errors and unreadable images.
- Backend uses structured HTTP errors for invalid requests.
- Storage fallback avoids total application failure.

## 18. Security, Privacy, and Ethics Notes

- No production-grade authentication is currently implemented.
- Do not store sensitive personal medical data in shared environments.
- AI outputs can be imperfect and must be clinically verified.
- Project is intended for educational and decision-support use only.

## 19. Testing and Validation Checklist

Use this checklist during demo/report submission:

- Backend starts without errors.
- `/api/health` returns status `ok`.
- Alternative finder returns product matches.
- Prescription scan detects medicine names from sample image.
- Clicking detected medicine chips filters to one medicine context.
- Routine CRUD works and persists after refresh.
- Order creation returns `order_id`.
- App still works when Firebase is disabled (local mode).

## 20. Known Limitations

- AI responses are model-generated and not guaranteed clinically accurate.
- OCR quality depends on prescription image clarity.
- No user authentication/role management.
- No payment gateway integration.
- Product dataset depends on Firebase/demo data completeness.

## 21. Future Enhancements

- Role-based authentication (patient/pharmacist/admin)
- Reminder notifications (push/SMS/email)
- Better OCR post-processing and medicine normalization
- Multilingual UI and voice interaction
- Analytics dashboard for adherence and trend monitoring
- Dockerized deployment and CI/CD pipeline

## 22. Academic Report Mapping Guidance

This README can be directly reused in SRS/report sections:
- Introduction: Sections 1-3
- Scope and Stakeholders: Sections 4-5
- Functional and Non-Functional Requirements: Sections 7-8
- System Design/Architecture: Sections 9-11
- Implementation and Setup: Sections 12-15
- Validation and Evaluation: Sections 16-19
- Limitations and Future Work: Sections 20-21

## 23. Disclaimer

PharmaIQ is an educational software project.
It is not a replacement for licensed medical diagnosis, prescription, or emergency care.

## 24. License

Educational use only unless explicitly relicensed by project owners.
