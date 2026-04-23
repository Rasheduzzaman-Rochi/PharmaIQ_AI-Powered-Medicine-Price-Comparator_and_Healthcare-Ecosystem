#!/bin/bash

echo "🏥 PharmaIQ - Quick Start"
echo "=============================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd backend
pip install -q -r requirements.txt

# Check .env
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  .env file not found. Creating template..."
    cp .env.template .env 2>/dev/null || cat > .env << 'EOF'
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
EOF
    echo "   Edit .env and add your GEMINI_API_KEY"
fi

# Start backend
echo ""
echo "🚀 Starting PharmaIQ Backend..."
echo "   Server: http://localhost:8000"
echo "   Frontend: Open frontend/index.html in your browser"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 main.py
