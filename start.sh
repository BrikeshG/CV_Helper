#!/bin/bash

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  WARNING: backend/.env file not found!"
    echo "Please create 'backend/.env' and add your OPENAI_API_KEY before running."
    echo "Example: OPENAI_API_KEY=sk-..."
    echo ""
fi

echo "🚀 Starting AI CV Generator..."

# Start Backend in background
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Start Frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend running on PID $BACKEND_PID"
echo "Frontend running on PID $FRONTEND_PID"
echo ""
echo "🌍 Open http://localhost:5173 to use the app."
echo "Press CTRL+C to stop both servers."

# Trap CTRL+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

wait
