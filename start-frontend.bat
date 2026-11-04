@echo off
echo Starting UrbanFlood AI Frontend on http://127.0.0.1:5173 ...
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0frontend"
call "C:\Program Files\nodejs\npm.cmd" run dev
