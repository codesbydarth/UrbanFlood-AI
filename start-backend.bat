@echo off
echo Starting UrbanFlood AI Backend on http://127.0.0.1:8000 ...
cd /d "%~dp0"
"D:\PythonEmbed\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
