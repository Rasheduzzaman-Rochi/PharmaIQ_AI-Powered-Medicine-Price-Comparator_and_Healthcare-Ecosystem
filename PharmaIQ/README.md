# PharmaIQ - Full Stack Medical Consultation Platform

A complete pharmaceutical consultation platform with AI-powered diagnosis, drug interaction checking, dosage calculation, and medicine shopping.

## Features

- 🏥 **Symptom Analyzer** - AI-powered symptom analysis with condition suggestions
- 💊 **Medicine Information** - Comprehensive drug database and information
- ⚠️ **Drug Interactions** - Check for dangerous drug interactions
- 📊 **Dosage Calculator** - Personalized dosage recommendations
- 🛒 **Online Shop** - Health and wellness product marketplace
- 💬 **Chat Assistant** - 24/7 medical assistant chatbot
- 📈 **Dashboard** - Health metrics and adherence tracking

## Prerequisites

- Python 3.8+
- Node.js (optional, for frontend bundling)
- Firebase account (for Firestore database)
- Google Gemini API key

## Installation

### 1. Clone/Setup Project

```bash
cd PharmaIQ
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create `.env` file in `backend/` with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

**To get Gemini API Key:**
1. Go to https://ai.google.dev/
2. Sign in with Google account
3. Create an API key
4. Paste it in `.env`

**Firebase Setup (Optional - works with demo data if not configured):**
1. Go to https://console.firebase.google.com/
2. Create new project
3. Download service account JSON
4. Save as `backend/serviceAccountKey.json`
5. Update `FIREBASE_CREDENTIALS_PATH` in `.env`

### 4. Run Backend

```bash
cd backend
python main.py
```

Server will start at: **http://localhost:8000**

### 5. Open Frontend

Open `frontend/index.html` in a web browser:
```bash
cd frontend
open index.html
# or use any browser to open the file
```

Frontend connects to: **http://localhost:8000/api**

## API Endpoints

### AI Analysis Endpoints
- `POST /api/symptoms` - Analyze symptoms
- `POST /api/interactions` - Check drug interactions
- `POST /api/medicine-info` - Get medicine information
- `POST /api/dosage` - Calculate dosage
- `POST /api/side-effects` - Predict side effects
- `POST /api/chat` - Chat assistant

### Data Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product details
- `GET /api/user/{user_id}` - Get user data
- `POST /api/user/{user_id}/routine` - Add routine item

### System
- `GET /api/health` - Health check

## File Structure

```
PharmaIQ/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── firebase_config.py      # Firebase initialization
│   ├── gemini_service.py       # Gemini API integration
│   ├── models.py               # Pydantic data models
│   └── .env                    # Environment variables
├── frontend/
│   └── index.html              # Complete responsive UI
└── README.md                   # This file
```

## Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Google Generative AI** - Gemini API for AI responses
- **Firebase Admin** - Firestore database

### Frontend
- **Tailwind CSS** - Utility-first CSS
- **Lucide Icons** - Beautiful SVG icons
- **Vanilla JavaScript** - No frameworks, lightweight

## Troubleshooting

### Backend not connecting
```
✗ Make sure Python server is running on http://localhost:8000
✗ Check console for errors
✗ Verify GEMINI_API_KEY is set correctly
```

### Frontend not loading
```
✗ Ensure you're opening index.html (can drag into browser)
✗ Check browser console for error messages
✗ Verify backend URL is correct in script
```

### Gemini API errors
```
✗ Check API key is valid and has quota
✗ Ensure gemini-1.5-flash model is available
✗ Check internet connection
```

### Firebase connection issues
```
✗ If Firebase not configured, app uses demo data
✗ Optional - only needed for persistent data storage
```

## Usage

1. **Dashboard** - View health metrics and tips
2. **Symptom Analyzer** - Describe symptoms, get AI analysis
3. **Medicine Information** - Search any medicine for details
4. **Dosage Calculator** - Get personalized dosage recommendations
5. **Check Interactions** - Enter medicines to check for interactions
6. **Shop** - Browse and purchase health products
7. **Chat** - Talk with AI assistant

## Demo Mode

The app works with **demo data** if Firebase is not configured:
- Demo products are included
- All AI features work with Gemini API
- User data is stored locally

## Important Disclaimers

⚠️ **This is an educational tool for demonstration purposes only.**
- Not a substitute for professional medical advice
- Always consult a healthcare professional
- For emergency situations, call emergency services

## Development

To modify the UI, edit `frontend/index.html`
To add new features, add endpoints to `backend/main.py`

## License

This project is for educational purposes only.

## Support

For issues or questions, check the troubleshooting section or review the code comments.
