# ⚡ Quick Start Guide

Get PharmaIQ running in 5 minutes!

## Step 1: Get a Gemini API Key (FREE)

1. Go to: https://ai.google.dev/
2. Click "Get API Key"
3. Copy your API key

## Step 2: Configure the App

```bash
cd PharmaIQ/backend
```

Open `.env` file and replace:
```
GEMINI_API_KEY=paste_your_key_here
```

## Step 3: Run the Server

### On Mac/Linux:
```bash
cd PharmaIQ
bash start.sh
```

### On Windows:
```bash
cd PharmaIQ
start.bat
```

### Manual start (any OS):
```bash
cd PharmaIQ/backend
pip install -r requirements.txt
python main.py
```

Wait for:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 4: Open the UI

**Drag and drop to browser:**
```
PharmaIQ/frontend/index.html
```

Or open in your browser:
```
file:///path/to/PharmaIQ/frontend/index.html
```

You should see the PharmaIQ interface! ✅

## What You Can Do

- 💊 **Symptom Analysis** - Describe symptoms, get AI diagnosis
- 🔍 **Medicine Lookup** - Search any medicine for info
- 📊 **Dosage Calculator** - Get personalized dosages
- ⚠️ **Interaction Checker** - Check drug interactions
- 🛒 **Shop** - Browse health products
- 💬 **Chat** - Talk with AI assistant

## Troubleshooting

**"Backend not connecting"**
- Make sure Python server is running on http://localhost:8000
- Check console for errors

**"API Key error"**
- Get key from https://ai.google.dev/
- Make sure it's pasted correctly in `.env`
- No spaces or quotes needed

**"Can't open HTML file"**
- Drag index.html into browser window
- Or right-click → Open with → Browser
- Don't double-click on Mac (use right-click → Open)

## API Documentation

Full API docs available at:
```
http://localhost:8000/docs
```

See `API_REFERENCE.md` for detailed endpoint documentation.

## Project Structure

```
PharmaIQ/
├── frontend/index.html      ← Open this in browser
├── backend/
│   ├── main.py             ← Flask API server
│   ├── requirements.txt     ← Dependencies
│   ├── .env                ← Your API keys
│   └── ...
├── README.md               ← Full documentation
└── API_REFERENCE.md        ← API docs
```

## What's Included

✅ Beautiful modern UI (Tailwind CSS)
✅ AI-powered analysis (Google Gemini)
✅ Drug interaction checking
✅ Dosage calculations
✅ Product shop
✅ Chat assistant
✅ Fully responsive design
✅ No authentication needed

## Next Steps

1. ✅ Get API key
2. ✅ Run the server
3. ✅ Open frontend
4. ✅ Start exploring!

## Need Help?

- Check README.md for full documentation
- See API_REFERENCE.md for endpoint details
- Review error messages in browser console (F12)
- Check backend console for errors

---

**Enjoy PharmaIQ! 🏥✨**
